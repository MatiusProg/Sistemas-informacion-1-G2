# ============================================================
# ARCHIVO: backend/usuarios/ficha_views.py
# CASO DE USO: CU08 - Consultar Ficha Técnica Digital
# CICLO: 2
# FECHA: 11/05/26
# AUTOR: Karen Ortega Mancilla
# DESCRIPCIÓN: Endpoint para obtener un insumo junto con su
#   ficha técnica asociada. Combina datos de las tablas
#   INSUMO y FICHA_TECNICA mediante JOIN por insumo_id.
#
#   GET /api/insumos/{id}/ficha-tecnica/
#     → Devuelve { insumo: {...}, ficha_tecnica: {...} | null }
# ============================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from supabase import create_client
from django.conf import settings
from bitacora.utils import registrar_accion, obtener_ip_cliente
import logging

logger = logging.getLogger(__name__)


class FichaTecnicaView(APIView):
    """
    GET /api/insumos/{id}/ficha-tecnica/
    
    Devuelve los datos completos del insumo junto con su ficha técnica
    asociada (temperatura, madurez, características, referencias).
    
    Permisos: Cualquier usuario autenticado (Admin, Chef, Gerente, Ayudante).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, insumo_id):
        """Obtiene un insumo y su ficha técnica asociada."""
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

            # 1. Obtener el insumo por ID
            insumo_response = supabase.table('insumo').select('*').eq('id', insumo_id).execute()

            if not insumo_response.data:
                return Response(
                    {'error': 'Insumo no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )

            insumo = insumo_response.data[0]

            # 2. Obtener la ficha técnica asociada (puede no existir)
            ficha_response = supabase.table('ficha_tecnica').select('*').eq('insumo_id', insumo_id).execute()
            ficha_tecnica = ficha_response.data[0] if ficha_response.data else None

            # 3. Registrar en bitácora
            ip_cliente = obtener_ip_cliente(request)
            registrar_accion(
                usuario_id=str(request.user.id),
                usuario_email=request.user.email,
                accion="CONSULTAR_FICHA_TECNICA",
                detalles={
                    "ip": ip_cliente,
                    "insumo_id": insumo_id,
                    "insumo_nombre": insumo.get('nombre', ''),
                    "ficha_disponible": ficha_tecnica is not None
                }
            )

            # 4. Devolver respuesta combinada
            return Response(
                {
                    'insumo': insumo,
                    'ficha_tecnica': ficha_tecnica,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error obteniendo ficha técnica para insumo {insumo_id}: {str(e)}")
            return Response(
                {'error': 'Error al obtener la ficha técnica'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )