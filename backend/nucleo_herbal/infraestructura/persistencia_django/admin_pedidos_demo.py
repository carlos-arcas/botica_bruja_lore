"""Registro admin para pedidos demo."""

from django.contrib import admin

from .models import LineaPedidoModelo, PedidoDemoModelo


class LineaPedidoInline(admin.TabularInline):
    model = LineaPedidoModelo
    extra = 0
    can_delete = False
    fields = ("id_producto", "slug_producto", "nombre_producto", "cantidad", "precio_unitario_demo")
    readonly_fields = fields


@admin.register(PedidoDemoModelo)
class PedidoDemoAdmin(admin.ModelAdmin):
    list_display = ("id_pedido", "email_contacto", "canal_compra", "estado", "total_lineas", "fecha_creacion")
    search_fields = ("id_pedido", "email_contacto")
    list_filter = ("estado", "canal_compra", "fecha_creacion")
    ordering = ("-fecha_creacion",)
    list_editable = ("estado",)
    readonly_fields = ("id_pedido", "email_contacto", "canal_compra", "fecha_creacion", "id_usuario")
    inlines = (LineaPedidoInline,)

    @admin.display(description="nº líneas")
    def total_lineas(self, obj):
        return obj.lineas.count()
