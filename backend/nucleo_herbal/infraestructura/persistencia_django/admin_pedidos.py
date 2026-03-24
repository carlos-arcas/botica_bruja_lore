"""Backoffice Django Admin para pedidos reales e incidencias post-pago."""

from __future__ import annotations

from uuid import uuid4

from django.contrib import admin, messages
from django.http import HttpRequest

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_backoffice_pedidos import CancelarPedidoOperativoPorIncidenciaStock, MarcarIncidenciaStockRevisada
from ...dominio.excepciones import ErrorDominio
from .models_pedidos import LineaPedidoRealModelo, PedidoRealModelo
from .repositorios_pedidos import RepositorioPedidosORM


class IncidenciaStockFilter(admin.SimpleListFilter):
    title = "incidencia stock"
    parameter_name = "incidencia_stock"

    def lookups(self, request: HttpRequest, model_admin):
        return (
            ("con_incidencia", "Con incidencia"),
            ("pendiente_revision", "Pendiente revisión"),
            ("revisada", "Revisada"),
        )

    def queryset(self, request: HttpRequest, queryset):
        valor = self.value()
        if valor == "con_incidencia":
            return queryset.filter(incidencia_stock_confirmacion=True)
        if valor == "pendiente_revision":
            return queryset.filter(incidencia_stock_confirmacion=True, incidencia_stock_revisada=False)
        if valor == "revisada":
            return queryset.filter(incidencia_stock_confirmacion=True, incidencia_stock_revisada=True)
        return queryset


class LineaPedidoRealInline(admin.TabularInline):
    model = LineaPedidoRealModelo
    extra = 0
    can_delete = False
    readonly_fields = ("id_producto", "slug_producto", "nombre_producto", "cantidad", "precio_unitario", "moneda")


@admin.action(description="Marcar incidencia de stock como revisada")
def marcar_incidencia_stock_revisada(modeladmin, request: HttpRequest, queryset):
    caso = MarcarIncidenciaStockRevisada(repositorio_pedidos=RepositorioPedidosORM())
    actor = request.user.get_username() or "admin"
    revisados = 0
    omitidos = 0
    for pedido in queryset.filter(incidencia_stock_confirmacion=True):
        try:
            actualizado = caso.ejecutar(
                id_pedido=pedido.id_pedido,
                operation_id=f"admin-inc-stock-{uuid4().hex}",
                actor=actor,
            )
        except ErrorAplicacionLookup:
            omitidos += 1
            continue
        if actualizado.incidencia_stock_revisada:
            revisados += 1
        else:
            omitidos += 1
    if revisados:
        modeladmin.message_user(request, f"{revisados} incidencia(s) marcada(s) como revisada(s).", level=messages.SUCCESS)
    if omitidos:
        modeladmin.message_user(request, f"{omitidos} pedido(s) omitido(s): sin incidencia activa o ya revisados.", level=messages.WARNING)


@admin.action(description="Cancelar operativamente por incidencia de stock")
def cancelar_operativa_incidencia_stock(modeladmin, request: HttpRequest, queryset):
    caso = CancelarPedidoOperativoPorIncidenciaStock(repositorio_pedidos=RepositorioPedidosORM())
    actor = request.user.get_username() or "admin"
    cancelados = 0
    omitidos = 0
    for pedido in queryset:
        try:
            actualizado = caso.ejecutar(
                id_pedido=pedido.id_pedido,
                operation_id=f"admin-cancel-inc-stock-{uuid4().hex}",
                actor=actor,
                motivo_cancelacion="Cancelación operativa manual por incidencia de stock",
            )
        except (ErrorAplicacionLookup, ErrorDominio):
            omitidos += 1
            continue
        if actualizado.cancelado_operativa_incidencia_stock:
            cancelados += 1
        else:
            omitidos += 1
    if cancelados:
        modeladmin.message_user(
            request,
            f"{cancelados} pedido(s) cancelado(s) operativamente por incidencia de stock.",
            level=messages.SUCCESS,
        )
    if omitidos:
        modeladmin.message_user(
            request,
            f"{omitidos} pedido(s) omitido(s): estado no cancelable o sin incidencia de stock.",
            level=messages.WARNING,
        )


@admin.register(PedidoRealModelo)
class PedidoRealAdmin(admin.ModelAdmin):
    list_display = (
        "id_pedido",
        "nombre_cliente",
        "estado",
        "estado_pago",
        "inventario_descontado",
        "incidencia_stock_confirmacion",
        "incidencia_stock_revisada",
        "cancelado_operativa_incidencia_stock",
        "requiere_revision_manual",
        "fecha_operativa",
    )
    search_fields = ("id_pedido", "email_contacto", "nombre_contacto")
    list_filter = (
        "estado",
        "estado_pago",
        IncidenciaStockFilter,
        "inventario_descontado",
        "requiere_revision_manual",
        "cancelado_operativa_incidencia_stock",
        "canal_checkout",
        "es_invitado",
        "moneda",
    )
    ordering = ("-fecha_creacion",)
    readonly_fields = (
        "fecha_creacion",
        "fecha_pago_confirmado",
        "fecha_revision_incidencia_stock",
        "direccion_entrega",
    )
    inlines = (LineaPedidoRealInline,)
    actions = (marcar_incidencia_stock_revisada, cancelar_operativa_incidencia_stock)
    fieldsets = (
        (
            "Pedido",
            {
                "fields": (
                    "id_pedido",
                    "estado",
                    "estado_pago",
                    "canal_checkout",
                    "moneda",
                    "subtotal",
                    "fecha_creacion",
                    "fecha_pago_confirmado",
                )
            },
        ),
        (
            "Cliente",
            {
                "fields": (
                    "email_contacto",
                    "nombre_contacto",
                    "telefono_contacto",
                    "id_usuario",
                    "es_invitado",
                    "direccion_entrega",
                )
            },
        ),
        (
            "Operativa post-pago",
            {
                "fields": (
                    "inventario_descontado",
                    "incidencia_stock_confirmacion",
                    "incidencia_stock_revisada",
                    "fecha_revision_incidencia_stock",
                    "cancelado_operativa_incidencia_stock",
                    "fecha_cancelacion_operativa",
                    "motivo_cancelacion_operativa",
                    "requiere_revision_manual",
                    "observaciones_operativas",
                )
            },
        ),
        (
            "Pago y expedición",
            {
                "fields": (
                    "proveedor_pago",
                    "id_externo_pago",
                    "url_pago",
                    "email_post_pago_enviado",
                    "fecha_email_post_pago",
                    "transportista",
                    "codigo_seguimiento",
                    "envio_sin_seguimiento",
                    "fecha_preparacion",
                    "fecha_envio",
                    "fecha_entrega",
                    "email_envio_enviado",
                    "fecha_email_envio",
                )
            },
        ),
        ("Notas", {"fields": ("notas_cliente",)}),
    )

    @admin.display(description="Cliente")
    def nombre_cliente(self, obj: PedidoRealModelo) -> str:
        return obj.nombre_contacto

    @admin.display(description="Fecha operativa", ordering="fecha_pago_confirmado")
    def fecha_operativa(self, obj: PedidoRealModelo):
        return obj.fecha_cancelacion_operativa or obj.fecha_revision_incidencia_stock or obj.fecha_pago_confirmado or obj.fecha_creacion
