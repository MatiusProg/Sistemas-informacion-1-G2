from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    ResetPasswordView,
    UserProfileView
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
]