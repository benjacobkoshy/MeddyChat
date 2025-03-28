from django.db import models
from authentication.models import Doctor
from django.core.exceptions import ValidationError
from django.utils.dateformat import format


# Create your models here.

class Availability(models.Model):
    DAY_CHOICES = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    period = models.CharField(max_length=2, choices=[("AM", "AM"), ("PM", "PM")], default='PM')  # Store AM or PM
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('doctor', 'day', 'start_time', 'end_time')  # Allows multiple slots per day
        ordering = ['day', 'start_time']

    def clean(self):
        """Ensure that the start time is before the end time."""
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time.")

    def __str__(self):
            return f"{self.doctor} - {self.day}: {self.start_time.strftime('%H:%M')} to {self.end_time.strftime('%H:%M')}"