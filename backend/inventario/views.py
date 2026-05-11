from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.conf import settings
from supabase import create_client, Client
from datetime import date, timedelta

class LoteViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar lotes (CU12)
    Ahora con múltiples insumos por lote
    """
    permission_classes = []  # Desactivado temporalmente para pruebas
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
    
    def list(self, request):
        """Listar todos los lotes (cabecera + detalles)"""
        try:
            # Obtener todos los lotes
            lotes = self.supabase.table('lote').select('*').order('id', desc=True).execute()
            
            # Para cada lote, obtener sus detalles
            resultado = []
            for lote in lotes.data:
                detalles = self.supabase.table('detalle_lote')\
                    .select('*, insumo(id, nombre)')\
                    .eq('lote_id', lote['id'])\
                    .execute()
                lote['detalles'] = detalles.data
                resultado.append(lote)
            
            return Response(resultado)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request):
        """
        Crear un nuevo lote con múltiples insumos
        
        JSON esperado:
        {
            "fecha_ing": "2026-05-11", (opcional, default hoy)
            "proveedor_id": 123, (opcional)
            "detalles": [
                {
                    "insumo_id": 1,
                    "stock_id": 1,
                    "cantidad": 50,
                    "costo_unitario": 3.5
                },
                {
                    "insumo_id": 2,
                    "stock_id": 2,
                    "cantidad": 100,
                    "costo_unitario": 2.0
                }
            ]
        }
        """
        try:
            fecha_ing = request.data.get('fecha_ing', date.today().isoformat())
            proveedor_id = request.data.get('proveedor_id')
            detalles = request.data.get('detalles', [])
            
            if not detalles:
                return Response({'error': 'Debe incluir al menos un detalle'}, status=400)
            
            # 1. Crear el lote (cabecera)
            lote_data = {
                'fecha_ing': fecha_ing
            }
            if proveedor_id:
                lote_data['proveedor_id'] = proveedor_id
            
            lote_response = self.supabase.table('lote').insert(lote_data).execute()
            lote_id = lote_response.data[0]['id']
            
            # 2. Procesar cada detalle (insumo)
            detalles_creados = []
            for detalle in detalles:
                insumo_id = detalle.get('insumo_id')
                stock_id = detalle.get('stock_id')
                cantidad = detalle.get('cantidad')
                costo_unitario = detalle.get('costo_unitario')
                
                if not all([insumo_id, stock_id, cantidad, costo_unitario]):
                    return Response({
                        'error': 'Cada detalle requiere: insumo_id, stock_id, cantidad, costo_unitario'
                    }, status=400)
                
                # Obtener vencimiento_dias del insumo
                insumo = self.supabase.table('insumo')\
                    .select('vencimiento_dias, nombre')\
                    .eq('id', insumo_id)\
                    .execute()
                
                if not insumo.data:
                    return Response({
                        'error': f'Insumo con ID {insumo_id} no encontrado'
                    }, status=404)
                
                vencimiento_dias = insumo.data[0]['vencimiento_dias']
                fecha_venc = date.fromisoformat(fecha_ing) + timedelta(days=vencimiento_dias)
                
                # Crear el detalle_lote
                detalle_data = {
                    'lote_id': lote_id,
                    'insumo_id': insumo_id,
                    'stock_id': stock_id,
                    'cantidad': cantidad,
                    'costo_unitario': costo_unitario,
                    'fecha_vencimiento': fecha_venc.isoformat()
                }
                
                detalle_response = self.supabase.table('detalle_lote')\
                    .insert(detalle_data)\
                    .execute()
                
                detalles_creados.append(detalle_response.data[0])
                
                # 3. Actualizar stock (sumar cantidad)
                stock_actual = self.supabase.table('stock')\
                    .select('cantidad')\
                    .eq('id', stock_id)\
                    .execute()
                
                if stock_actual.data:
                    nueva_cantidad = stock_actual.data[0]['cantidad'] + int(cantidad)
                    self.supabase.table('stock')\
                        .update({'cantidad': nueva_cantidad})\
                        .eq('id', stock_id)\
                        .execute()
            
            # 4. Obtener el lote completo con sus detalles para responder
            lote_completo = self.supabase.table('lote')\
                .select('*')\
                .eq('id', lote_id)\
                .execute()
            
            resultado = lote_completo.data[0]
            resultado['detalles'] = detalles_creados
            resultado['total_lote'] = sum(d['subtotal'] for d in detalles_creados) if detalles_creados else 0
            
            return Response(resultado, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, pk=None):
        """Obtener un lote específico con sus detalles"""
        try:
            # Obtener el lote
            lote = self.supabase.table('lote').select('*').eq('id', pk).execute()
            if not lote.data:
                return Response({'error': 'Lote no encontrado'}, status=404)
            
            # Obtener sus detalles
            detalles = self.supabase.table('detalle_lote')\
                .select('*, insumo(id, nombre), stock(id, ubicacion)')\
                .eq('lote_id', pk)\
                .execute()
            
            resultado = lote.data[0]
            resultado['detalles'] = detalles.data
            
            return Response(resultado)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, pk=None):
        """Eliminar un lote (borra en cascada los detalles)"""
        try:
            # Verificar que existe
            lote = self.supabase.table('lote').select('id').eq('id', pk).execute()
            if not lote.data:
                return Response({'error': 'Lote no encontrado'}, status=404)
            
            # El trigger ON DELETE CASCADE borrará los detalles automáticamente
            self.supabase.table('lote').delete().eq('id', pk).execute()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def total(self, request, pk=None):
        """Obtener solo el total del lote"""
        try:
            lote = self.supabase.table('lote').select('total_lote').eq('id', pk).execute()
            if not lote.data:
                return Response({'error': 'Lote no encontrado'}, status=404)
            return Response({'lote_id': pk, 'total': lote.data[0]['total_lote']})
        except Exception as e:
            return Response({'error': str(e)}, status=500)