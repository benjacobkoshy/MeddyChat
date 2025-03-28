from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework import status
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.views.decorators.csrf import csrf_exempt
from authentication.models import CustomerProfile, Doctor
from rest_framework.views import APIView      
from .serializers import CustomerProfileSerializer,DoctorProfileSerializer, NotificationSerializer
from doctor.models import Availability
from .models import Notification

# Home 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_page(request):
    user = request.user
    user_name = user.username  # Default to username
    notification_count = 0  # Default to 0 if no notifications exist

    try:
        # Fetch CustomerProfile using the user relation
        customer_profile = CustomerProfile.objects.get(user=user)
        user_name = customer_profile.name  # Use name if profile exists
        notification_count = Notification.objects.filter(customer=customer_profile,status='pending').count()
    except CustomerProfile.DoesNotExist:
        pass  # Use default values

    return Response({
        'message': 'Welcome to Meddy!',
        'user': user_name,
        'notification_count': notification_count,
    }, status=status.HTTP_200_OK)

class EditAccountPage(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            customer_profile = CustomerProfile.objects.filter(user=request.user).first()
            if not customer_profile:
                return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

            # Add username and email from the user object
            profile_data = CustomerProfileSerializer(customer_profile).data
            # print(profile_data)

            return Response({"profile": profile_data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "An error occurred while fetching the profile data.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        try:
            customer_profile = CustomerProfile.objects.filter(user=request.user).first()
            if not customer_profile:
                return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = CustomerProfileSerializer(customer_profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"message": "An error occurred while updating the profile.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

import os
from django.conf import settings
class ImageAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image = request.FILES.get('image', None)
        print(image)
        if not image:
            return Response({"error": "No image provided"}, status=400)

        customer_profile, created = CustomerProfile.objects.get_or_create(user=request.user)

        # Delete old image if it exists
        if customer_profile.image:
            old_image_path = os.path.join(settings.MEDIA_ROOT, str(customer_profile.image))
            if os.path.exists(old_image_path):
                os.remove(old_image_path)

        # Save new image
        customer_profile.image = image
        customer_profile.save()

        return Response({
            "message": "Profile picture updated successfully!",
            "image_url": customer_profile.image.url
        }, status=201)

class NotificationListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get(self, request):
        customer_profile = CustomerProfile.objects.filter(user=request.user).first()
        if not customer_profile:
            return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Fetching notifications with 'pending' status
        notifications = Notification.objects.filter(customer=customer_profile,status='pending')

        # Serialize the queryset
        serializer = self.serializer_class(notifications, many=True)
        # print(serializer.data)
        return JsonResponse({'notifications': serializer.data}, status=200)

from django.utils.timezone import now
class NotificationMarkRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, customer__user=request.user)
            notification.status = 'read'  # Assuming 'read' is a valid status
            notification.read_at = now()  # Update the read timestamp
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"message": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
        
class NotificationMarkAllRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notifications = Notification.objects.filter(customer__user=request.user, status='pending')
        if notifications.exists():
            notifications.update(status='read', read_at=now())  # Mark all as read
            return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)
        return Response({"message": "No unread notifications."}, status=status.HTTP_204_NO_CONTENT)
    


# Customer medical report
from appointment.serializers import AppointmentSerializer
from appointment.models import Appointment

class CustomerMedicalReport(ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # Use self instead of request
        # Ensure the patient exists
        customer_profile = CustomerProfile.objects.filter(user=self.request.user).first()
        if not customer_profile:
            return Appointment.objects.none()  # Return empty queryset if no patient found

        # Return completed appointments for the patient
        return Appointment.objects.filter(
            patient=customer_profile, status="completed"
        ).order_by("-slot__date", "-slot__time")  # Ensure these fields exist
    

# For deit suggestion
class RecentMedicalHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the two most recent completed appointments
        customer_profile = CustomerProfile.objects.get(user=self.request.user)
        print(customer_profile)
        recent_appointments = Appointment.objects.filter(
            patient=customer_profile, status="completed"
        ).order_by("-slot__date", "-slot__time")[:2]  


        if not recent_appointments:
            return Response({"message": "No recent medical history found"}, status=404)

        # Extract disease and symptoms from the most recent appointment
        disease = recent_appointments[0].diagnosis
        symptoms = []
        
        # Collect symptoms from both recent appointments
        for appointment in recent_appointments:
            symptoms.extend(appointment.symptoms)  # Assuming symptoms is a list

        # Get only the last two unique symptoms
        symptoms = list(dict.fromkeys(symptoms))[-2:]  # Removing duplicates and keeping the last two

        data = {
            "disease": disease,
            "symptoms": symptoms,
        }
        return Response(data, status=200)
