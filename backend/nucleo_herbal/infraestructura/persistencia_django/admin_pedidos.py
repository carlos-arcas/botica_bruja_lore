"""Backoffice Django Admin para pedidos reales e incidencias post-pago."""

from __future__ import annotations

import logging
from uuid import uuid4

from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.http import HttpRequest

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_backoffice_pedidos import (
    CancelarPedidoOperativoPorIncidenciaStock,
    MarcarIncidenciaStockRevisada,
    ReembolsarPedidoCanceladoPorIncidenciaStock,
    RestituirInventarioManualPedidoCancelado,
)
from ...dominio.excepciones import ErrorDominio
from ..notificaciones_email import NotificadorEmailPostPago
from ..pagos_stripe import construir_pasarela_pago_stripe
from .repositorios_inventario import RepositorioInventarioORM, RepositorioMovimientosInventarioORM
from .models_pedidos import DevolucionPedidoModelo, LineaPedidoRealModelo, PedidoRealModelo
from .repositorios_pedidos import RepositorioPedidosORM
from .transacciones import TransaccionesDjango


logger = logging.getLogger(__name__)


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
    caso = CancelarPedidoOperativoPorIncidenciaStock(
        repositorio_pedidos=RepositorioPedidosORM(),
        notificador=NotificadorEmailPostPago(),
    )
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


@admin.action(description="Ejecutar reembolso manual por incidencia de stock")
def ejecutar_reembolso_manual_incidencia_stock(modeladmin, request: HttpRequest, queryset):
    caso = ReembolsarPedidoCanceladoPorIncidenciaStock(
        repositorio_pedidos=RepositorioPedidosORM(),
        pasarela_pago=construir_pasarela_pago_stripe(),
        transacciones=TransaccionesDjango(),
        notificador=NotificadorEmailPostPago(),
    )
    actor = request.user.get_username() or "admin"
    reembolsados = 0
    fallidos = 0
    omitidos = 0
    for pedido in queryset:
        try:
            resultado = caso.ejecutar(
                id_pedido=pedido.id_pedido,
                operation_id=f"admin-refund-inc-stock-{uuid4().hex}",
                actor=actor,
            )
        except (ErrorAplicacionLookup, ErrorDominio):
            fallidos += 1
            continue
        if resultado.estado_reembolso == "ejecutado":
            reembolsados += 1
        elif resultado.estado_reembolso == "fallido":
            fallidos += 1
        else:
            omitidos += 1
    if reembolsados:
        modeladmin.message_user(request, f"{reembolsados} pedido(s) reembolsado(s) manualmente.", level=messages.SUCCESS)
    if fallidos:
        modeladmin.message_user(
            request,
            f"{fallidos} pedido(s) con rechazo o fallo de reembolso. Revisa trazabilidad operativa.",
            level=messages.ERROR,
        )
    if omitidos:
        modeladmin.message_user(
            request,
            f"{omitidos} pedido(s) omitido(s): no reembolsables o ya reembolsados.",
            level=messages.WARNING,
        )


@admin.action(description="Restituir inventario manualmente (pedido cancelado)")
def restituir_inventario_manual(modeladmin, request: HttpRequest, queryset):
    caso = RestituirInventarioManualPedidoCancelado(
        repositorio_pedidos=RepositorioPedidosORM(),
        repositorio_inventario=RepositorioInventarioORM(),
        repositorio_movimientos=RepositorioMovimientosInventarioORM(),
        transacciones=TransaccionesDjango(),
    )
    actor = request.user.get_username() or "admin"
    restituidos = 0
    omitidos = 0
    for pedido in queryset:
        if pedido.inventario_restituido:
            omitidos += 1
            continue
        try:
            resultado = caso.ejecutar(
                id_pedido=pedido.id_pedido,
                operation_id=f"admin-restitucion-manual-{uuid4().hex}",
                actor=actor,
            )
        except (ErrorAplicacionLookup, ErrorDominio):
            omitidos += 1
            continue
        if resultado.inventario_restituido:
            restituidos += 1
        else:
            omitidos += 1
    if restituidos:
        modeladmin.message_user(
            request,
            f"{restituidos} pedido(s) con inventario restituido manualmente.",
            level=messages.SUCCESS,
        )
    if omitidos:
        modeladmin.message_user(
            request,
            f"{omitidos} pedido(s) omitido(s): no elegibles o ya restituidos.",
            level=messages.WARNING,
        )


