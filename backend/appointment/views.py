from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from home.serializers import DoctorProfileSerializer
from authentication.models import Doctor, CustomerProfile
from django.db.models import Q
from .serializers import AppointmentSerializer, DoctorAvailabilitySerializer
from .models import Appointment, Booking, Slot
from doctor.models import Availability
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.core.exceptions import ObjectDoesNotExist
from home.models import Notification

class DoctorListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorProfileSerializer

    def get_queryset(self):
        query = self.request.query_params.get('name', None)  # Get the search query
        if query:
            return Doctor.objects.filter(
                Q(profile__name__icontains=query) | Q(specialization__icontains=query)
            )
        return Doctor.objects.all()  # Return all if no search query

class DoctorDetails(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Doctor.objects.filter(is_verified=False)
    # print(queryset)
    serializer_class = DoctorProfileSerializer

class MyAppointmentsView(ListAPIView):
    """
    API endpoint to list a user's booked appointments.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer
    

    def get_queryset(self):
        """
        Return appointments booked by the authenticated user.
        """
        return Appointment.objects.filter(patient=self.request.user.profile, status='pending').order_by('-created_at')


class GetDoctorAvailability(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorAvailabilitySerializer

    def get_queryset(self): 
        doctor_id = self.kwargs['doctor_id']
        
        try:
            doctor_profile = Doctor.objects.get(id=doctor_id)  # Use .get() instead of .filter()
        except Doctor.DoesNotExist:
            return Availability.objects.none()  # Return an empty queryset if doctor not found

        return Availability.objects.filter(doctor=doctor_profile, is_available=True).order_by('day', 'start_time')







# Helper function to get the next date for a given day (e.g., MON → next Monday)
def get_next_date(day_abbr):
    today = datetime.today().date()
    day_abbr = day_abbr.upper()[:3]  # Ensure we use 3-letter day format

    # Mapping days to integer values (Monday = 0, ..., Sunday = 6)
    days_map = {
        "MON": 0, "TUE": 1, "WED": 2, "THU": 3, "FRI": 4, "SAT": 5, "SUN": 6
    }
    
    if day_abbr not in days_map:
        return None  # Invalid day input
    
    target_day = days_map[day_abbr]
    today_day = today.weekday()  # Get today's weekday index

    # Calculate the number of days to add to reach the next target day
    days_to_add = (target_day - today_day + 7) % 7  # Ensures it wraps correctly
    if days_to_add == 0:
        days_to_add = 7  # If today is the same day, get the next week's occurrence
    
    return today + timedelta(days=days_to_add)  # Get the next occurrence of the given day


def generate_available_slots(doctor, target_date):
    """Generate available time slots dynamically for the given date."""
    try:
        day_of_week = target_date.strftime("%a").upper()[:3]  # Convert to MON, TUE, etc.
        availability = Availability.objects.get(doctor=doctor, day=day_of_week, is_available=True)
    except ObjectDoesNotExist:
        return []  # No available slots

    booked_slots = Booking.objects.filter(doctor=doctor, date=target_date).exclude(status="completed").values_list("start_time", flat=True)

    slots = []
    current_time = datetime.strptime(str(availability.start_time), "%H:%M:%S").time()
    end_time = datetime.strptime(str(availability.end_time), "%H:%M:%S").time()

    while (datetime.combine(datetime.today(), current_time) + timedelta(minutes=doctor.consultation_duration)).time() <= end_time:
        if current_time not in booked_slots:
            formatted_time = current_time.strftime("%I:%M %p")  # Convert to AM/PM format
            slots.append(formatted_time)  # Store in AM/PM format
        current_time = (datetime.combine(datetime.today(), current_time) + timedelta(minutes=doctor.consultation_duration)).time()

    return slots



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_available_slots(request, doctor_id, day):
    """
    API to get available slots for a doctor based on the selected **day of the week**.
    """
    try:
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        return Response({"error": "Doctor not found"}, status=404)

    target_date = get_next_date(day)
    if not target_date:
        return Response({"error": "Invalid day format"}, status=400)

    available_slots = generate_available_slots(doctor, target_date)

    return Response({
        "date": target_date.strftime("%Y-%m-%d"),
        "available_slots": available_slots  # ✅ Already in AM/PM format
    })


from django.db import transaction
from django.db.utils import IntegrityError
import traceback  # Import traceback to log detailed errors
import requests
from django.conf import settings

ONE_SIGNAL_APP_ID = "cb39d340-eee8-4846-9ad9-c6d020a1dc5c"
ONE_SIGNAL_REST_API_KEY = "os_v2_app_zm45gqho5beengwzy3icbio4lsxpe32uiibuq3eukfbqilqho2jexa2o5pnan7whfnnfmxvil5lnrm7pmrzg4w3kzftzwvn4nnru4ly"

def send_push_notification(user, title, message):
    """Send push notification via OneSignal"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {ONE_SIGNAL_REST_API_KEY}"
    }
    
    payload = {
        "app_id": ONE_SIGNAL_APP_ID,
        "include_external_user_ids": [str(user.id)],  # Ensure user ID is registered with OneSignal
        "headings": {"en": title},
        "contents": {"en": message},
    }

    response = requests.post("https://onesignal.com/api/v1/notifications", json=payload, headers=headers)
    print("OneSignal Response:", response.json())  # Debugging

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_appointment(request):
    try:
        data = request.data
        print("Received data:", data)

        patient = CustomerProfile.objects.get(user=request.user)
        doctor = Doctor.objects.get(id=data["id"])
        consultation_duration = doctor.consultation_duration  # Assume this is in minutes
        print("Patient:", patient, "Doctor:", doctor, "Consultation Duration:", consultation_duration)

        # Convert time and date
        appointment_time = datetime.strptime(data["time"], "%I:%M %p").time()
        appointment_date = datetime.strptime(data["date"], "%Y-%m-%d").date()

        # **Find or Create a Slot**
        slot, created = Slot.objects.get_or_create(
            doctor=doctor,
            date=appointment_date,
            time=appointment_time,  # ✅ Using correct field name 'time'
        )

        print("Slot:", slot, "Created:", created)

        # **Calculate End Time**
        start_datetime = datetime.combine(appointment_date, appointment_time)
        end_datetime = start_datetime + timedelta(minutes=consultation_duration)
        end_time = end_datetime.time()  # Extract time

        # **Create Booking entry**
        booking = Booking.objects.create(
            doctor=doctor,
            patient=patient,
            date=appointment_date,
            start_time=appointment_time,
            end_time=end_time,  # ✅ Correctly setting end time
            status="confirmed",
        )
        print("Booking Created:", booking)

        # **Create Appointment entry**
        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            slot=slot,  # ✅ Assign the slot
            symptoms=data.get("symptoms", ""),
            reason=data.get("reason", ""),
            status="pending",
            payment_status="paid",
        )
        print("Appointment Created:", appointment)

        # **Create Notification for Patient**
        customer_profile = CustomerProfile.objects.filter(user=request.user).first()
        if not customer_profile:
            return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        Notification.objects.create(
            customer=customer_profile,
            title='Appointment booked successfully.',
            content=f"Your appointment with Dr. {appointment.doctor.profile.name} is booked.",
            created_at=now(),  # Assuming your Notification model has a timestamp field
        )

        send_push_notification(patient.user, "Appointment Booked", f"Your appointment with Dr. {doctor.profile.name} is confirmed!")

        # **Create Notification for Doctor**
        doctor_profile = doctor.profile  # Assuming doctor has a related user profile
        print(doctor_profile)
        Notification.objects.create(
            customer=doctor_profile,  # Assuming Notification model supports a doctor field
            title="New Appointment Scheduled",
            content=f"You have a new appointment with {customer_profile.name} on {appointment_date} at {appointment_time}.",
            created_at=now(),
        )

        send_push_notification(doctor.profile.user, "New Appointment", f"You have a new appointment with {patient.name}.")

        return Response({
            "message": "Appointment and Booking saved successfully",
            "appointment_id": appointment.id,
            "booking_id": booking.id,
            "slot_id": slot.id
        }, status=201)

    except Doctor.DoesNotExist:
        return Response({"error": "Doctor not found"}, status=404)
    except CustomerProfile.DoesNotExist:
        return Response({"error": "Patient profile not found"}, status=404)
    except Exception as e:
        print("Error occurred:", str(e))
        traceback.print_exc()  # Logs full error traceback to console for debugging
        return Response({"error": str(e)}, status=500)
    


    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_appointment_details(request, appointment_id):
    try:
        appointment = Appointment.objects.select_related('doctor', 'patient', 'slot').get(id=appointment_id)
        serializer = AppointmentSerializer(appointment)
        print(serializer.data)
        return Response({"success": True, "appointment": serializer.data}, status=200)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)
    


