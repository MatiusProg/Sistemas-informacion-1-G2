from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    ResetPasswordView,
    UserProfileView,
    UserListView,           
    ChangeUserRoleView,      
    ToggleUserActiveView,    
    AdminCreateUserView,  
    AdminUpdateUserView,   
    LogPasswordResetView, # NUEVO
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/log-password-reset/', LogPasswordResetView.as_view(), name='log-password-reset'),
    
    # NUEVOS ENDPOINTS PARA ADMIN
    path('auth/users/', UserListView.as_view(), name='user-list'),
    path('auth/users/<uuid:user_id>/role/', ChangeUserRoleView.as_view(), name='change-role'),
    path('auth/users/<uuid:user_id>/toggle-active/', ToggleUserActiveView.as_view(), name='toggle-active'),
    # En urls.py:
    path('auth/users/', UserListView.as_view(), name='user-list'),  # GET
    path('auth/users/create/', AdminCreateUserView.as_view(), name='admin-create-user'),  # POST
    path('auth/users/<uuid:user_id>/', AdminUpdateUserView.as_view(), name='admin-update-user'),
]