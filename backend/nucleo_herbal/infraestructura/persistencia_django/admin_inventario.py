"""Admin mínimo para operación interna de inventario."""

from django.contrib import admin

from .models_inventario import InventarioProductoModelo, MovimientoInventarioModelo


class MovimientoInventarioInline(admin.TabularInline):
    model = MovimientoInventarioModelo
    extra = 0
    can_delete = False
    fields = ("fecha_creacion", "tipo_movimiento", "cantidad", "unidad_base", "referencia", "operation_id")
    readonly_fields = fields
    ordering = ("-fecha_creacion", "-id")


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
    inlines = (MovimientoInventarioInline,)
    fieldsets = (
        ("Inventario", {"fields": ("producto", "cantidad_disponible", "unidad_base", "umbral_bajo_stock")}),
        ("Trazabilidad", {"fields": ("fecha_creacion", "fecha_actualizacion")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("producto")

    def save_model(self, request, obj, form, change):
        cantidad_anterior = 0
        if change:
            previo = InventarioProductoModelo.objects.filter(pk=obj.pk).only("cantidad_disponible").first()
            cantidad_anterior = 0 if previo is None else previo.cantidad_disponible
        super().save_model(request, obj, form, change)
        delta = obj.cantidad_disponible - cantidad_anterior
        if not change:
            _registrar_movimiento_admin(
                inventario=obj,
                tipo_movimiento=MovimientoInventarioModelo.TIPO_ALTA_INICIAL,
                cantidad=obj.cantidad_disponible,
                referencia="admin_alta_inicial",
                operation_id=f"admin:{request.user.pk}:alta:{obj.producto_id}",
            )
            return
        if delta == 0:
            return
        _registrar_movimiento_admin(
            inventario=obj,
            tipo_movimiento=MovimientoInventarioModelo.TIPO_AJUSTE_MANUAL,
            cantidad=delta,
            referencia="admin_ajuste_manual",
            operation_id=f"admin:{request.user.pk}:ajuste:{obj.producto_id}:{obj.fecha_actualizacion.isoformat()}",
        )

    @admin.display(boolean=True, description="Bajo stock")
    def mostrar_bajo_stock(self, obj):
        if obj.umbral_bajo_stock is None:
            return False
        return obj.cantidad_disponible <= obj.umbral_bajo_stock


def _registrar_movimiento_admin(
    *,
    inventario: InventarioProductoModelo,
    tipo_movimiento: str,
    cantidad: int,
    referencia: str,
    operation_id: str,
) -> None:
    MovimientoInventarioModelo.objects.create(
        inventario=inventario,
        tipo_movimiento=tipo_movimiento,
        cantidad=cantidad,
        unidad_base=inventario.unidad_base,
        referencia=referencia,
        operation_id=operation_id,
    )
