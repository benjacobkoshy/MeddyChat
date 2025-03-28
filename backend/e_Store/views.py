from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView        
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Product, Cart, Wishlist, OrderAddress, Order, OrderItem, Payment
from authentication.models import CustomerProfile
from .serializers import ProductSerializer, CartSerializer, OrderAddressSerializer, CustomerProfileSerializer, OrderSerializer
from django.contrib.auth.models import User
from django.conf import settings
import stripe
from django.views.decorators.csrf import csrf_exempt
import json
from django.db import transaction
from django.db.models import Q
from home.models import Notification

# View for listing and filtering products
class ProductListView(ListAPIView):
    queryset = Product.objects.filter(status=Product.LIVE)  # Only live products
    serializer_class = ProductSerializer
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'category']  # Fields to search
    filterset_fields = ['category', 'is_featured']  # Fields to filter
    ordering_fields = ['price', 'created_at']  # Fields to sort by
    ordering = ['created_at']  # Default ordering
    permission_classes = [IsAuthenticated]  # Enforce authentication

    def get_queryset(self):
        """
        Modify queryset to filter products dynamically based on search query.
        """
        query = self.request.query_params.get('name', None)
        queryset = Product.objects.filter(status=Product.LIVE)  # Always apply 'LIVE' filter

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | Q(category__icontains=query)
            )  # Use `icontains` for partial matches

        return queryset  # Return the refined queryse
# View for retrieving a single product's details

class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.filter(status=Product.LIVE)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]  # Enforce authentication





@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def addToCart(request, product_id, quantity):
    # Ensure the product exists
    product = get_object_or_404(Product, id=product_id)

    # print("user",request.user,"product id",product_id,"quantity",quantity)

    if request.method == 'POST':
        # Handle adding the product to the cart
        cart_item, created = Cart.objects.get_or_create(user=request.user, product=product)

        if not created:
            # Product already exists in the cart
            return JsonResponse(
                {'message': 'Product is already in the cart.', 'cart_id': cart_item.id},
                status=200
            )
        
        # Initialize quantity for the newly added product
        cart_item.quantity = quantity
        cart_item.save()

        return JsonResponse(
            {'message': 'Product added to cart successfully!', 'cart_id': cart_item.id},
            status=201
        )

    elif request.method == 'DELETE':
        # Handle removing the product from the cart
        try:
            # Attempt to retrieve the cart item
            cart_item = Cart.objects.get(user=request.user, product=product)
            
            # Delete the cart item
            cart_item.delete()
            return JsonResponse({'message': 'Product removed from cart successfully!'}, status=200)

        except Cart.DoesNotExist:
            # Return error if the cart item is not found
            return JsonResponse({'error': 'Product not found in cart.'}, status=404)

    # Return a 405 Method Not Allowed response for unsupported methods
    return JsonResponse({'error': 'Invalid request method.'}, status=405)