def _aplicar_estado_devolucion(
    modeladmin,
    request: HttpRequest,
    queryset,
    *,
    estado_objetivo: str,
):
    actor = request.user.get_username() or "admin"
    actualizados = 0
    omitidos = 0
    for devolucion in queryset:
        previo = devolucion.estado
        if previo == estado_objetivo:
            omitidos += 1
            continue
        devolucion.estado = estado_objetivo
        devolucion.revisada_por = actor
        try:
            devolucion.save(update_fields=["estado", "revisada_por", "fecha_actualizacion"])
        except ValidationError:
            omitidos += 1
            logger.warning(
                "admin_devolucion_transicion_rechazada",
                extra={
                    "devolucion_id": devolucion.pk,
                    "pedido_id": devolucion.pedido_id,
                    "actor": actor,
                    "estado_anterior": previo,
                    "estado_nuevo": estado_objetivo,
                    "resultado": "rechazado",
                },
            )
            continue
        logger.info(
            "admin_devolucion_transicion",
            extra={
                "devolucion_id": devolucion.pk,
                "pedido_id": devolucion.pedido_id,
                "actor": actor,
                "estado_anterior": previo,
                "estado_nuevo": estado_objetivo,
                "resultado": "ok",
            },
        )
        actualizados += 1
    if actualizados:
        modeladmin.message_user(
            request,
            f"{actualizados} devolución(es) actualizada(s) a estado {estado_objetivo}.",
            level=messages.SUCCESS,
        )
    if omitidos:
        modeladmin.message_user(
            request,
            f"{omitidos} devolución(es) omitida(s): transición inválida o ya en estado objetivo.",
            level=messages.WARNING,
        )


@admin.action(description="Marcar devolución como recibida")
def marcar_devolucion_recibida(modeladmin, request: HttpRequest, queryset):
    _aplicar_estado_devolucion(
        modeladmin,
        request,
        queryset,
        estado_objetivo=DevolucionPedidoModelo.ESTADO_RECIBIDA,
    )


@admin.action(description="Marcar devolución como aceptada")
def marcar_devolucion_aceptada(modeladmin, request: HttpRequest, queryset):
    _aplicar_estado_devolucion(
        modeladmin,
        request,
        queryset,
        estado_objetivo=DevolucionPedidoModelo.ESTADO_ACEPTADA,
    )


@admin.action(description="Marcar devolución como rechazada")
def marcar_devolucion_rechazada(modeladmin, request: HttpRequest, queryset):
    _aplicar_estado_devolucion(
        modeladmin,
        request,
        queryset,
        estado_objetivo=DevolucionPedidoModelo.ESTADO_RECHAZADA,
    )


@admin.action(description="Cerrar devolución")
def cerrar_devolucion(modeladmin, request: HttpRequest, queryset):
    _aplicar_estado_devolucion(
        modeladmin,
        request,
        queryset,
        estado_objetivo=DevolucionPedidoModelo.ESTADO_CERRADA,
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
        "estado_reembolso",
        "inventario_restituido",
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
        "estado_reembolso",
        "inventario_restituido",
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
    actions = (
        marcar_incidencia_stock_revisada,
        cancelar_operativa_incidencia_stock,
        ejecutar_reembolso_manual_incidencia_stock,
        restituir_inventario_manual,
    )
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
                    "estado_reembolso",
                    "fecha_reembolso",
                    "id_externo_reembolso",
                    "motivo_fallo_reembolso",
                    "inventario_restituido",
                    "fecha_restitucion_inventario",
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
        return obj.fecha_reembolso or obj.fecha_cancelacion_operativa or obj.fecha_revision_incidencia_stock or obj.fecha_pago_confirmado or obj.fecha_creacion


@admin.register(DevolucionPedidoModelo)
class DevolucionPedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "pedido", "estado", "motivo", "abierta_por", "revisada_por", "fecha_apertura", "fecha_actualizacion")
    list_filter = ("estado", "pedido__estado", "pedido__estado_pago")
    search_fields = ("pedido__id_pedido", "motivo", "abierta_por", "revisada_por")
    readonly_fields = ("fecha_apertura", "fecha_actualizacion")
    autocomplete_fields = ("pedido",)
    actions = (marcar_devolucion_recibida, marcar_devolucion_aceptada, marcar_devolucion_rechazada, cerrar_devolucion)

    def save_model(self, request, obj, form, change):
        if not change and not obj.abierta_por:
            obj.abierta_por = request.user.get_username() or "admin"
            logger.info(
                "admin_devolucion_apertura",
                extra={"pedido_id": obj.pedido_id, "actor": obj.abierta_por, "estado": obj.estado, "resultado": "intento"},
            )
        super().save_model(request, obj, form, change)