class MyOldAppointmentsView(ListAPIView):
    """
    API endpoint to list a user's booked appointments.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer


    def get_queryset(self):
        """
        Return appointments booked by the authenticated user.
        """
        return Appointment.objects.filter(patient=self.request.user.profile, status='completed').order_by('-created_at')
    

from e_Store.models import Product
from e_Store.serializers import ProductSerializer
# For fetching available products for buyingmedicine directly from cart
@api_view(['GET'])
def available_products(request):
    """
    Returns all available products with stock > 0 and status as LIVE.
    """
    available_products = Product.objects.filter(stock__gt=0, status=Product.LIVE)
    serializer = ProductSerializer(available_products, many=True)
    return Response({"products": serializer.data}, status=200)




# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Chat, Appointment
from .serializers import ChatSerializer

class ChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        """Fetch all chat messages for a given appointment."""
        appointment = get_object_or_404(Appointment, id=appointment_id)
        chats = Chat.objects.filter(appointment=appointment).order_by("timestamp")
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)


class ChatCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Send a new chat message."""
        doctor_id = request.data.get('doctor')
        patient_id = request.data.get('patient')
        appointment_id = request.data.get('appointment')
        message = request.data.get('message')
        image = request.FILES.get('image', None)
        video = request.FILES.get('video', None)
        sender = request.data.get('sender')

        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        chat = Chat.objects.create(
            doctor_id=doctor_id,
            patient_id=patient_id,
            appointment=appointment,
            message=message,
            image=image,
            sender=sender,
            video=video,
        )
        return Response({"message": "Message sent successfully!"}, status=201)