@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def addToWishlist(request, product_id):
    # Ensure user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You must be logged in to manage your wishlist.'}, status=401)

    # Retrieve the product
    product = get_object_or_404(Product, id=product_id)


    if request.method == 'POST':
        # Add the product to the wishlist
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        
        return JsonResponse({'message': 'Product added to wishlist successfully!', 'wishlist_id': wishlist_item.id})

    elif request.method == 'DELETE':
        # Remove the product from the wishlist
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, product=product)
            wishlist_item.delete()
            return JsonResponse({'message': 'Product removed from wishlist successfully!'}, status=200)
        except Wishlist.DoesNotExist:
            return JsonResponse({'error': 'Product not found in your wishlist.'}, status=404)

    # If the request method is not allowed
    return JsonResponse({'error': 'Invalid request method.'}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listCartProducts(request):
    try:
        # Get all cart items for the authenticated user
        cart_items = Cart.objects.filter(user=request.user)
        
        # Serialize the cart items
        serializer = CartSerializer(cart_items, many=True)
        
        # Return the serialized data as a JSON response
        return JsonResponse({'cart_products': serializer.data}, status=200)
    except Exception as e:
        return JsonResponse({'error': 'Failed to retrieve cart products.', 'details': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listWishlistProducts(request):
    try:
        # Get all cart items for the authenticated user
        wishlist_items = Wishlist.objects.filter(user=request.user)
        
        # Serialize the cart items
        serializer = CartSerializer(wishlist_items, many=True)
        
        # Return the serialized data as a JSON response
        return JsonResponse({'cart_products': serializer.data}, status=200)
    except Exception as e:
        return JsonResponse({'error': 'Failed to retrieve cart products.', 'details': str(e)}, status=500)
    


class ManageAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # print("Inside address view")
        order_address = OrderAddress.objects.filter(user=request.user, is_default=True).first()
        customer_profile = CustomerProfile.objects.filter(user=request.user).first()

        # print("Order Address:", order_address)
        # print("Customer Profile:", customer_profile)


        # If no default address, fallback to customer profile
        if not order_address and customer_profile:
            print(customer_profile.phone_number)
            return Response({
                "order_address": {
                    "addressLine": customer_profile.address,
                    "city": "",
                    "state": customer_profile.place,
                    "zipCode": customer_profile.pin,
                    "country": "India",
                    "phone_number": customer_profile.phone_number,
                    "alternate_phone_number": customer_profile.alternate_phone_number,

                },
              
                "profile": CustomerProfileSerializer(customer_profile).data,
            })
                

        if order_address:
            return Response({
                "order_address": OrderAddressSerializer(order_address).data,
                "profile": CustomerProfileSerializer(customer_profile).data if customer_profile else None,
            })

        return Response({"message": "No address or profile data found."}, status=404)

    def post(self, request):
        # print('User',request.user)
        data = request.data.get("order_address", {})
        user = request.user

        # Fetch or create the default address
        order_address, created = OrderAddress.objects.get_or_create(
            user=user,
            is_default=True,
            defaults={
                "address_line": "",
                "city": "",
                "state": "",
                "zip_code": "",
                "country": "",
                "phone_number": "",
                "alternate_phone_number": "",
            }
        )


        serializer = OrderAddressSerializer(order_address, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@csrf_exempt
def get_stripe_key(request):
    # print("publishableKey",settings.STRIPE_PUBLISHABLE_KEY)
    return JsonResponse({"publishableKey": settings.STRIPE_PUBLISHABLE_KEY})




stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def create_payment_intent(request):
    if request.method == 'POST':
        # print("Stripe API Key:", stripe.api_key)
        try:
            data = json.loads(request.body)
            # print("Request data:", data)
            
            amount = data.get('amount', 0)
            if amount <= 0:
                print("Invalid amount received:", amount)
                return JsonResponse({'error': 'Invalid amount'}, status=400)

            # Create a PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount,  # Amount in paise (₹)
                currency='inr',
                payment_method_types=['card'],  # Add 'netbanking', 'card', 'upi' etc., if needed
            )
            # print("PaymentIntent created:", intent)
            return JsonResponse(intent)
        except Exception as e:
            # print("Error creating PaymentIntent:", str(e))
            return JsonResponse({'error': str(e)}, status=500)
    else:
        # print("Invalid request method:", request.method)
        return JsonResponse({'error': 'Invalid request method. Only POST is allowed.'}, status=405)


@csrf_exempt
@api_view(['GET', 'POST'])
@transaction.atomic
@permission_classes([IsAuthenticated])
def handle_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Received data:", data)
            user = request.user  # Authenticated user
            print("Authenticated user:", user)

            stripe_payment_id = data.get('stripe_payment_id')
            amount = float(data.get('amount'))
            method_of_ordering = data.get('method_of_ordering')

            print(f"stripe_payment_id: {stripe_payment_id}, amount: {amount}, method_of_ordering: {method_of_ordering}")

            if not stripe_payment_id:
                return JsonResponse({'error': 'Stripe payment ID is required'}, status=400)
            if not amount or not isinstance(amount, (int, float)):
                return JsonResponse({'error': 'Valid amount is required'}, status=400)
            if method_of_ordering not in ['cart', 'product']:
                return JsonResponse({'error': 'Invalid method of ordering'}, status=400)

            # Additional Debug Logs for Cart and Product Orders
            if method_of_ordering == 'cart':
                print("Processing cart order")
                order = create_order_from_cart(user, payment_status='Completed')
            elif method_of_ordering == 'product':
                product_id = data.get('product_id')
                print(f"Processing single product order with product_id: {product_id}")
                if not product_id:
                    return JsonResponse({'error': 'Product ID required for single product orders'}, status=400)

                product = Product.objects.get(id=product_id)
                order = Order.objects.create(
                    user=user,
                    total_price=product.price,
                    status="Pending",  # Matches the `status` field
                    payment_id=stripe_payment_id  # Store payment ID if needed
                )
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=1,
                    price=product.price,
                )

            # Create a Payment record
            payment = Payment.objects.create(
                user=user,
                order=order,
                stripe_payment_id=stripe_payment_id,
                amount=amount,
                status='Completed',
            )

            print("Payment successfully processed:", payment.id)
            return JsonResponse({'message': 'Payment processed successfully', 'payment_id': payment.id})

        except Exception as e:
            print("Error processing payment:", str(e))
            return JsonResponse({'error': f'Error processing payment: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


from rest_framework import status
from django.utils.timezone import now

@transaction.atomic
def create_order_from_cart(user, payment_status):
    cart_items = Cart.objects.filter(user=user)
    
    if not cart_items.exists():  # Use `exists()` instead of evaluating as a boolean
        raise ValueError("No items in the cart.")

    total_price = sum(item.product.price * item.quantity for item in cart_items)

    # ✅ Ensure status matches the model field choices
    order = Order.objects.create(
        user=user,
        total_price=total_price,
        status="pending",  # Ensure this matches `Order.STATUS_CHOICES`
    )

    # ✅ Create Order Items
    order_items = [
        OrderItem(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price,
        )
        for item in cart_items
    ]
    OrderItem.objects.bulk_create(order_items)  # Efficient bulk insert

    cart_items.delete()

    # ✅ Fetch Customer Profile Correctly
    customer_profile = CustomerProfile.objects.filter(user=user).first()
    if customer_profile:
        Notification.objects.create(
            customer=customer_profile,
            title="Order Placed Successfully",
            content=f"Your order of ₹{total_price} has been placed.",
            created_at=now(),  # Assuming Notification model has a `created_at` field
        )

    return order  # Ensure this function returns the created Order object





@csrf_exempt
def fetch_payment_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_id = data.get('paymentId')

            if not payment_id:
                return JsonResponse({'error': 'Missing paymentId'}, status=400)

            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            return JsonResponse({'status': payment_intent['status']}, status=200)

        except stripe.error.StripeError as e:
            return JsonResponse({'error': f'Stripe error: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


class CustomerOrderListView(ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user  # Assuming authentication is enabled
        return Order.objects.filter(user=user)
    


