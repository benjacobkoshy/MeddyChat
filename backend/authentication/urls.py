from django.urls import path
from .views import register, user_login, user_details, protected_view
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', user_login, name='login'),
    path('userdetails/', user_details, name='user_details'),

    # JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Protected endpoint
    path('protected/', protected_view, name='protected_view'),
]
