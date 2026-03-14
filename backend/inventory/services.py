from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import (
    InventoryOperation, OperationLine, StockOnHand, StockMove, Location
)


def update_stock(product, location, quantity_change):
    """
    Safely increments or decrements stock at a specific location.
    Creates the StockOnHand record if it doesn't exist.
    """
    if quantity_change == 0:
        return

    stock, created = StockOnHand.objects.get_or_create(
        product=product,
        location=location,
        defaults={'qty_on_hand': Decimal("0.00")}
    )
    stock.qty_on_hand += Decimal(str(quantity_change))
    stock.save()


@transaction.atomic
def validate_operation(operation, user=None):
    """
    Validates an InventoryOperation, applying the stock changes and generating StockMoves.
    State changes DRAFT/WAITING/READY -> DONE.
    """
    if operation.status == InventoryOperation.Status.DONE:
        raise ValueError("Operation is already validated (DONE).")
    if operation.status == InventoryOperation.Status.CANCELLED:
        raise ValueError("Cannot validate a cancelled operation.")

    # Apply changes based on operation type
    if operation.op_type == InventoryOperation.OpType.RECEIPT:
        if not operation.destination_location:
            raise ValueError("Receipts must have a destination location.")
        _process_receipt(operation, user)

    elif operation.op_type == InventoryOperation.OpType.DELIVERY:
        if not operation.source_location:
            raise ValueError("Deliveries must have a source location.")
        _process_delivery(operation, user)

    elif operation.op_type == InventoryOperation.OpType.INTERNAL:
        if not operation.source_location or not operation.destination_location:
            raise ValueError("Internal transfers must have both source and destination locations.")
        _process_internal_transfer(operation, user)

    elif operation.op_type == InventoryOperation.OpType.ADJUSTMENT:
        # Adjustment uses source OR destination depending on if it's positive or negative,
        # but typically we just supply a single location and the line defines the real qty.
        # We will iterate lines, find differences, and apply.
        _process_adjustment(operation, user)

    # Mark operation as DONE
    operation.status = InventoryOperation.Status.DONE
    operation.completed_date = timezone.now()
    operation.save()


def _process_receipt(operation, user):
    """Increase stock at destination location."""
    for line in operation.lines.all():
        if line.done_qty <= 0:
            continue
            
        update_stock(line.product, operation.destination_location, line.done_qty)
        
        # Log move
        StockMove.objects.create(
            product=line.product,
            source_location=None,  # External Vendor
            destination_location=operation.destination_location,
            quantity=line.done_qty,
            operation=operation,
            created_by=user,
            notes=f"Receipt from {operation.partner_name or 'Vendor'}"
        )


def _process_delivery(operation, user):
    """Decrease stock at source location."""
    for line in operation.lines.all():
        if line.done_qty <= 0:
            continue
            
        update_stock(line.product, operation.source_location, -line.done_qty)
        
        # Log move
        StockMove.objects.create(
            product=line.product,
            source_location=operation.source_location,
            destination_location=None,  # External Customer
            quantity=line.done_qty,
            operation=operation,
            created_by=user,
            notes=f"Delivery to {operation.partner_name or 'Customer'}"
        )


def _process_internal_transfer(operation, user):
    """Decrease source, increase destination."""
    for line in operation.lines.all():
        if line.done_qty <= 0:
            continue
            
        update_stock(line.product, operation.source_location, -line.done_qty)
        update_stock(line.product, operation.destination_location, line.done_qty)
        
        # Log move
        StockMove.objects.create(
            product=line.product,
            source_location=operation.source_location,
            destination_location=operation.destination_location,
            quantity=line.done_qty,
            operation=operation,
            created_by=user,
            notes="Internal Transfer"
        )


def _process_adjustment(operation, user):
    """
    Adjust stock based on the counted quantity in done_qty. 
    Difference = done_qty - theoretical_qty.
    """
    location = operation.source_location or operation.destination_location
    if not location:
        raise ValueError("Stock Adjustments require a location (source or destination).")

    for line in operation.lines.all():
        # Get current theoretical stock
        try:
            current_stock = StockOnHand.objects.get(product=line.product, location=location).qty_on_hand
        except StockOnHand.DoesNotExist:
            current_stock = Decimal("0.00")
            
        # Physical counted stock
        counted_qty = line.done_qty
        diff = counted_qty - current_stock
        
        if diff == 0:
            continue

        update_stock(line.product, location, diff)

        # Log move depending on whether stock was added or removed
        src = None if diff > 0 else location
        dst = location if diff > 0 else None
        
        StockMove.objects.create(
            product=line.product,
            source_location=src,
            destination_location=dst,
            quantity=abs(diff),
            operation=operation,
            created_by=user,
            notes=f"Adjustment: {counted_qty} counted, difference of {diff}"
        )
