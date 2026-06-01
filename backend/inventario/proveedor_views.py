# ============================================================
# ARCHIVO: backend/inventario/proveedor_views.py
# CASO DE USO: CU17 - Gestionar Proveedores
# CICLO: 2
# DESCRIPCIÓN: Vistas (endpoints) para gestionar proveedores y sus insumos.
#   - ProveedorListView: GET (listar todos), POST (crear proveedor base).
#   - ProveedorDetailView: GET (detalles con insumos), PATCH (actualizar proveedor y sus insumos), DELETE (eliminar).
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

class ProveedorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            # Fetch proveedores and join with proveedor_insumo to get insumo names
            # Using the Supabase relational syntax
            response = supabase.table('proveedor').select('*, proveedor_insumo(*, insumo(nombre))').execute()
            
            # Registrar en bitácora
            ip_cliente = obtener_ip_cliente(request)
            registrar_accion(
                usuario_id=str(request.user.id),
                usuario_email=request.user.email,
                accion="LISTAR_PROVEEDORES",
                detalles={"ip": ip_cliente}
            )
            
            return Response(response.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error listando proveedores: {str(e)}")
            return Response(
                {'error': 'Error al obtener la lista de proveedores'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        data = request.data
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            payload = {
                "nombre": data.get("nombre"),
                "contacto": data.get("contacto", ""),
                "email": data.get("email", ""),
                "ubicacion": data.get("ubicacion", ""),
                "tipo_pago": data.get("tipo_pago", "")
            }
            
            response = supabase.table('proveedor').insert(payload).execute()
            nuevo_proveedor = response.data[0]
            
            # Registrar en bitácora
            ip_cliente = obtener_ip_cliente(request)
            registrar_accion(
                usuario_id=str(request.user.id),
                usuario_email=request.user.email,
                accion="CREAR_PROVEEDOR",
                detalles={
                    "ip": ip_cliente,
                    "proveedor_id": nuevo_proveedor['id'],
                    "proveedor_nombre": nuevo_proveedor['nombre']
                }
            )
            
            return Response(nuevo_proveedor, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creando proveedor: {str(e)}")
            return Response(
                {'error': f'Error al crear el proveedor: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProveedorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, proveedor_id):
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            response = supabase.table('proveedor').select('*, proveedor_insumo(*, insumo(nombre))').eq('id', proveedor_id).execute()
            
            if not response.data:
                return Response({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            return Response(response.data[0], status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error obteniendo proveedor {proveedor_id}: {str(e)}")
            return Response(
                {'error': 'Error al obtener el proveedor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, proveedor_id):
        data = request.data
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # 1. Update Proveedor base fields
            valid_fields = ["nombre", "contacto", "email", "ubicacion", "tipo_pago"]
            payload = {k: v for k, v in data.items() if k in valid_fields}
            
            if payload:
                response = supabase.table('proveedor').update(payload).eq('id', proveedor_id).execute()
                if not response.data:
                    return Response({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            # 2. Update Proveedor_Insumo list
            insumos_data = data.get("proveedor_insumo")
            insumos_actualizados = 0
            
            if isinstance(insumos_data, list):
                for insumo in insumos_data:
                    pi_id = insumo.get("id")
                    if pi_id:
                        # Extract updateable fields
                        pi_payload = {}
                        if "precio" in insumo:
                            pi_payload["precio"] = float(insumo["precio"])
                        if "calificacion" in insumo:
                            pi_payload["calificacion"] = insumo["calificacion"]
                        if "nota" in insumo:
                            pi_payload["nota"] = insumo["nota"]
                            
                        if pi_payload:
                            supabase.table('proveedor_insumo').update(pi_payload).eq('id', pi_id).execute()
                            insumos_actualizados += 1
            
            # Fetch the updated object completely to return it
            final_response = supabase.table('proveedor').select('*, proveedor_insumo(*, insumo(nombre))').eq('id', proveedor_id).execute()
            
            # Registrar en bitácora
            ip_cliente = obtener_ip_cliente(request)
            detalles_bitacora = {
                "ip": ip_cliente,
                "proveedor_id": proveedor_id,
            }
            if payload:
                detalles_bitacora["campos_proveedor_actualizados"] = list(payload.keys())
            if insumos_actualizados > 0:
                detalles_bitacora["cantidad_insumos_actualizados"] = insumos_actualizados
                
            registrar_accion(
                usuario_id=str(request.user.id),
                usuario_email=request.user.email,
                accion="EDITAR_PROVEEDOR",
                detalles=detalles_bitacora
            )
            
            return Response(final_response.data[0], status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error actualizando proveedor {proveedor_id}: {str(e)}")
            return Response(
                {'error': 'Error al actualizar el proveedor'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, proveedor_id):
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Verificar si existe
            check = supabase.table('proveedor').select('nombre').eq('id', proveedor_id).execute()
            if not check.data:
                return Response({'error': 'Proveedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
                
            nombre_proveedor = check.data[0]['nombre']
            
            supabase.table('proveedor').delete().eq('id', proveedor_id).execute()
            
            # Registrar en bitácora
            ip_cliente = obtener_ip_cliente(request)
            registrar_accion(
                usuario_id=str(request.user.id),
                usuario_email=request.user.email,
                accion="ELIMINAR_PROVEEDOR",
                detalles={
                    "ip": ip_cliente,
                    "proveedor_id": proveedor_id,
                    "proveedor_nombre": nombre_proveedor
                }
            )
            
            return Response(
                {'message': 'Proveedor eliminado exitosamente'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error eliminando proveedor {proveedor_id}: {str(e)}")
            return Response(
                {'error': 'Error al eliminar el proveedor (puede estar en uso)'},
                status=status.HTTP_400_BAD_REQUEST
            )
