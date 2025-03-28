from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignUpForm
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.views.decorators.csrf import csrf_exempt

from .models import CustomerProfile
from django.db import transaction


@csrf_exempt
@api_view(['POST'])
def register(request):
    try:
        data = request.data
        name = data.get('name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Check for required fields
        if not username or not email or not password or not name:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user and profile within a transaction
        with transaction.atomic():
            user = User.objects.create_user(username=username, email=email, password=password)
            CustomerProfile.objects.create(user=user, name=name)

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error occurred: {e}")  # Log for debugging
        return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
def user_login(request):
    try:
        data = request.data
        print(data)
        username_or_email = data.get('username')
        password = data.get('password')

        # Validate required fields
        if not username_or_email or not password:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the username_or_email exists
        try:
            if '@' in username_or_email:  # Determine if input is an email
                user = User.objects.get(email=username_or_email)
                username = user.username
            else:
                username = username_or_email
        except User.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)  # Login the user
            user_profile = request.user.profile
            user_role = user_profile.role

            print(user_role)

             # Generate access and refresh tokens
            access_token = str(AccessToken.for_user(user))
            refresh_token = str(RefreshToken.for_user(user))

            # Check if the user's profile is verified
            if not hasattr(user, 'profile') or not user.profile.is_verified:
                return Response({
                    'message': 'Profile incomplete. Please complete your profile.',
                    'redirect': 'user_details',  # This key can guide the frontend
                    'role': user_role,
                    'access': access_token,
                    'refresh': refresh_token,
                }, status=status.HTTP_200_OK)

           

            return Response({
                'access': access_token,
                'role': user_role,
                'refresh': refresh_token,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error occurred: {e}")  # Log for debugging
        return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_details(request):
    try:
        user = request.user  # Get the logged-in user
        data = request.data
        user_profile = user.profile
        user_role = user_profile.role
        print(data)
        print(user)
        print(user_role)

        # Extract data from the request
        address = data.get('address')
        gender = data.get('gender')
        phone = data.get('phone_number')
        alt_phone = data.get('alternate_phone_number')
        place = data.get('place')
        pin = data.get('pin')
        dob = data.get('dob')
        blood_group = data.get('blood_group')
        medical_history = data.get('medical_history')


        # Validate required fields
        if not address or not phone or not pin or not dob or not blood_group:
            return Response(
                {'error': 'Missing required fields: address, phone, pin, dob, or blood group'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Check if the profile already exists
            profile, created = CustomerProfile.objects.get_or_create(user=user)

            # Update profile fields

            profile.address = address
            profile.gender = gender
            profile.phone_number = phone
            profile.alternate_phone_number = alt_phone
            profile.place = place
            profile.pin = pin
            profile.dob = dob
            profile.blood_group = blood_group
            profile.medical_history = medical_history
            profile.is_verified = True  # Mark as verified
            profile.save()

        message = 'Details saved successfully!' if created else 'Details updated successfully!'
        return Response({'message': message, 'role': user_role}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error occurred: {e}")
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': 'This is a protected view!'}, status=status.HTTP_200_OK)
