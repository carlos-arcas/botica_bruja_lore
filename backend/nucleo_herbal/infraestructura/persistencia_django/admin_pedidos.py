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
    DatosEnvioBackoffice,
    MarcarIncidenciaStockRevisada,
    MarcarPedidoEntregado,
    MarcarPedidoEnviado,
    MarcarPedidoPreparando,
    RestituirInventarioManualPedidoCancelado,
)
from ...aplicacion.casos_de_uso_postventa_local import (
    ReembolsarPagoSimuladoManualPedido,
    RestituirInventarioManualPostventa,
)
from ...dominio.excepciones import ErrorDominio
from ..notificaciones_email import NotificadorEmailPostPago
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


class EstadoOperativoFilter(admin.SimpleListFilter):
    title = "estado operativo"
    parameter_name = "estado_operativo"

    def lookups(self, request: HttpRequest, model_admin):
        return (
            ("pendiente_pago", "Pendiente pago"),
            ("pagado", "Pagado"),
            ("preparando", "Preparando"),
            ("enviado", "Enviado"),
            ("entregado", "Entregado"),
            ("requiere_revision_manual", "Requiere revision manual"),
            ("incidencia_stock_confirmacion", "Incidencia stock confirmacion"),
        )

    def queryset(self, request: HttpRequest, queryset):
        valor = self.value()
        if valor in {"pendiente_pago", "pagado", "preparando", "enviado", "entregado"}:
            return queryset.filter(estado=valor)
        if valor == "requiere_revision_manual":
            return queryset.filter(requiere_revision_manual=True)
        if valor == "incidencia_stock_confirmacion":
            return queryset.filter(incidencia_stock_confirmacion=True)
        return queryset


class PagoSimuladoLocalFilter(admin.SimpleListFilter):
    title = "pago simulado local"
    parameter_name = "pago_simulado_local"

    def lookups(self, request: HttpRequest, model_admin):
        return (("si", "Si"), ("no", "No"))

    def queryset(self, request: HttpRequest, queryset):
        if self.value() == "si":
            return queryset.filter(proveedor_pago="simulado_local")
        if self.value() == "no":
            return queryset.exclude(proveedor_pago="simulado_local")
        return queryset


class LineaPedidoRealInline(admin.TabularInline):
    model = LineaPedidoRealModelo
    extra = 0
    can_delete = False
    readonly_fields = ("id_producto", "slug_producto", "nombre_producto", "cantidad", "precio_unitario", "moneda")


@admin.action(description="Marcar como preparando")
def marcar_pedido_preparando(modeladmin, request: HttpRequest, queryset):
    caso = MarcarPedidoPreparando(repositorio_pedidos=RepositorioPedidosORM())
    _ejecutar_accion_pedidos(
        modeladmin,
        request,
        queryset,
        lambda pedido, actor: caso.ejecutar(pedido.id_pedido, f"admin-preparando-{uuid4().hex}", actor),
        evento="marcar_preparando",
        etiqueta_ok="pedido(s) marcado(s) como preparando.",
        etiqueta_omitido="pedido(s) omitido(s): solo pedidos pagados pueden prepararse.",
    )


@admin.action(description="Marcar como enviado")
def marcar_pedido_enviado(modeladmin, request: HttpRequest, queryset):
    caso = MarcarPedidoEnviado(
        repositorio_pedidos=RepositorioPedidosORM(),
        notificador=NotificadorEmailPostPago(),
    )
    _ejecutar_accion_pedidos(
        modeladmin,
        request,
        queryset,
        lambda pedido, actor: caso.ejecutar(
            pedido.id_pedido,
            _datos_envio_desde_modelo(pedido),
            f"admin-enviado-{uuid4().hex}",
            actor,
        ),
        evento="marcar_enviado",
        etiqueta_ok="pedido(s) marcado(s) como enviado(s).",
        etiqueta_omitido="pedido(s) omitido(s): requiere estado preparando y tracking o envio sin seguimiento.",
    )


@admin.action(description="Marcar como entregado")
def marcar_pedido_entregado(modeladmin, request: HttpRequest, queryset):
    caso = MarcarPedidoEntregado(repositorio_pedidos=RepositorioPedidosORM())
    _ejecutar_accion_pedidos(
        modeladmin,
        request,
        queryset,
        lambda pedido, actor: caso.ejecutar(
            pedido.id_pedido,
            f"admin-entregado-{uuid4().hex}",
            actor,
            pedido.observaciones_operativas,
        ),
        evento="marcar_entregado",
        etiqueta_ok="pedido(s) marcado(s) como entregado(s).",
        etiqueta_omitido="pedido(s) omitido(s): solo pedidos enviados pueden entregarse.",
    )


