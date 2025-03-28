from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt  
import requests
from authentication.models import CustomerProfile, Doctor
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from home.serializers import DoctorProfileSerializer, CustomerProfileSerializer

# CHATBOT_URL = "https://aec4-111-92-76-142.ngrok-free.app/webhooks/rest/webhook"
CHATBOT_URL = "http://localhost:5005/webhooks/rest/webhook"


@csrf_exempt  
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatBot(request):
    message = request.data.get('message', '').strip()  # Ensure message is not empty or None
    print(f"📩 Received message: {message}")  

    # Log user authentication status
    print(f"🔑 User authenticated: {request.user.is_authenticated}")
    print(f"👤 User object: {request.user}")

    if not message:  
        return Response({"response": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    # Prepare payload for Rasa
    rasa_payload = {
        "sender": str(request.user.id) if request.user.is_authenticated else "guest_user",
        "message": message
    }

    try:
        rasa_response = requests.post(
            CHATBOT_URL,
            json=rasa_payload,
            timeout=15  # Add a timeout to avoid long waits
        )

        if rasa_response.status_code == 200:
            rasa_data = rasa_response.json()

            # Extract bot responses and buttons
            bot_responses = []
            buttons = []

            for item in rasa_data:
                if "text" in item and item["text"].strip():  # Prevent empty responses
                    bot_responses.append(item["text"])
                if "buttons" in item:
                    buttons.extend(item["buttons"])

            response_data = {"response": "\n\n".join(bot_responses) if bot_responses else "No response from chatbot."}
            if buttons:
                response_data["buttons"] = buttons  # Include buttons if available

        else:
            print(f"⚠️ Error from Rasa: {rasa_response.status_code} - {rasa_response.text}")
            response_data = {"response": "Sorry, something went wrong with the chatbot."}
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except requests.exceptions.RequestException as e:
        print(f"❌ Error communicating with Rasa: {e}")
        response_data = {"response": "Sorry, I couldn't connect to the bot at the moment."}
        return Response(response_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    print(f"✅ Final Django Response: {response_data}")
    return Response(response_data, status=status.HTTP_200_OK)




@csrf_exempt  
@api_view(['GET'])
def give_user_details(request):
    user_id = request.GET.get('user_id')

    if not user_id:
        return Response({"message": "User ID is required"}, status=400)

    try:
        # Retrieve customer profile directly
        user = User.objects.filter(id=user_id).first()
        customer_profile = CustomerProfile.objects.filter(user=user).first()
        
        if not customer_profile:
            return Response({"message": "Customer profile not found"}, status=404)

        serializer = CustomerProfileSerializer(customer_profile)
        return Response(serializer.data, status=200)

    except Exception as e:
        return Response({"message": f"Error: {str(e)}"}, status=500)

import difflib
from django.db.models import Q


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow access to all users
def get_doctors(request):
    """
    Fetch doctors based on specialization, correcting misspellings if necessary.
    Example request: /chatBot/get-doctors/?specialization=cardiologist
    """
    print("Inside get doctors")
    
    specialization = request.GET.get('specialization', None)
    print("Specialization from chatbot:", specialization)
    
    # Fetch all valid specializations from the database
    all_specializations = list(Doctor.objects.values_list('specialization', flat=True).distinct())

    if specialization:
        # Attempt to find the closest match
        closest_match = difflib.get_close_matches(specialization, all_specializations, n=1, cutoff=0.6)

        if closest_match:
            corrected_specialization = closest_match[0]
            print(f"Did you mean '{corrected_specialization}' instead of '{specialization}'?")
            doctors = Doctor.objects.filter(specialization__iexact=corrected_specialization)
        else:
            # If no close match is found, return an error response
            return Response({
                "error": f"Specialization '{specialization}' not found. Did you mean one of these? {', '.join(all_specializations)}"
            }, status=404)
    else:
        doctors = Doctor.objects.filter(profile__deleted_status=0)

    if not doctors.exists():
        return Response({
            "message": f"No doctors found for specialization '{specialization}'. Please check the spelling or try a different one."
        }, status=404)

    serializer = DoctorProfileSerializer(doctors, many=True)
    return Response(serializer.data, status=200)