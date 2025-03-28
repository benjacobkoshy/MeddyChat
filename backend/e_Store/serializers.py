from rest_framework import serializers
from .models import Product, Cart, Order, OrderAddress, OrderItem
from authentication.models import CustomerProfile

class ProductSerializer(serializers.ModelSerializer):
    # Custom validation for the main image
    def validate_main_image(self, value):
        if value.size > 5 * 1024 * 1024:  # 5 MB limit
            raise serializers.ValidationError("Image size must be under 5 MB.")
        if not value.content_type.startswith('image/'):
            raise serializers.ValidationError("Only image files are allowed.")
        return value
    
    def validate(self, data):
        if data['stock'] < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        if data['price'] <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return data

    class Meta:
        model = Product
        fields = '__all__'  # Or list specific fields, e.g., ['id', 'name', 'price', 'main_image', 'additional_images']

class CartSerializer(serializers.ModelSerializer):
    product_id = serializers.ReadOnlyField(source='product.id')
    product_name = serializers.ReadOnlyField(source='product.name')  # Name of the product
    product_price = serializers.ReadOnlyField(source='product.offer_price')  # Price of the product
    product_original_price = serializers.ReadOnlyField(source='product.price')
    product_image = serializers.ImageField(source='product.main_image')  # Image of the product

    class Meta:
        model = Cart
        fields = ['id', 'product_name', 'product_price', 'product_original_price' , 'product_image', 'quantity','product_id']


class OrderAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderAddress
        fields = [
            "address_line",
            "city",
            "state",
            "zip_code",
            "country",
            "phone_number",
            "alternate_phone_number",
        ]


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            "name",
            "address",
            "phone_number",
            "alternate_phone_number",
            "place",
            "pin",
            "dob",
            "blood_group",
            "gender",
            "role",
        ]




class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for Order Items to include full product details."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.offer_price', max_digits=10, decimal_places=2, read_only=True)  # Ensure offer_price exists
    product_image = serializers.ImageField(source='product.main_image', read_only=True)  # Ensure main_image exists

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'product_price', 'product_image']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Orders, including products and address details."""
    
    order_address = serializers.StringRelatedField()  # Returns address as string
    products = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)  # Fetch products from OrderItem

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "order_address",
            "products",
            "total_price",
            "status",
            "payment_id",
            "created_at",
            "updated_at",
        ]