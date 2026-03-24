"""Admin mínimo para operación interna de inventario."""

from django.contrib import admin
from django.db.models import F

from .models_inventario import InventarioProductoModelo


@admin.register(InventarioProductoModelo)
class InventarioProductoAdmin(admin.ModelAdmin):
    list_display = (
        "producto",
        "cantidad_disponible",
        "unidad_base",
        "umbral_bajo_stock",
        "mostrar_bajo_stock",
        "fecha_actualizacion",
    )
    search_fields = ("producto__nombre", "producto__sku", "producto__slug")
    list_filter = ("producto__tipo_producto",)
    autocomplete_fields = ("producto",)
    ordering = ("producto__nombre",)
    list_editable = ("cantidad_disponible", "unidad_base", "umbral_bajo_stock")
    readonly_fields = ("fecha_creacion", "fecha_actualizacion")
    fieldsets = (
        ("Inventario", {"fields": ("producto", "cantidad_disponible", "unidad_base", "umbral_bajo_stock")}),
        ("Trazabilidad", {"fields": ("fecha_creacion", "fecha_actualizacion")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("producto")

    @admin.display(boolean=True, description="Bajo stock")
    def mostrar_bajo_stock(self, obj):
        if obj.umbral_bajo_stock is None:
            return False
        return obj.cantidad_disponible <= obj.umbral_bajo_stock
