from django.contrib import admin
from .models import (
    ProductCategory, Product, Warehouse, Location,
    StockOnHand, InventoryOperation, OperationLine,
    StockMove, ReorderRule
)

admin.site.register(ProductCategory)
admin.site.register(Product)
admin.site.register(Warehouse)
admin.site.register(Location)
admin.site.register(StockOnHand)
admin.site.register(InventoryOperation)
admin.site.register(OperationLine)
admin.site.register(StockMove)
admin.site.register(ReorderRule)
