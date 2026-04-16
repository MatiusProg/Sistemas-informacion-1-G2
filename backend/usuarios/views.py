from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from supabase import create_client
from django.conf import settings
import logging

from .serializers import LoginSerializer, RegisterSerializer, ResetPasswordSerializer

logger = logging.getLogger(__name__)


class LoginView(APIView):
    """
    Endpoint para iniciar sesión con Supabase.
    POST /api/auth/login/
    Body: { "email": "usuario@example.com", "password": "123456" }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            auth_response = supabase.auth.sign_in_with_password({
                'email': email,
                'password': password
            })
            
            return Response({
                'access_token': auth_response.session.access_token,
                'refresh_token': auth_response.session.refresh_token,
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error en login: {str(e)}")
            return Response({
                'error': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    """
    Endpoint para registrar nuevos usuarios.
    POST /api/auth/register/
    Body: { "email": "nuevo@example.com", "password": "123456", "nombre": "Juan Perez", "rol": "chef" }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        nombre = serializer.validated_data['nombre']
        rol = serializer.validated_data['rol']
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # 1. Crear usuario en Supabase Auth
            auth_response = supabase.auth.sign_up({
                'email': email,
                'password': password,
                'options': {
                    'data': {
                        'nombre': nombre,
                        'rol': rol,
                    }
                }
            })
            
            # 2. El trigger on_auth_user_created ya inserta en public.usuario
            #    Pero actualizamos el nombre por si acaso
            supabase.table('usuario').update({
                'nombre': nombre,
                'rol': rol,
            }).eq('id', auth_response.user.id).execute()
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': auth_response.user.id,
                    'email': email,
                    'nombre': nombre,
                    'rol': rol,
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error en registro: {str(e)}")
            return Response({
                'error': 'Error al registrar usuario. Puede que el email ya esté en uso.'
            }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Endpoint para cerrar sesión.
    POST /api/auth/logout/
    Headers: Authorization: Bearer <access_token>
    """
    def post(self, request):
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Obtener token del header
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
                supabase.auth.sign_out(token)
            
            return Response({'message': 'Sesión cerrada exitosamente'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error en logout: {str(e)}")
            return Response({'error': 'Error al cerrar sesión'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """
    Endpoint para solicitar recuperación de contraseña.
    POST /api/auth/reset-password/
    Body: { "email": "usuario@example.com" }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            supabase.auth.reset_password_email(email)
            
            return Response({
                'message': 'Se ha enviado un enlace de recuperación a tu email'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error en reset password: {str(e)}")
            # Por seguridad, no revelamos si el email existe o no
            return Response({
                'message': 'Si el email está registrado, recibirás un enlace de recuperación'
            }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """
    Endpoint para obtener el perfil del usuario autenticado.
    GET /api/auth/profile/
    Headers: Authorization: Bearer <access_token>
    """
    def get(self, request):
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Obtener datos de la tabla 'usuario'
            response = supabase.table('usuario').select('*').eq('id', request.user.id).execute()
            
            if response.data:
                user_data = response.data[0]
                return Response({
                    'id': user_data['id'],
                    'email': user_data['email'],
                    'nombre': user_data['nombre'],
                    'rol': user_data['rol'],
                    'telefono': user_data.get('telefono'),
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"Error obteniendo perfil: {str(e)}")
            return Response({'error': 'Error al obtener perfil'}, status=status.HTTP_400_BAD_REQUEST)