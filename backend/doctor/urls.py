from django.urls import path
from .views import DoctorAvailabilityView, save_availability, remove_availabaility,EditDoctorProffessionalDetails, DoctorAppointmentsView, DoctorPreviousAppointmentsView, PatientMedicalHistoryView, prescribe_medicine

urlpatterns = [
    path('edit_doctor_proffesional_details/',EditDoctorProffessionalDetails.as_view(),name="edit_proffessional_details"),
    path('my-availabilities/',DoctorAvailabilityView.as_view(),name='my-availabilities'),
    path('add-availabilities/',save_availability, name='save_avaialability'),
    path('delete-avaialability/<int:id>/', remove_availabaility),
    path('get-appointments/', DoctorAppointmentsView.as_view(),name="get-appointments"),
    path("previous-appointments/", DoctorPreviousAppointmentsView.as_view(), name="doctor-previous-appointments"),
    path("patient-medical-history/<int:patient_id>/", PatientMedicalHistoryView.as_view(), name="patient-medical-history"),
    path('save_prescription/<int:appointment_id>/prescribe/', prescribe_medicine, name='prescribe-medicine'),
    
    
]
