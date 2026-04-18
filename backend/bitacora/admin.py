"""
Configuración del panel de administración de Django para el modelo Bitacora.
"""

from django.contrib import admin
from .models import Bitacora


@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    """
    Configuración personalizada para visualizar la bitácora en el admin de Django.
    """
    list_display = ('fecha', 'usuario_email', 'accion', 'resumen_detalles')
    list_filter = ('accion', 'fecha')
    search_fields = ('usuario_email', 'accion', 'detalles')
    readonly_fields = ('id', 'usuario_id', 'usuario_email', 'accion', 'detalles', 'fecha')
    date_hierarchy = 'fecha'
    
    def resumen_detalles(self, obj):
        """Muestra un resumen de los detalles en la lista."""
        if obj.detalles:
            # Mostrar IP si existe
            if 'ip' in obj.detalles:
                return f"IP: {obj.detalles['ip']}"
            # O mostrar el primer par clave-valor
            first_key = list(obj.detalles.keys())[0]
            return f"{first_key}: {obj.detalles[first_key]}"
        return "-"
    resumen_detalles.short_description = "Detalles"