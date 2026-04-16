from rest_framework import authentication
from rest_framework import exceptions
from supabase import create_client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Autenticación personalizada usando Supabase JWT.
    """
    
    def authenticate(self, request):
        # 1. Obtener el token del header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        # 2. Extraer el token (formato: "Bearer <token>")
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise exceptions.AuthenticationFailed('Formato de token invalido')
        
        token = parts[1]
        
        # 3. Validar el token contra Supabase
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            user_response = supabase.auth.get_user(token)
            
            if not user_response.user:
                raise exceptions.AuthenticationFailed('Token invalido o expirado')
            
            # 4. Crear un objeto usuario simple para DRF
            user = type('User', (), {
                'id': user_response.user.id,
                'email': user_response.user.email,
                'is_authenticated': True,
            })()
            
            return (user, token)
            
        except Exception as e:
            logger.error(f"Error de autenticacion Supabase: {str(e)}")
            raise exceptions.AuthenticationFailed('Error al validar credenciales')
    
    def authenticate_header(self, request):
        return 'Bearer'