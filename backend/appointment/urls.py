from django.urls import path
from .views import DoctorListView, DoctorDetails, MyAppointmentsView, GetDoctorAvailability,get_available_slots, save_appointment, get_appointment_details, MyOldAppointmentsView, available_products, ChatListView, ChatCreateView, complete_consultation

urlpatterns = [
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("doctor-details/<int:pk>/", DoctorDetails.as_view(), name="doctor-details"),
    path("booked-appointments/",MyAppointmentsView.as_view(),name="booked-appointments"),
    path('doctor-availability/<int:doctor_id>/', GetDoctorAvailability.as_view(), name='doctor-availability'),
    path('get_available_slots/<int:doctor_id>/<str:day>/', get_available_slots, name='get-available-slots'),
    path('save-appointment/',save_appointment,name='save-appointment'),
    path('get-appointment-details/<int:appointment_id>/',get_appointment_details,name="get_appointment_details"),
    path('get_old_appointment/',MyOldAppointmentsView.as_view(),name="get_old_appointment"),
    path('available_products/',available_products,name="available_products"),
    path('chats/<int:appointment_id>/', ChatListView.as_view(), name='chat-list'),
    path('chats/send/', ChatCreateView.as_view(), name='chat-send'),
    path('complete-consultation/', complete_consultation, name='complete_consultation'),

]
