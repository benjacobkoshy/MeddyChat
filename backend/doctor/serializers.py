from rest_framework import serializers
from .models import Availability
from appointment.models import Appointment, Slot
from appointment.serializers import SlotSerializer, AppointmentSerializer, PrescriptionSerializer
from home.serializers import DoctorProfileSerializer, CustomerProfileSerializer

class AvailabilitySerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.profile.name", read_only=True)
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    def get_start_time(self, obj):
        return obj.start_time.strftime("%H:%M")  # Ensures 24-hour format

    def get_end_time(self, obj):
        return obj.end_time.strftime("%H:%M")  # Ensures 24-hour format
    
    class Meta:
        model = Availability
        fields = ["id", "doctor_name", "day", "start_time", "end_time", "is_available"]


class DoctorAppointmentsSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)
    patient = CustomerProfileSerializer(read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)  # Change field name to match model
    slot = SlotSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "patient",
            "symptoms",
            "reason",
            "prescriptions",  # Use plural "prescriptions"
            "status",
            "payment_status",
            "created_at",
            "updated_at",
            "slot",
            "diagnosis",
        ]
