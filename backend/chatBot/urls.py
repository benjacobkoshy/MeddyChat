from django.urls import path
from . views import chatBot, give_user_details, get_doctors

urlpatterns = [
    path('chatBot/',chatBot,name="chatBot"),
    path('user-details/', give_user_details, name='user-details'),
    path('get-doctors/', get_doctors, name='get_doctors'),

]