def _datos_envio_desde_modelo(pedido: PedidoRealModelo) -> DatosEnvioBackoffice:
    return DatosEnvioBackoffice(
        transportista=pedido.transportista,
        codigo_seguimiento=pedido.codigo_seguimiento,
        envio_sin_seguimiento=pedido.envio_sin_seguimiento,
        observaciones_operativas=pedido.observaciones_operativas,
    )


def _ejecutar_accion_pedidos(modeladmin, request: HttpRequest, queryset, accion, *, evento: str, etiqueta_ok: str, etiqueta_omitido: str) -> None:
    actor = request.user.get_username() or "admin"
    actualizados = 0
    omitidos = 0
    for pedido in queryset:
        try:
            accion(pedido, actor)
        except (ErrorAplicacionLookup, ErrorDominio) as error:
            _log_accion_admin_rechazada(pedido, actor, evento, str(error))
            omitidos += 1
            continue
        actualizados += 1
    if actualizados:
        modeladmin.message_user(request, f"{actualizados} {etiqueta_ok}", level=messages.SUCCESS)
    if omitidos:
        modeladmin.message_user(request, f"{omitidos} {etiqueta_omitido}", level=messages.WARNING)


def _log_accion_admin_rechazada(pedido: PedidoRealModelo, actor: str, evento: str, error: str) -> None:
    logger.warning(
        f"admin_pedido_real_{evento}_rechazado",
        extra={
            "operation_id": f"admin-rechazado-{uuid4().hex}",
            "pedido_id": pedido.id_pedido,
            "actor": actor,
            "estado_anterior": pedido.estado,
            "estado_nuevo": pedido.estado,
            "proveedor_pago": pedido.proveedor_pago,
            "resultado": "rechazado",
            "error": error,
        },
    )


def _caso_reembolso_simulado() -> ReembolsarPagoSimuladoManualPedido:
    return ReembolsarPagoSimuladoManualPedido(
        repositorio_pedidos=RepositorioPedidosORM(),
        transacciones=TransaccionesDjango(),
    )


def _caso_restitucion_postventa() -> RestituirInventarioManualPostventa:
    return RestituirInventarioManualPostventa(
        repositorio_pedidos=RepositorioPedidosORM(),
        repositorio_inventario=RepositorioInventarioORM(),
        repositorio_movimientos=RepositorioMovimientosInventarioORM(),
        transacciones=TransaccionesDjango(),
    )


def _log_rechazo_admin_postventa(pedido: PedidoRealModelo, actor: str, evento: str, error: str) -> None:
    logger.warning(
        f"admin_postventa_{evento}_rechazado",
        extra={
            "operation_id": f"admin-postventa-rechazado-{uuid4().hex}",
            "pedido_id": pedido.id_pedido,
            "actor": actor,
            "estado": pedido.estado,
            "estado_reembolso": pedido.estado_reembolso,
            "proveedor_pago": pedido.proveedor_pago,
            "resultado": "rechazado",
            "error": error,
        },
    )


def _total_pedido_admin(pedido: PedidoRealModelo):
    impuestos_lineas = sum((linea.importe_impuestos for linea in pedido.lineas.all()), pedido.subtotal * 0)
    impuestos_envio = pedido.importe_envio * pedido.tipo_impositivo
    return pedido.subtotal + pedido.importe_envio + impuestos_lineas + impuestos_envio


