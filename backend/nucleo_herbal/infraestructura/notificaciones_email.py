"""Adaptadores de email transaccional mínimo para pedidos reales."""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail

from ..aplicacion.puertos.notificador_pedidos import NotificadorPostPagoPedido
from ..dominio.pedidos import Pedido

logger = logging.getLogger(__name__)


class NotificadorEmailPostPago(NotificadorPostPagoPedido):
    def enviar_confirmacion_pago(self, pedido: Pedido, operation_id: str) -> None:
        send_mail(
            subject=f"Confirmación de pedido pagado {pedido.id_pedido}",
            message=_cuerpo_confirmacion_pago(pedido),
            from_email=_resolver_remitente(),
            recipient_list=[pedido.cliente.email],
            fail_silently=False,
        )
        _log_email(operation_id, pedido, "email_post_pago", "dispatch_ok")

    def enviar_confirmacion_envio(self, pedido: Pedido, operation_id: str) -> None:
        send_mail(
            subject=f"Tu pedido {pedido.id_pedido} ya ha sido enviado",
            message=_cuerpo_confirmacion_envio(pedido),
            from_email=_resolver_remitente(),
            recipient_list=[pedido.cliente.email],
            fail_silently=False,
        )
        _log_email(operation_id, pedido, "email_envio", "dispatch_ok")

    def enviar_cancelacion_operativa_stock(self, pedido: Pedido, operation_id: str) -> None:
        send_mail(
            subject=f"Pedido {pedido.id_pedido} cancelado por incidencia de stock",
            message=_cuerpo_cancelacion_operativa(pedido),
            from_email=_resolver_remitente(),
            recipient_list=[pedido.cliente.email],
            fail_silently=False,
        )
        _log_email(operation_id, pedido, "email_cancelacion", "dispatch_ok")

    def enviar_reembolso_manual_ejecutado(self, pedido: Pedido, operation_id: str) -> None:
        send_mail(
            subject=f"Reembolso ejecutado para el pedido {pedido.id_pedido}",
            message=_cuerpo_reembolso_ejecutado(pedido),
            from_email=_resolver_remitente(),
            recipient_list=[pedido.cliente.email],
            fail_silently=False,
        )
        _log_email(operation_id, pedido, "email_reembolso", "dispatch_ok")


def _cuerpo_confirmacion_pago(pedido: Pedido) -> str:
    lineas = "\n".join(
        f"- {linea.nombre_producto}: {linea.cantidad_comercial}{linea.unidad_comercial} · {linea.subtotal} {linea.moneda}"
        for linea in pedido.lineas
    )
    return (
        "Hemos recibido tu pago correctamente.\n"
        f"Pedido: {pedido.id_pedido}\n"
        f"Estado actual: {pedido.estado}\n"
        f"Subtotal: {pedido.subtotal} {pedido.moneda}\n"
        f"Envío estándar: {pedido.importe_envio} {pedido.moneda}\n"
        f"Total: {pedido.total} {pedido.moneda}\n"
        "Resumen:\n"
        f"{lineas}\n"
        "Próximo paso: revisaremos el pedido y lo pasaremos a preparación cuando corresponda.\n"
        "Aviso: esta confirmación no implica todavía logística avanzada ni promesa de expedición inmediata."
    )


def _cuerpo_confirmacion_envio(pedido: Pedido) -> str:
    seguimiento = pedido.codigo_seguimiento or "Sin código de seguimiento; el envío se gestiona sin tracking público."
    return (
        "Tu pedido ya ha salido de preparación.\n"
        f"Pedido: {pedido.id_pedido}\n"
        f"Transportista: {pedido.transportista}\n"
        f"Código de seguimiento: {seguimiento}\n"
        f"Estado actual: {pedido.estado}\n"
        "Te avisaremos si se registra la entrega en el backoffice."
    )


def _cuerpo_cancelacion_operativa(pedido: Pedido) -> str:
    return (
        "Hemos cancelado tu pedido por una incidencia de stock detectada tras la confirmación de pago.\n"
        f"Pedido: {pedido.id_pedido}\n"
        f"Estado actual: {pedido.estado}\n"
        f"Motivo operativo: {pedido.motivo_cancelacion_operativa}\n"
        "Siguiente paso: tramitaremos o revisaremos el reembolso manual según el estado operativo del pedido.\n"
        "Si ya ves un reembolso ejecutado en tu área de cuenta, este correo puede cruzarse con esa actualización."
    )


def _cuerpo_reembolso_ejecutado(pedido: Pedido) -> str:
    referencia = pedido.id_externo_reembolso or "sin referencia externa disponible"
    return (
        "Hemos ejecutado el reembolso manual de tu pedido cancelado por incidencia de stock.\n"
        f"Pedido: {pedido.id_pedido}\n"
        f"Estado de reembolso: {pedido.estado_reembolso}\n"
        f"Referencia de reembolso: {referencia}\n"
        "El plazo de reflejo en tu método de pago depende de tu banco o proveedor."
    )


def _resolver_remitente() -> str:
    remitente = getattr(settings, "DEFAULT_FROM_EMAIL", "").strip()
    return remitente or "no-reply@botica-lore.local"


def _log_email(operation_id: str, pedido: Pedido, evento: str, resultado: str) -> None:
    logger.info(
        f"pedido_{evento}_dispatch",
        extra={
            "operation_id": operation_id,
            "pedido_id": pedido.id_pedido,
            "id_externo_pago": pedido.id_externo_pago,
            "email_contacto": pedido.cliente.email,
            "estado_anterior": pedido.estado,
            "estado_nuevo": pedido.estado,
            "transportista": pedido.transportista,
            "codigo_seguimiento": pedido.codigo_seguimiento,
            "evento": evento,
            "resultado": resultado,
        },
    )
