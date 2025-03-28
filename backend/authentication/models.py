from django.db import models
from django.contrib.auth.models import User
from datetime import date

class CustomerProfile(models.Model):
    # Constants for deletion status
    LIVE = 0
    DELETE = 1
    DELETE_CHOICES = (
        (LIVE, 'Live'),
        (DELETE, 'Delete'),
    )

    # Fields
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    alternate_phone_number = models.CharField(max_length=15, blank=True)
    place = models.CharField(max_length=50, blank=True)
    pin = models.CharField(max_length=10, blank=True)
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    is_verified = models.BooleanField(default=False)  # For e-store customer verification
    medical_history = models.TextField(blank=True)
    image = models.ImageField(upload_to="user_images/", blank=True, null=True)

    GENDER_CHOICES = (
    ('male', 'Male'),
    ('female', 'Female'),
    ('other', 'Other'),
    )
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)


    # Role choices
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='customer'
    )

    # Meta information
    deleted_status = models.IntegerField(
        choices=DELETE_CHOICES, default=LIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # String representation
    def __str__(self):
        return self.user.username

    def calculate_age(self):
        if self.dob:
            today = date.today()
            age = today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))
            return age
        return None  # Return None if DOB is not set

class Doctor(models.Model):
    profile = models.OneToOneField(
        'CustomerProfile', on_delete=models.CASCADE, related_name="doctor_profile"
    )
    specialization = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    qualifications = models.TextField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    profile_image = models.ImageField(upload_to="doctor_profiles/", blank=True, null=True)
    about_me = models.TextField(blank=True)

    CONSULTATION_DURATIONS = [(5, "5 min"), (10, "10 min"), (15, "15 min"), (20, "20 min"), (30, "30 min")]
    consultation_duration = models.IntegerField(choices=CONSULTATION_DURATIONS, default=15)

    is_verified = models.BooleanField(default=False)  # Identifies whether the doctor completed their profile

    def __str__(self):
        return f"Dr. {self.profile.name} - {self.specialization}"


