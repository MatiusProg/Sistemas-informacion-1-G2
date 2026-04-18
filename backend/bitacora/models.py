"""
Modelo de Bitácora para el Sistema de Almacenes Gastronómicos.

Este módulo define la tabla 'bitacora' que registra todas las acciones
de los usuarios en el sistema con fines de auditoría y trazabilidad.

Cada registro contiene:
- Quién realizó la acción (usuario_id, usuario_email)
- Qué acción realizó (accion)
- Cuándo la realizó (fecha)
- Detalles adicionales en formato JSON (IP, cambios específicos, etc.)

Autor: Grupo 2 - INF342
Fecha: Abril 2026
"""

from django.db import models
import uuid


class Bitacora(models.Model):
    """
    Modelo principal para el registro de auditoría del sistema.
    
    Esta tabla almacena un historial completo de todas las acciones
    relevantes realizadas por los usuarios en el sistema.
    """
    
    # Identificador único universal (UUID) para cada registro
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Identificador único universal del registro de bitácora"
    )
    
    # Referencia al usuario que realizó la acción (UUID de Supabase)
    usuario_id = models.UUIDField(
        help_text="UUID del usuario que realizó la acción (referencia a Supabase auth.users)"
    )
    
    # Email del usuario (para consultas rápidas sin necesidad de JOIN)
    usuario_email = models.EmailField(
        help_text="Email del usuario al momento de la acción (para consultas rápidas)"
    )
    
    # Tipo de acción realizada
    accion = models.CharField(
        max_length=255,
        help_text="Tipo de acción realizada: LOGIN, LOGOUT, REGISTER, CHANGE_ROLE, TOGGLE_ACTIVE, etc."
    )
    
    # Campo JSON para almacenar información adicional variable
    detalles = models.JSONField(
        default=dict,
        help_text="Información adicional en formato JSON: IP, navegador, cambios realizados, etc."
    )
    
    # Fecha y hora automática del registro
    fecha = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora exacta en que se registró la acción (UTC)"
    )
    
    class Meta:
        """Configuración metadata del modelo."""
        db_table = 'bitacora'  # Nombre exacto de la tabla en Supabase
        ordering = ['-fecha']  # Ordenar por fecha descendente (más reciente primero)
        verbose_name = 'Registro de Bitácora'
        verbose_name_plural = 'Bitácora del Sistema'
    
    def __str__(self):
        """Representación legible del registro."""
        return f"[{self.fecha.strftime('%Y-%m-%d %H:%M')}] {self.usuario_email} - {self.accion}"