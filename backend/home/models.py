from django.db import models
from authentication.models import CustomerProfile

# Create your models here.


class Notification(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('read', 'Read'),
    ]

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255, blank=True, null=True)  # New: Title for categorization
    content = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)  # New: Track when the notification is read

    def __str__(self):
        return f"{self.title or 'Notification'} - {self.customer.name}: {self.content[:30]}..."

    class Meta:
        ordering = ['-created_at']  # Latest notifications first
