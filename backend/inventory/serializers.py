from rest_framework import serializers
from .models import (
    ProductCategory, Product, Warehouse, Location,
    StockOnHand, InventoryOperation, OperationLine,
    StockMove, ReorderRule
)
from django.contrib.auth import get_user_model

User = get_user_model()


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_stock = serializers.DecimalField(max_digits=18, decimal_places=4, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'category', 'category_name',
            'unit_of_measure', 'reorder_level', 'total_stock', 'is_low_stock',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'address', 'is_active']


class LocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = Location
        fields = ['id', 'name', 'warehouse', 'warehouse_name', 'location_type', 'description']


class StockOnHandSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    warehouse_name = serializers.CharField(source='location.warehouse.name', read_only=True)

    class Meta:
        model = StockOnHand
        fields = [
            'id', 'product', 'product_sku', 'product_name',
            'location', 'location_name', 'warehouse_name',
            'qty_on_hand', 'updated_at'
        ]


class OperationLineSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    uom = serializers.CharField(source='product.unit_of_measure', read_only=True)

    class Meta:
        model = OperationLine
        fields = ['id', 'product', 'product_sku', 'product_name', 'uom', 'demanded_qty', 'done_qty']


class InventoryOperationSerializer(serializers.ModelSerializer):
    lines = OperationLineSerializer(many=True, required=False)
    source_location_name = serializers.CharField(source='source_location.name', read_only=True)
    destination_location_name = serializers.CharField(source='destination_location.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = InventoryOperation
        fields = [
            'id', 'reference', 'op_type', 'status', 'partner_name',
            'source_location', 'source_location_name',
            'destination_location', 'destination_location_name',
            'scheduled_date', 'completed_date', 'notes',
            'created_by', 'created_by_name', 'created_at', 'lines'
        ]
        read_only_fields = [
            'id', 'reference', 'status', 'completed_date',
            'created_by', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        user = self.context.get('request').user if self.context.get('request') else None
        
        operation = InventoryOperation.objects.create(created_by=user, **validated_data)
        
        for line_data in lines_data:
            OperationLine.objects.create(operation=operation, **line_data)
            
        return operation

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if lines_data is not None:
            # Simple replacement strategy for lines on update if operation is not DONE
            if instance.status != InventoryOperation.Status.DONE:
                instance.lines.all().delete()
                for line_data in lines_data:
                    OperationLine.objects.create(operation=instance, **line_data)
                    
        return instance


class StockMoveSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    source_location_name = serializers.CharField(source='source_location.name', read_only=True)
    destination_location_name = serializers.CharField(source='destination_location.name', read_only=True)
    operation_reference = serializers.CharField(source='operation.reference', read_only=True)

    class Meta:
        model = StockMove
        fields = [
            'id', 'product', 'product_sku', 'product_name',
            'source_location', 'source_location_name',
            'destination_location', 'destination_location_name',
            'quantity', 'operation', 'operation_reference',
            'notes', 'created_at'
        ]


class ReorderRuleSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = ReorderRule
        fields = [
            'id', 'product', 'product_sku', 'product_name',
            'warehouse', 'warehouse_name', 'min_qty', 'max_qty', 'reorder_qty'
        ]
