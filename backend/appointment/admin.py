from django.contrib import admin
from .models import Slot, Appointment, Booking, Prescription, Chat

# Register your models here.

admin.site.register(Appointment)
admin.site.register(Slot)
admin.site.register(Booking)
admin.site.register(Prescription)
admin.site.register(Chat)