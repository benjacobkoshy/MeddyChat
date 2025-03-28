from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import ProductListView, ProductDetailView, ManageAddressView, get_stripe_key,create_payment_intent, handle_payment, fetch_payment_status, CustomerOrderListView
from . import views

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('add-to-cart/<int:product_id>/<int:quantity>/', views.addToCart, name='add_to_cart'),
    path('add-to-wishlist/<int:product_id>/', views.addToWishlist, name='add_to_wishlist'),
    path('list-cart-products/', views.listCartProducts,name='list_cart_product'),
    path('list-wishlist-products/', views.listWishlistProducts,name='list_cart_product'),
    path('manage-address/', ManageAddressView.as_view(), name='manage-address'),
    path('get-stripe-key/',get_stripe_key, name="stripe_key"),
    path('create-payment-intent/',create_payment_intent, name="create-payment-intent"),
    path('payment-status/', fetch_payment_status,name="payment_status"),
    path('handle-payment/', handle_payment,name="handle_payment"),

    path('list-order/', CustomerOrderListView.as_view(),name="list-order"),

    
    


]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)