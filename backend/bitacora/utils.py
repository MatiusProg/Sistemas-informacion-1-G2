"""
Utilidades para el registro de bitácora en Supabase.

Este módulo proporciona funciones helper para registrar acciones
de auditoría directamente en la tabla 'bitacora' de Supabase
utilizando la API REST oficial.

¿Por qué usamos la API de Supabase en lugar del ORM de Django?
- Evitamos configurar PostgreSQL como base de datos principal.
- Mantenemos la simplicidad del proyecto.
- Usamos el mismo patrón que para otras tablas (alertas, reportes, etc.).
- La API de Supabase es escalable y profesional.

Autor: Grupo 2 - INF342
Fecha: Abril 2026
Última modificación: Abril 2026 - Cambio a API de Supabase
"""

from supabase import create_client
from django.conf import settings
import logging

# Configurar logger para este módulo
# Esto permite ver mensajes de éxito/error en la consola de Django
logger = logging.getLogger(__name__)


def obtener_ip_cliente(request) -> str:
    """
    Obtiene la dirección IP real del cliente desde el objeto request de Django.
    
    Esta función considera proxies y cabeceras comunes (como HTTP_X_FORWARDED_FOR)
    para obtener la IP real del usuario, incluso si la aplicación está detrás
    de un balanceador de carga o proxy (como Railway).
    
    Args:
        request: Objeto HttpRequest de Django que contiene los metadatos de la petición.
    
    Returns:
        str: Dirección IP del cliente en formato string (ej: "192.168.1.10").
             Si no se puede determinar, devuelve "IP no disponible".
    
    Example:
        >>> ip = obtener_ip_cliente(request)
        >>> print(ip)
        '192.168.1.10'
    """
    # Intentar obtener la IP de la cabecera HTTP_X_FORWARDED_FOR
    # Esta cabecera es estándar cuando la app está detrás de un proxy
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    
    if x_forwarded_for:
        # Si hay múltiples IPs (separadas por coma), la primera es la del cliente original
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        # Si no hay proxy, usar REMOTE_ADDR (IP directa de la conexión)
        ip = request.META.get('REMOTE_ADDR', 'IP no disponible')
    
    return ip


def registrar_accion(usuario_id: str, usuario_email: str, accion: str, detalles: dict = None) -> bool:
    """
    Registra una acción de auditoría directamente en la tabla 'bitacora' de Supabase.
    
    Esta función debe ser llamada cada vez que ocurra un evento relevante que requiera
    ser auditado (login, logout, cambios de rol, activación/desactivación de usuarios, etc.).
    
    Utiliza la API REST de Supabase (create_client) para insertar un registro
    en la tabla 'bitacora'. NO depende del ORM de Django.
    
    Args:
        usuario_id (str): UUID del usuario que realiza la acción.
        usuario_email (str): Email del usuario que realiza la acción.
        accion (str): Tipo de acción realizada. Valores típicos:
                      "LOGIN", "LOGIN_FALLIDO", "LOGOUT", "REGISTER",
                      "CHANGE_ROLE", "TOGGLE_ACTIVE", "UPDATE_PROFILE", etc.
        detalles (dict, optional): Diccionario con información adicional en formato JSON.
                                   Puede incluir: IP, navegador, usuario afectado,
                                   valores anteriores/nuevos, etc.
                                   Por defecto es un diccionario vacío {}.
    
    Returns:
        bool: True si el registro se insertó correctamente en Supabase.
              False en caso de cualquier error (conexión, permisos, etc.).
              El error se registra en el logger para depuración.
    
    Example:
        >>> # Registrar un login exitoso
        >>> registrar_accion(
        ...     usuario_id="123e4567-e89b-12d3-a456-426614174000",
        ...     usuario_email="chef@cocina.com",
        ...     accion="LOGIN",
        ...     detalles={"ip": "192.168.1.10", "exitoso": True}
        ... )
        True
        
        >>> # Registrar un cambio de rol
        >>> registrar_accion(
        ...     usuario_id="admin-id",
        ...     usuario_email="admin@cocina.com",
        ...     accion="CHANGE_ROLE",
        ...     detalles={
        ...         "ip": "192.168.1.10",
        ...         "usuario_afectado": "usuario-id",
        ...         "nuevo_rol": "administrador"
        ...     }
        ... )
        True
    """
    # 🔥 TEMPORAL: Verificar que la función se llama
    print(f"🔥🔥🔥 BITÁCORA LLAMADA: {usuario_email} - {accion}")
    try:
        # 1. Crear cliente de Supabase usando las credenciales de settings
        #    SUPABASE_URL y SUPABASE_KEY se cargan desde el archivo .env
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # 2. Preparar los datos a insertar
        #    La tabla 'bitacora' debe existir en Supabase con las columnas:
        #    - usuario_id (uuid)
        #    - usuario_email (text)
        #    - accion (text)
        #    - detalles (jsonb)
        #    - fecha (timestamptz) - se genera automáticamente en Supabase
        data = {
            'usuario_id': usuario_id,
            'usuario_email': usuario_email,
            'accion': accion,
            'detalles': detalles or {}  # Si no se proporcionan detalles, usar diccionario vacío
            # 'fecha', tambien 'id' se omite porque Supabase la genera automáticamente (DEFAULT NOW())
        }
        
        # 3. Insertar el registro en Supabase
        response = supabase.table('bitacora').insert(data).execute()
        
        # 4. Verificar si la inserción fue exitosa
        if response.data:
            # Éxito: registrar en el logger de Django
            logger.info(f"✅ Bitácora registrada en Supabase: {usuario_email} - {accion}")
            return True
        else:
            # La API respondió pero sin datos (posible error de permisos o validación)
            logger.error(f"❌ Error registrando bitácora: Respuesta vacía de Supabase. Detalles: {response}")
            return False
            
    except Exception as e:
        # 5. Capturar cualquier excepción (error de conexión, timeout, etc.)
        #    NO relanzamos la excepción para que el flujo principal de la aplicación
        #    no se vea interrumpido por un fallo en la bitácora.
        logger.error(f"❌ Error registrando bitácora para {usuario_email}: {str(e)}")
        return False