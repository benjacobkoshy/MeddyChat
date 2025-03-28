from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.views.decorators.csrf import csrf_exempt
from authentication.models import CustomerProfile, Doctor
from rest_framework.views import APIView      
from doctor.models import Availability
from rest_framework.generics import ListAPIView
from rest_framework import status
from .models import Availability
from .serializers import AvailabilitySerializer
from home.serializers import DoctorProfileSerializer
from appointment.models import Prescription
from e_Store.models import Product



# Doctor Proffesional Details
class EditDoctorProffessionalDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            customer_profile = CustomerProfile.objects.filter(user=request.user).first()
            
            if not customer_profile:
                return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

            doctor_profile = Doctor.objects.filter(profile=customer_profile).first()

            if not doctor_profile:
                # Return an empty structure instead of an error
                return Response({"profile": None, "message": "Doctor profile does not exist."}, status=status.HTTP_200_OK)

            profile_data = DoctorProfileSerializer(doctor_profile).data
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

            # Ensure a doctor profile exists
            doctor_profile = Doctor.objects.filter(profile=customer_profile).first()
            if not doctor_profile:
                doctor_profile = Doctor(profile=customer_profile)  # Create a new instance (but don't save yet)
                created = True
            else:
                created = False

            # print("doctord",doctor_profile)
            print(request.data)
            serializer = DoctorProfileSerializer(doctor_profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                message = "Profile created successfully." if created else "Profile updated successfully."
                return Response({"message": message}, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"message": "An error occurred while updating the profile.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )



from datetime import datetime
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_availability(request):
    print("Inside save availability")
    
    customer_profile = CustomerProfile.objects.filter(user=request.user).first()
    doctor_profile = Doctor.objects.filter(profile=customer_profile).first()

    if not doctor_profile:
        return Response({"error": "Doctor not found"}, status=404)

    availabilities = request.data.get("availability", [])

    # Validate input
    if not isinstance(availabilities, list):
        return Response({"error": "Invalid data format"}, status=400)

    # Delete existing availability records for the doctor
    doctor_profile.availabilities.all().delete()

    new_availabilities = []
    for a in availabilities:
        try:
            # Convert string time to Python time object (24-hour format)
            start_time = datetime.strptime(a["start_time"], "%H:%M").time()
            end_time = datetime.strptime(a["end_time"], "%H:%M").time()

            new_availabilities.append(
                Availability(
                    doctor=doctor_profile,
                    day=a["day"],
                    start_time=start_time,
                    end_time=end_time,
                )
            )
        except KeyError:
            return Response({"error": "Missing required fields"}, status=400)
        except ValueError:
            return Response({"error": "Invalid time format. Expected HH:MM"}, status=400)

    Availability.objects.bulk_create(new_availabilities)

    print("Successful availability creation")
    return Response({"message": "Availability saved successfully."}, status=201)



@csrf_exempt
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_availabaility(request, id):
    availability = Availability.objects.filter(id=id)
    print(availability)
    availability.delete()
    return Response({"message": "Availability deleted successfully."}, status=201)


class DoctorAvailabilityView(ListAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Fetches availabilities for the logged-in doctor"""
        try:
            customer_profile = CustomerProfile.objects.filter(user=self.request.user).first()
            doctor_profile = Doctor.objects.filter(profile=customer_profile).first()
            # print(customer_profile,doctor_profile)
            # doctor = Doctor.objects.get(user=self.request.user)
            return Availability.objects.filter(doctor=doctor_profile).order_by("day", "start_time")
        except Doctor.DoesNotExist:
            return Availability.objects.none()

    def list(self, request, *args, **kwargs):
        """Handles GET requests and returns the doctor's availability"""
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "No availability found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)





from appointment.models import Appointment
from .serializers import DoctorAppointmentsSerializer

class DoctorAppointmentsView(ListAPIView):
    serializer_class = DoctorAppointmentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user's customer profile
        customer_profile = CustomerProfile.objects.filter(user=self.request.user).first()
        if not customer_profile:
            return Appointment.objects.none()  # Return an empty queryset if no profile found

        # Get the doctor profile from the customer profile
        doctor_profile = Doctor.objects.filter(profile=customer_profile).first()
        if not doctor_profile:
            return Appointment.objects.none()  # Return empty queryset if user is not a doctor

        # Return all appointments related to the doctor, ordered by date and time
        return Appointment.objects.filter(
            doctor=doctor_profile, status="pending"
        ).order_by("slot__date", "slot__time")


from datetime import date  # Add this import at the top
class DoctorPreviousAppointmentsView(ListAPIView):
    serializer_class = DoctorAppointmentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user's customer profile
        customer_profile = CustomerProfile.objects.filter(user=self.request.user).first()
        if not customer_profile:
            return Appointment.objects.none()  # Return an empty queryset if no profile found

        # Get the doctor profile from the customer profile
        doctor_profile = Doctor.objects.filter(profile=customer_profile).first()
        if not doctor_profile:
            return Appointment.objects.none()  # Return empty queryset if user is not a doctor

        # Return past appointments (where date is before today)
        return Appointment.objects.filter(
            doctor=doctor_profile, status="completed"
        ).order_by("-slot__date", "-slot__time")


from appointment.serializers import AppointmentSerializer
class PatientMedicalHistoryView(ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
            patient_id = self.kwargs.get("patient_id")  # Get the patient ID from URL

            # Ensure the patient exists
            customer_profile = CustomerProfile.objects.filter(id=patient_id).first()
            if not customer_profile:
                return Appointment.objects.none()  # Return empty queryset if patient not found

            # Return completed appointments for the patient
            return Appointment.objects.filter(
                patient=customer_profile, status="completed"
            ).order_by("-slot__date", "-slot__time")
    

@api_view(['POST'])
def prescribe_medicine(request, appointment_id):
    """
    Doctor prescribes medicines for a given appointment.
    """
    appointment = Appointment.objects.get(id=appointment_id)
    medicines = request.data.get('medicines', [])

    prescriptions = []
    for med in medicines:
        product_id = med.get('product_id')
        custom_medicine_name = med.get('custom_medicine_name')
        dosage = med.get('dosage')
        quantity = med.get('quantity', 1)

        # If product exists, link it, else save as a custom medicine
        product = Product.objects.filter(id=product_id).first() if product_id else None
        prescription = Prescription.objects.create(
            appointment=appointment,
            product=product,
            custom_medicine_name=custom_medicine_name,
            dosage=dosage,
            quantity=quantity
        )
        prescriptions.append(prescription)

    return Response({"message": "Prescription saved successfully"}, status=201)