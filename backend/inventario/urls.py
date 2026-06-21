from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .proveedor_views import ProveedorListView, ProveedorDetailView, ProveedorInsumoView
from .mapa_views import ProveedorMapaView

router = DefaultRouter()
router.register(r'lotes', views.LoteViewSet, basename='lote')

urlpatterns = [
    path('', include(router.urls)),
    #--- CU17 GESTIONAR PROVEEDORES ---
    path('proveedores/', ProveedorListView.as_view(), name='proveedor-list'),

    #--- CU19 LOCALIZAR PROVEEDORES MEDIANTE MAPA ---
    # IMPORTANTE: mapa/ va ANTES de <int:proveedor_id>/ para evitar conflicto de rutas
    path('proveedores/mapa/', ProveedorMapaView.as_view(), name='proveedor-mapa'),

    path('proveedores/<int:proveedor_id>/', ProveedorDetailView.as_view(), name='proveedor-detail'),

    #--- CU18 ASOCIAR INSUMOS A PROVEEDORES ---
    path('proveedores/<int:proveedor_id>/insumos/', ProveedorInsumoView.as_view(), name='proveedor-insumo'),
    path('proveedores/<int:proveedor_id>/insumos/<int:insumo_id>/', ProveedorInsumoView.as_view(), name='proveedor-insumo-delete'),
]