from django.db.models import Sum, Count, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import (
    ProductCategory, Product, Warehouse, Location,
    StockOnHand, InventoryOperation, StockMove, ReorderRule
)
from .serializers import (
    ProductCategorySerializer, ProductSerializer, WarehouseSerializer, LocationSerializer,
    StockOnHandSerializer, InventoryOperationSerializer, StockMoveSerializer, ReorderRuleSerializer
)
from .services import validate_operation


class IsInventoryManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'inventory_manager'


class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsInventoryManagerOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [IsInventoryManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['sku', 'name', 'description']
    ordering_fields = ['sku', 'name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsInventoryManagerOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'code']


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().select_related('warehouse')
    serializer_class = LocationSerializer
    permission_classes = [IsInventoryManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['warehouse', 'location_type']
    search_fields = ['name']


class StockOnHandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockOnHand.objects.all().select_related('product', 'location', 'location__warehouse')
    serializer_class = StockOnHandSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['product', 'location', 'location__warehouse']
    search_fields = ['product__sku', 'product__name']


class InventoryOperationViewSet(viewsets.ModelViewSet):
    queryset = InventoryOperation.objects.all().prefetch_related('lines', 'lines__product').select_related('source_location', 'destination_location', 'created_by')
    serializer_class = InventoryOperationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['op_type', 'status', 'source_location', 'destination_location']
    search_fields = ['reference', 'partner_name']
    ordering_fields = ['created_at', 'scheduled_date']

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        operation = self.get_object()
        try:
            validate_operation(operation, user=request.user)
            return Response({'status': 'validated', 'reference': operation.reference})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Validation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def mark_ready(self, request, pk=None):
        operation = self.get_object()
        if operation.status != InventoryOperation.Status.DRAFT:
            return Response({'error': 'Only DRAFT operations can be marked READY.'}, status=400)
        
        operation.status = InventoryOperation.Status.READY
        operation.save()
        return Response({'status': 'ready'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        operation = self.get_object()
        if operation.status == InventoryOperation.Status.DONE:
            return Response({'error': 'Cannot cancel a DONE operation.'}, status=400)
            
        operation.status = InventoryOperation.Status.CANCELLED
        operation.save()
        return Response({'status': 'cancelled'})


class StockMoveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMove.objects.all().select_related('product', 'source_location', 'destination_location', 'operation')
    serializer_class = StockMoveSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'source_location', 'destination_location', 'operation']
    search_fields = ['product__sku', 'product__name', 'notes']
    ordering_fields = ['created_at']


class ReorderRuleViewSet(viewsets.ModelViewSet):
    queryset = ReorderRule.objects.all().select_related('product', 'warehouse')
    serializer_class = ReorderRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'warehouse']


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def kpis(self, request):
        total_products = Product.objects.count()
        
        # Calculate low stock
        products = Product.objects.all()
        low_stock_count = sum(1 for p in products if p.is_low_stock)
        
        # Pending Receipts (DRAFT, WAITING, READY)
        pending_receipts = InventoryOperation.objects.filter(
            op_type=InventoryOperation.OpType.RECEIPT,
            status__in=[InventoryOperation.Status.DRAFT, InventoryOperation.Status.WAITING, InventoryOperation.Status.READY]
        ).count()
        
        # Pending Deliveries
        pending_deliveries = InventoryOperation.objects.filter(
            op_type=InventoryOperation.OpType.DELIVERY,
            status__in=[InventoryOperation.Status.DRAFT, InventoryOperation.Status.WAITING, InventoryOperation.Status.READY]
        ).count()
        
        # Pending Transfers
        pending_transfers = InventoryOperation.objects.filter(
            op_type=InventoryOperation.OpType.INTERNAL,
            status__in=[InventoryOperation.Status.DRAFT, InventoryOperation.Status.WAITING, InventoryOperation.Status.READY]
        ).count()

        return Response({
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'pending_receipts': pending_receipts,
            'pending_deliveries': pending_deliveries,
            'pending_transfers': pending_transfers
        })