from django.utils.timezone import now
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_consultation(request):
    data = request.data
    appointment_id = data.get('id')

    if not appointment_id:
        return Response({"error": "Appointment ID is required"}, status=400)

    appointment = Appointment.objects.filter(id=appointment_id).first()
    
    if not appointment:
        return Response({"error": "Appointment not found"}, status=404)

    # Mark the appointment as completed
    appointment.status = 'completed'
    appointment.diagnosis = data.get('diagnosis', '')  # Save diagnosis
    appointment.save()

    # Update corresponding booking status to 'completed'
    booking = Booking.objects.filter(
        doctor=appointment.doctor,
        patient=appointment.patient,
        date=appointment.slot.date,  # Assuming slot has a date field
        start_time=appointment.slot.time  # Assuming slot has start_time field
    ).first()

    if booking:
        booking.status = 'completed'
        booking.save()
    
    # Fetch customer profile
    customer_profile = appointment.patient
    if not customer_profile:
        return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # ✅ Create a new notification
    Notification.objects.create(
        customer=customer_profile,
        title='Consultation Completed',
        content=f"Your appointment with Dr. {appointment.doctor.profile.name} is completed.",
        created_at=now(),  # Assuming your Notification model has a timestamp field
    )

    return Response({"message": "Consultation, booking, and notification updated successfully."}, status=200)