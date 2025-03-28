from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    # Product status choices
    LIVE = 0
    DELETE = 1
    DELETE_CHOICES = (
        (LIVE, 'Live'),
        (DELETE, 'Delete')
    )

    # Core Product Fields
    name = models.CharField(max_length=255)  # Product name
    description = models.TextField()  # Detailed description
    category = models.CharField(max_length=100)  # Category like 'Painkillers', 'Vitamins'
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price of the product
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)  # Available stock
    status = models.IntegerField(choices=DELETE_CHOICES, default=LIVE)  # Status (Live/Delete)
    created_at = models.DateTimeField(auto_now_add=True)  # Creation date
    updated_at = models.DateTimeField(auto_now=True)  # Last updated date

    # Image Fields
    main_image = models.ImageField(upload_to='products/main_images/', blank=True, null=True)  # Main product image
    additional_images = models.JSONField(blank=True, null=True)  # URLs or paths for additional images

    # Metadata
    is_featured = models.BooleanField(default=False)  # Highlighted product (optional)

    def __str__(self):
        return self.name


class OrderAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    address_line = models.CharField(max_length=255, blank=True, null=True)  # Example
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    alternate_phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.address_line}, {self.city}, {self.state}, {self.country}"

class Order(models.Model):
    # Order status choices
    PENDING = 'Pending'
    COMPLETED = 'Completed'
    CANCELLED = 'Cancelled'
    STATUS_CHOICES = (
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who placed the order
    order_address = models.ForeignKey(OrderAddress, on_delete=models.SET_NULL, null=True)
    products = models.ManyToManyField(Product, through='OrderItem')  # Ordered products
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # Total price of the order
    status = models.CharField(choices=STATUS_CHOICES, max_length=20, default=PENDING)  # Order status
    payment_id = models.CharField(max_length=100, blank=True, null=True)  # Stripe payment ID
    created_at = models.DateTimeField(auto_now_add=True)  # Order creation date
    updated_at = models.DateTimeField(auto_now=True)  # Last updated date

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)  # Price at the time of order

    def __str__(self):
        return f"{self.quantity} x {self.product.name} at {self.price}"

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who made the payment
    order = models.ForeignKey(Order, on_delete=models.CASCADE)  # Associated order
    stripe_payment_id = models.CharField(max_length=100)  # Stripe payment ID
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Payment amount
    status = models.CharField(max_length=50, default='Pending')  # Payment status
    created_at = models.DateTimeField(auto_now_add=True)  # Payment date

    def __str__(self):
        return f"Payment {self.stripe_payment_id} by {self.user.username}"


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
    

