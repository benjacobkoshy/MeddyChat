from rest_framework import serializers
from .models import Slot, Appointment, Prescription, Chat
from authentication.models import CustomerProfile, Doctor
from doctor.models import Availability
from home.serializers import DoctorProfileSerializer, CustomerProfileSerializer


class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = ['id', 'date', 'time']


class PrescriptionSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")  # Get the product name
    
    class Meta:
        model = Prescription
        fields = ["id", "product", "product_name", "quantity", "dosage"]


from datetime import date

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)
    patient = CustomerProfileSerializer(read_only=True)
    slot = SlotSerializer(read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)  # Include prescriptions
    patient_age = serializers.SerializerMethodField()  # Custom field for age


    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "patient",
            "slot",
            "symptoms",
            "reason",
            "prescriptions",
            "status",
            "payment_status",
            "created_at",
            "updated_at",
            "patient_age",  # Include the age field
            "diagnosis",
        ]

    def get_patient_age(self, obj):
        """Calculate the patient's age based on their date of birth."""
        if obj.patient and obj.patient.dob:
            today = date.today()
            dob = obj.patient.dob
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            return age
        return None  # If DOB is not available

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.profile.name", read_only=True)
    doctor_specialization = serializers.CharField(source="doctor.specialization", read_only=True)

    class Meta:
        model = Availability
        fields = ['id', 'doctor_name', 'doctor_specialization', 'day', 'start_time', 'end_time', 'is_available']





class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'doctor', 'patient', 'appointment', 'message', 'image', 'timestamp', 'sender','video']