def _cambios_operativos(campos: list[str]) -> bool:
    campos_operativos = {
        "estado",
        "transportista",
        "codigo_seguimiento",
        "envio_sin_seguimiento",
        "observaciones_operativas",
        "requiere_revision_manual",
        "incidencia_stock_revisada",
        "estado_reembolso",
    }
    return bool(campos_operativos.intersection(campos))


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
    caso = _caso_reembolso_simulado()
    actor = request.user.get_username() or "admin"
    reembolsados = 0
    omitidos = 0
    for pedido in queryset:
        if pedido.proveedor_pago != "simulado_local":
            _log_rechazo_admin_postventa(pedido, actor, "reembolso_simulado_manual", "proveedor_no_simulado")
            omitidos += 1
            continue
        try:
            resultado = caso.ejecutar(
                id_pedido=pedido.id_pedido,
                operation_id=f"admin-refund-simulado-{uuid4().hex}",
                actor=actor,
            )
        except (ErrorAplicacionLookup, ErrorDominio):
            omitidos += 1
            continue
        if resultado.estado_reembolso == "ejecutado":
            reembolsados += 1
        else:
            omitidos += 1
    if reembolsados:
        modeladmin.message_user(request, f"{reembolsados} pedido(s) con reembolso simulado/manual ejecutado.", level=messages.SUCCESS)
    if omitidos:
        modeladmin.message_user(
            request,
            f"{omitidos} pedido(s) omitido(s): no simulado_local, no elegible o ya reembolsado.",
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


def _devolucion_elegible_reembolso(devolucion: DevolucionPedidoModelo) -> bool:
    return devolucion.estado == DevolucionPedidoModelo.ESTADO_ACEPTADA and devolucion.reembolso_operativo == "pendiente"


def _devolucion_elegible_restitucion(devolucion: DevolucionPedidoModelo) -> bool:
    return devolucion.estado == DevolucionPedidoModelo.ESTADO_ACEPTADA and devolucion.restitucion_operativa == "pendiente"


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


@admin.action(description="Ejecutar reembolso manual (devolución aceptada)")
def ejecutar_reembolso_manual_desde_devolucion(modeladmin, request: HttpRequest, queryset):
    caso = _caso_reembolso_simulado()
    actor = request.user.get_username() or "admin"
    reembolsadas = 0
    omitidas = 0
    for devolucion in queryset.select_related("pedido"):
        if not _devolucion_elegible_reembolso(devolucion):
            omitidas += 1
            continue
        if devolucion.pedido.proveedor_pago != "simulado_local":
            omitidas += 1
            logger.warning(
                "admin_devolucion_reembolso_no_simulado",
                extra={"devolucion_id": devolucion.pk, "pedido_id": devolucion.pedido_id, "actor": actor, "resultado": "rechazado"},
            )
            continue
        try:
            caso.ejecutar(
                id_pedido=devolucion.pedido_id,
                operation_id=f"admin-devol-refund-sim-{uuid4().hex}",
                actor=actor,
            )
        except (ErrorAplicacionLookup, ErrorDominio):
            omitidas += 1
            logger.warning(
                "admin_devolucion_reembolso_rechazado",
                extra={"devolucion_id": devolucion.pk, "pedido_id": devolucion.pedido_id, "actor": actor, "resultado": "rechazado"},
            )
            continue
        reembolsadas += 1
        logger.info(
            "admin_devolucion_reembolso_ejecutado",
            extra={"devolucion_id": devolucion.pk, "pedido_id": devolucion.pedido_id, "actor": actor, "resultado": "ok"},
        )
    if reembolsadas:
        modeladmin.message_user(request, f"{reembolsadas} devolución(es) con reembolso simulado/manual ejecutado.", level=messages.SUCCESS)
    if omitidas:
        modeladmin.message_user(request, f"{omitidas} devolución(es) omitida(s): no elegibles o reembolso rechazado.", level=messages.WARNING)


@admin.action(description="Restituir inventario manual (devolución aceptada)")
def restituir_inventario_desde_devolucion(modeladmin, request: HttpRequest, queryset):
    caso = _caso_restitucion_postventa()
    actor = request.user.get_username() or "admin"
    restituidas = 0
    omitidas = 0
    for devolucion in queryset.select_related("pedido"):
        if not _devolucion_elegible_restitucion(devolucion):
            omitidas += 1
            continue
        try:
            caso.ejecutar(
                id_pedido=devolucion.pedido_id,
                operation_id=f"admin-devol-stock-{uuid4().hex}",
                actor=actor,
            )
        except (ErrorAplicacionLookup, ErrorDominio):
            omitidas += 1
            logger.warning(
                "admin_devolucion_restitucion_rechazada",
                extra={"devolucion_id": devolucion.pk, "pedido_id": devolucion.pedido_id, "actor": actor, "resultado": "rechazado"},
            )
            continue
        restituidas += 1
        logger.info(
            "admin_devolucion_restitucion_ejecutada",
            extra={"devolucion_id": devolucion.pk, "pedido_id": devolucion.pedido_id, "actor": actor, "resultado": "ok"},
        )
    if restituidas:
        modeladmin.message_user(request, f"{restituidas} devolución(es) con restitución manual ejecutada.", level=messages.SUCCESS)
    if omitidas:
        modeladmin.message_user(request, f"{omitidas} devolución(es) omitida(s): no elegibles o restitución rechazada.", level=messages.WARNING)


@admin.register(PedidoRealModelo)
class PedidoRealAdmin(admin.ModelAdmin):
    list_display = (
        "id_pedido",
        "nombre_cliente",
        "email_contacto",
        "total_pedido",
        "estado",
        "estado_pago",
        "proveedor_pago",
        "pago_simulado_local",
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
        EstadoOperativoFilter,
        "estado",
        "estado_pago",
        "proveedor_pago",
        PagoSimuladoLocalFilter,
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
        marcar_pedido_preparando,
        marcar_pedido_enviado,
        marcar_pedido_entregado,
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
                    "importe_envio",
                    "tipo_impositivo",
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

    @admin.display(boolean=True, description="Pago simulado")
    def pago_simulado_local(self, obj: PedidoRealModelo) -> bool:
        return obj.proveedor_pago == "simulado_local"

    @admin.display(description="Total")
    def total_pedido(self, obj: PedidoRealModelo) -> str:
        return f"{_total_pedido_admin(obj)} {obj.moneda}"

    @admin.display(description="Fecha operativa", ordering="fecha_pago_confirmado")
    def fecha_operativa(self, obj: PedidoRealModelo):
        return obj.fecha_reembolso or obj.fecha_cancelacion_operativa or obj.fecha_revision_incidencia_stock or obj.fecha_pago_confirmado or obj.fecha_creacion

    def save_model(self, request, obj, form, change):
        anterior = PedidoRealModelo.objects.filter(pk=obj.pk).first() if change else None
        super().save_model(request, obj, form, change)
        if anterior is not None and _cambios_operativos(form.changed_data):
            logger.info(
                "admin_pedido_real_edicion_operativa",
                extra={
                    "operation_id": f"admin-save-{uuid4().hex}",
                    "pedido_id": obj.id_pedido,
                    "actor": request.user.get_username() or "admin",
                    "estado_anterior": anterior.estado,
                    "estado_nuevo": obj.estado,
                    "proveedor_pago": obj.proveedor_pago,
                    "campos": ",".join(form.changed_data),
                    "resultado": "ok",
                },
            )


@admin.register(DevolucionPedidoModelo)
class DevolucionPedidoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "pedido",
        "estado",
        "resumen_operativo",
        "reembolso_operativo_admin",
        "restitucion_operativa_admin",
        "motivo",
        "abierta_por",
        "revisada_por",
        "fecha_apertura",
        "fecha_actualizacion",
    )
    list_filter = ("estado", "pedido__estado", "pedido__estado_pago")
    search_fields = ("pedido__id_pedido", "motivo", "abierta_por", "revisada_por")
    readonly_fields = ("fecha_apertura", "fecha_actualizacion")
    autocomplete_fields = ("pedido",)
    actions = (
        marcar_devolucion_recibida,
        marcar_devolucion_aceptada,
        marcar_devolucion_rechazada,
        cerrar_devolucion,
        ejecutar_reembolso_manual_desde_devolucion,
        restituir_inventario_desde_devolucion,
    )

    def save_model(self, request, obj, form, change):
        if not change and not obj.abierta_por:
            obj.abierta_por = request.user.get_username() or "admin"
            logger.info(
                "admin_devolucion_apertura",
                extra={"pedido_id": obj.pedido_id, "actor": obj.abierta_por, "estado": obj.estado, "resultado": "intento"},
            )
        super().save_model(request, obj, form, change)

    @admin.display(description="Estado reembolso")
    def reembolso_operativo_admin(self, obj: DevolucionPedidoModelo) -> str:
        return obj.reembolso_operativo

    @admin.display(description="Estado restitución")
    def restitucion_operativa_admin(self, obj: DevolucionPedidoModelo) -> str:
        return obj.restitucion_operativa

    @admin.display(description="Resolución operativa")
    def resumen_operativo(self, obj: DevolucionPedidoModelo) -> str:
        if obj.esta_resuelta_operativamente:
            return "resuelta"
        if obj.estado == DevolucionPedidoModelo.ESTADO_ACEPTADA:
            return "pendiente"
        return "no_aplica"
