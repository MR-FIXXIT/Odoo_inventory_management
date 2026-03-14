from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductCategoryViewSet, ProductViewSet, WarehouseViewSet, LocationViewSet,
    StockOnHandViewSet, InventoryOperationViewSet, StockMoveViewSet,
    ReorderRuleViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'stock', StockOnHandViewSet, basename='stock-on-hand')
router.register(r'operations', InventoryOperationViewSet, basename='inventory-operation')
router.register(r'moves', StockMoveViewSet, basename='stock-move')
router.register(r'reorder-rules', ReorderRuleViewSet, basename='reorder-rule')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/kpis/', DashboardViewSet.as_view({'get': 'kpis'}), name='dashboard-kpis'),
]
