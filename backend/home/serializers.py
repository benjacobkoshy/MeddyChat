from rest_framework import serializers
from authentication.models import CustomerProfile, Doctor
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import Notification

class CustomerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = [
            "id",
            "name",
            "address",
            "phone_number",
            "alternate_phone_number",
            "place",
            "pin",
            "dob",
            "blood_group",
            "gender",
            "medical_history",
            "image",
            "email",
            "username",
        ]
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'phone_number': {'required': True},
            'alternate_phone_number': {'required': True},
        }

    def validate_phone_number(self, value):
        if not value.isdigit():
            raise ValidationError("Phone number should contain only digits")
        if len(value) != 10:
            raise ValidationError("Phone number must be 10 digits")
        return value

    def validate_pin(self, value):
        if not value.isdigit():
            raise ValidationError("PIN code should contain only digits")
        if len(value) != 6:
            raise ValidationError("PIN code must be 6 digits")
        return value

class DoctorProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="profile.name", read_only=True)
    image = serializers.ImageField(source="profile.image", read_only=True)  # Use ImageField for correct URL handling

    class Meta:
        model = Doctor
        fields = [
            "id",
            "name",
            "image",  # Now correctly handled as an ImageField
            "specialization",
            "experience_years",
            "qualifications",
            "consultation_fee",
            "about_me",
            "consultation_duration",
        ]

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'