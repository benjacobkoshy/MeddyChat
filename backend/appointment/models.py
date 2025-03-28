from django.db import models
from authentication.models import Doctor, CustomerProfile
from django.utils import timezone
from e_Store.models import Product


# Storing the slots of the patients
# Create your models here.
class Slot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="slots")
    date = models.DateField()  # The date of the slot
    time = models.TimeField()  # The time of the slot
    is_booked = models.BooleanField(default=False)  # Slot status
    patient = models.ForeignKey(
        CustomerProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="booked_slots"
    )

    def __str__(self):
        return f"{self.doctor.profile.name} - {self.date} {self.time}"


class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    patient = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="appointments")
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name="appointment")
    symptoms = models.TextField(blank=True)  # Optional field for patient input
    reason = models.CharField(max_length=255, blank=True, null=True)  # Reason for appointment

    # prescription = models.TextField(blank=True, null=True)  # Doctor's prescription or notes
    prescribed_medicines = models.ManyToManyField(Product, through='Prescription', related_name="prescriptions")
    
    diagnosis  = models.TextField(blank=True, null=True)  # Doctor's prescription or notes
    status_choices = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default='pending')
    payment_status_choices = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    payment_status = models.CharField(max_length=10, choices=payment_status_choices, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment: {self.patient.name} with Dr. {self.doctor.profile.name}"


class Prescription(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="prescriptions")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="prescribed")
    custom_medicine_name = models.CharField(max_length=255, blank=True, null=True)  # If medicine is unavailable
    quantity = models.PositiveIntegerField(default=1)  # Number of units prescribed
    dosage = models.CharField(max_length=255, blank=True, null=True)  # E.g., "1 tablet, 3 times a day"
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity} for {self.appointment.patient.name}"



# For identifyingthe booked slots time and display in front end
class Booking(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="bookings")
    patient = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="bookings")
    date = models.DateField()  # Booking date
    start_time = models.TimeField()  # Start time of booked slot
    end_time = models.TimeField()  # End time of booked slot
    status_choices = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed','Completed'),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default='pending')

    class Meta:
        unique_together = ('doctor', 'date', 'start_time')

    def __str__(self):
        return f"Booking: {self.patient.name} with Dr. {self.doctor.profile.name} at {self.start_time}-{self.end_time}"



class Chat(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="chats")
    patient = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="chats")
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="chats")  # Link to specific appointment
    message = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to="chat_images/", blank=True, null=True) 
    video = models.FileField(upload_to='chat_videos', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    sender = models.CharField(max_length=20,null=True)

    def __str__(self):
        return f"Chat: {self.doctor.profile.name} <-> {self.patient.name} (Appointment: {self.appointment.id})"

