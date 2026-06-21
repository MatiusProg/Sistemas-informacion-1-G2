"""
============================================================
ARCHIVO: backend/inventario/mapa_views.py
CASO DE USO: CU19 - Localizar Proveedores mediante Mapa
CICLO: 4
AUTOR: Adalid
FECHA: 21/06/26
============================================================

DESCRIPCION:
Vista para consultar proveedores con coordenadas geograficas
(latitud y longitud) para su visualizacion en un mapa interactivo.
Devuelve solo proveedores que tienen coordenadas registradas.

Endpoint:
  GET /api/proveedores/mapa/
    Param opcional: ?ubicacion=<ciudad>  (filtra por ubicacion, ilike)

Tablas consultadas:
  - proveedor (id, nombre, ubicacion, tipo_pago, latitud, longitud)

NOTA: Las columnas latitud y longitud deben agregarse manualmente
en Supabase con el script SQL indicado en la tarea CU19.
"""

import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from supabase import create_client
from django.conf import settings

from bitacora.utils import registrar_accion, obtener_ip_cliente

logger = logging.getLogger(__name__)


class ProveedorMapaView(APIView):
    """
    GET /api/proveedores/mapa/

    Devuelve la lista de proveedores que tienen latitud y longitud
    registradas, para su representacion en un mapa interactivo.

    Query params:
      ?ubicacion=<texto>  (opcional) filtra por ciudad/ubicacion (ilike)

    Respuesta exitosa (200):
    [
        {
            "id": int,
            "nombre": str,
            "ubicacion": str,
            "tipo_pago": str,
            "latitud": float,
            "longitud": float
        },
        ...
    ]
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtro_ubicacion = request.query_params.get('ubicacion', '').strip()

        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

            query = supabase.table('proveedor').select(
                'id, nombre, ubicacion, tipo_pago, latitud, longitud'
            )

            if filtro_ubicacion:
                query = query.ilike('ubicacion', f'%{filtro_ubicacion}%')

            response = query.execute()
            todos = response.data or []

            # Se devuelven TODOS los proveedores. Los que ya tienen
            # latitud/longitud se pintan como pines; los que no, el
            # frontend los lista aparte para poder asignarles ubicacion.
            con_coordenadas = [
                p for p in todos
                if p.get('latitud') is not None and p.get('longitud') is not None
            ]

            ip_cliente = obtener_ip_cliente(request)
            registrar_accion(
                usuario_id=str(request.user.id),
                usuario_email=request.user.email,
                accion="CONSULTAR_MAPA_PROVEEDORES",
                detalles={
                    "ip": ip_cliente,
                    "filtro_ubicacion": filtro_ubicacion or None,
                    "total_con_coordenadas": len(con_coordenadas),
                    "total_proveedores": len(todos),
                }
            )

            return Response(todos, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error consultando mapa de proveedores: {str(e)}")
            return Response(
                {'error': f'Error al obtener proveedores para el mapa: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
