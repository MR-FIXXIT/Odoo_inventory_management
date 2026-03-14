from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils import timezone


class ProductCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ('name',)
        verbose_name_plural = 'Product Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.BigAutoField(primary_key=True)
    sku = models.CharField(
        max_length=100, unique=True, db_index=True, help_text="Stock Keeping Unit / Code"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        ProductCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products'
    )
    unit_of_measure = models.CharField(max_length=50, help_text="e.g., units, kg, meters")
    reorder_level = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0.00"),
        help_text="Alert when total stock falls below this"
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="products_created",
    )

    class Meta:
        ordering = ('sku',)
        indexes = [models.Index(fields=['sku', 'name'])]

    def __str__(self):
        return f"{self.sku} - {self.name}"

    @property
    def total_stock(self):
        """Sum of qty_on_hand across all locations."""
        total = self.stock_on_hand.aggregate(total=models.Sum('qty_on_hand'))['total']
        return total or Decimal("0")

    @property
    def is_low_stock(self):
        return self.total_stock < self.reorder_level and self.reorder_level > 0


class Warehouse(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text="Short code e.g., WH1, MAIN")
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Location(models.Model):
    class LocationType(models.TextChoices):
        SHELF = 'SHELF', 'Shelf'
        RACK = 'RACK', 'Rack'
        ZONE = 'ZONE', 'Zone'
        FLOOR = 'FLOOR', 'Floor'
        DOCK = 'DOCK', 'Dock (Receiving/Shipping)'
        OTHER = 'OTHER', 'Other'

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name='locations'
    )
    location_type = models.CharField(
        max_length=10, choices=LocationType.choices, default=LocationType.SHELF
    )
    description = models.TextField(blank=True)

    class Meta:
        ordering = ('warehouse', 'name')
        unique_together = ('warehouse', 'name')

    def __str__(self):
        return f"{self.warehouse.code}/{self.name}"


class StockOnHand(models.Model):
    """Tracks current quantity of a product at a specific location."""
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='stock_on_hand'
    )
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name='stock_on_hand'
    )
    qty_on_hand = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0.00")
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'location')
        indexes = [models.Index(fields=['product', 'location'])]

    def __str__(self):
        return f"{self.product.sku} @ {self.location}: {self.qty_on_hand}"


class InventoryOperation(models.Model):
    """Central document for receipts, deliveries, internal transfers, and adjustments."""

    class OpType(models.TextChoices):
        RECEIPT = 'RECEIPT', 'Receipt'
        DELIVERY = 'DELIVERY', 'Delivery Order'
        INTERNAL = 'INTERNAL', 'Internal Transfer'
        ADJUSTMENT = 'ADJUSTMENT', 'Stock Adjustment'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        WAITING = 'WAITING', 'Waiting'
        READY = 'READY', 'Ready'
        DONE = 'DONE', 'Done'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.BigAutoField(primary_key=True)
    reference = models.CharField(
        max_length=50, unique=True, editable=False,
        help_text="Auto-generated reference e.g., REC-00001"
    )
    op_type = models.CharField(max_length=12, choices=OpType.choices)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.DRAFT
    )
    partner_name = models.CharField(
        max_length=200, blank=True,
        help_text="Supplier (for receipts) or Customer (for deliveries)"
    )
    source_location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='operations_from'
    )
    destination_location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='operations_to'
    )
    scheduled_date = models.DateField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='operations_created'
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=['op_type', 'status']),
            models.Index(fields=['status', 'scheduled_date']),
        ]

    def save(self, *args, **kwargs):
        if not self.reference:
            prefix_map = {
                'RECEIPT': 'REC',
                'DELIVERY': 'DEL',
                'INTERNAL': 'INT',
                'ADJUSTMENT': 'ADJ',
            }
            prefix = prefix_map.get(self.op_type, 'OP')
            last = InventoryOperation.objects.filter(
                op_type=self.op_type
            ).order_by('-id').first()
            next_num = (last.id + 1) if last else 1
            self.reference = f"{prefix}-{next_num:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} ({self.get_op_type_display()}) - {self.get_status_display()}"


class OperationLine(models.Model):
    """A single product line within an InventoryOperation."""
    id = models.BigAutoField(primary_key=True)
    operation = models.ForeignKey(
        InventoryOperation, on_delete=models.CASCADE, related_name='lines'
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name='operation_lines'
    )
    demanded_qty = models.DecimalField(
        max_digits=18, decimal_places=4,
        help_text="How many units were expected/requested"
    )
    done_qty = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0.00"),
        help_text="How many units were actually processed"
    )

    class Meta:
        ordering = ('id',)

    def __str__(self):
        return f"{self.product.sku} x {self.demanded_qty} (done: {self.done_qty})"


class StockMove(models.Model):
    """Immutable stock movement ledger. Every stock change creates a record here."""
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name='stock_moves'
    )
    source_location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='moves_out'
    )
    destination_location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='moves_in'
    )
    quantity = models.DecimalField(max_digits=18, decimal_places=4)
    operation = models.ForeignKey(
        InventoryOperation, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_moves'
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=['product', 'created_at']),
            models.Index(fields=['operation']),
        ]

    def __str__(self):
        src = self.source_location or 'External'
        dst = self.destination_location or 'External'
        return f"{self.product.sku}: {self.quantity} ({src} → {dst})"


class ReorderRule(models.Model):
    """Defines reorder thresholds for a product at a warehouse."""
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='reorder_rules'
    )
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name='reorder_rules'
    )
    min_qty = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0.00"),
        help_text="Reorder when stock falls below this"
    )
    max_qty = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0.00"),
        help_text="Reorder up to this quantity"
    )
    reorder_qty = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0.00"),
        help_text="Quantity to reorder"
    )

    class Meta:
        unique_together = ('product', 'warehouse')

    def __str__(self):
        return f"Reorder {self.product.sku} @ {self.warehouse.code}: min={self.min_qty}"
