from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    ResetPasswordView,
    UserProfileView,
    UserListView,           # NUEVO
    ChangeUserRoleView,      # NUEVO
    ToggleUserActiveView,    # NUEVO
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    
    # NUEVOS ENDPOINTS PARA ADMIN
    path('auth/users/', UserListView.as_view(), name='user-list'),
    path('auth/users/<uuid:user_id>/role/', ChangeUserRoleView.as_view(), name='change-role'),
    path('auth/users/<uuid:user_id>/toggle-active/', ToggleUserActiveView.as_view(), name='toggle-active'),
]