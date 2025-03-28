from django.contrib import admin

# Register your models here.
from .models import Product, Order, OrderItem, Payment, Cart, Wishlist, OrderAddress

admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Cart)
admin.site.register(Wishlist)
admin.site.register(OrderAddress)