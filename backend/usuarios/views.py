from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from supabase import create_client
from django.conf import settings
from django.http import Http404
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
            # Verificar si el usuario está activo en nuestra tabla
            user_id = auth_response.user.id
            profile = supabase.table('usuario').select('activo', 'rol', 'nombre').eq('id', user_id).execute()

            if profile.data and profile.data[0].get('activo') == False:
                # Cerrar sesión inmediatamente
                supabase.auth.sign_out()
                return Response({
                    'error': 'Tu cuenta ha sido desactivada. Contacta al administrador.'
                }, status=status.HTTP_403_FORBIDDEN)

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
        
class UserListView(APIView):
    """
    Lista todos los usuarios (solo para administradores).
    GET /api/auth/users/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Verificar que el usuario es administrador
        # NOTA: request.user.rol viene del objeto que creamos en SupabaseAuthentication
        if not hasattr(request.user, 'rol') or request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permiso para ver esta lista'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            response = supabase.table('usuario').select('*').execute()
            
            return Response(response.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # IMPRIMIR EL ERROR COMPLETO EN LA CONSOLA
            import traceback
            print("=" * 50)
            print("ERROR EN UserListView:")
            traceback.print_exc()
            print("=" * 50)
            logger.error(f"Error listando usuarios: {str(e)}")
            return Response(
                {'error': f'Error al obtener la lista de usuarios: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangeUserRoleView(APIView):
    """
    Cambia el rol de un usuario (solo para administradores).
    PATCH /api/auth/users/<uuid:id>/role/
    Body: { "rol": "chef" | "administrador" | "usuario" }
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, user_id):
        # Verificar que el usuario es administrador
        if request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permiso para cambiar roles'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        nuevo_rol = request.data.get('rol')
        if nuevo_rol not in ['chef', 'administrador', 'usuario']:
            return Response(
                {'error': 'Rol inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # No permitir cambiarse el rol a sí mismo
        if str(request.user.id) == str(user_id):
            return Response(
                {'error': 'No puedes cambiar tu propio rol'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # SOLO actualizar la tabla usuario (no tocar auth.users)
            response = supabase.table('usuario').update({
                'rol': nuevo_rol
            }).eq('id', str(user_id)).execute()
            
            if not response.data:
                raise Http404("Usuario no encontrado")
            
            return Response({
                'message': 'Rol actualizado exitosamente',
                'user': response.data[0]
            }, status=status.HTTP_200_OK)
            
        except Http404:
            raise
        except Exception as e:
            logger.error(f"Error cambiando rol: {str(e)}")
            return Response(
                {'error': f'Error al cambiar el rol: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ToggleUserActiveView(APIView):
    """
    Activa/desactiva un usuario (solo para administradores).
    PATCH /api/auth/users/<uuid:id>/toggle-active/
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, user_id):
        # Verificar que el usuario es administrador
        if request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permiso para modificar usuarios'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # No permitir desactivarse a sí mismo
        if str(request.user.id) == str(user_id):
            return Response(
                {'error': 'No puedes desactivar tu propia cuenta'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Obtener estado actual
            user_response = supabase.table('usuario').select('activo').eq('id', str(user_id)).execute()
            if not user_response.data:
                raise Http404("Usuario no encontrado")
            
            current_active = user_response.data[0].get('activo', True)
            new_active = not current_active
            
            # SOLO actualizar la tabla usuario (no tocar auth.users)
            response = supabase.table('usuario').update({
                'activo': new_active
            }).eq('id', str(user_id)).execute()
            
            return Response({
                'message': f'Usuario {"activado" if new_active else "desactivado"} exitosamente',
                'user': response.data[0]
            }, status=status.HTTP_200_OK)
            
        except Http404:
            raise
        except Exception as e:
            logger.error(f"Error toggle active: {str(e)}")
            return Response(
                {'error': f'Error al cambiar el estado: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class AdminCreateUserView(APIView):
    """
    Permite a un administrador crear un nuevo usuario manualmente.
    POST /api/auth/users/
    Body: { "email": "...", "password": "...", "nombre": "...", "rol": "..." }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Verificar que el usuario es administrador
        if request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permiso para crear usuarios'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        email = request.data.get('email')
        password = request.data.get('password')
        nombre = request.data.get('nombre')
        rol = request.data.get('rol', 'usuario')
        
        if not all([email, password, nombre]):
            return Response(
                {'error': 'Email, password y nombre son requeridos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if rol not in ['chef', 'administrador', 'usuario']:
            return Response(
                {'error': 'Rol inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Crear usuario en Supabase Auth
            auth_response = supabase.auth.admin.create_user({
                'email': email,
                'password': password,
                'email_confirm': True,  # Confirmar automáticamente
                'user_metadata': {'nombre': nombre, 'rol': rol}
            })
            
            # Insertar en tabla usuario
            supabase.table('usuario').insert({
                'id': auth_response.user.id,
                'nombre': nombre,
                'email': email,
                'rol': rol,
                'activo': True
            }).execute()
            
            return Response({
                'message': 'Usuario creado exitosamente',
                'user': {
                    'id': auth_response.user.id,
                    'email': email,
                    'nombre': nombre,
                    'rol': rol
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creando usuario: {str(e)}")
            return Response(
                {'error': f'Error al crear usuario: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class AdminUpdateUserView(APIView):
    """
    Permite a un administrador editar datos básicos de un usuario.
    PATCH /api/auth/users/<uuid:id>/
    Body: { "nombre": "...", "email": "..." }
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, user_id):
        if request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permiso para editar usuarios'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        nombre = request.data.get('nombre')
        email = request.data.get('email')
        
        if not nombre and not email:
            return Response(
                {'error': 'Al menos un campo (nombre o email) es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            update_data = {}
            if nombre:
                update_data['nombre'] = nombre
            if email:
                update_data['email'] = email
            
            response = supabase.table('usuario').update(update_data).eq('id', str(user_id)).execute()
            
            if not response.data:
                raise Http404("Usuario no encontrado")
            
            # Si cambió el email, actualizar en auth.users
            if email:
                supabase.auth.admin.update_user_by_id(str(user_id), {'email': email})
            
            return Response({
                'message': 'Usuario actualizado exitosamente',
                'user': response.data[0]
            }, status=status.HTTP_200_OK)
            
        except Http404:
            raise
        except Exception as e:
            logger.error(f"Error actualizando usuario: {str(e)}")
            return Response(
                {'error': f'Error al actualizar: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
