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
            message=_cuerpo_confirmacion(pedido),
            from_email=_resolver_remitente(),
            recipient_list=[pedido.cliente.email],
            fail_silently=False,
        )
        logger.info(
            "pedido_post_pago_email_dispatch",
            extra={
                "operation_id": operation_id,
                "pedido_id": pedido.id_pedido,
                "id_externo_pago": pedido.id_externo_pago,
                "email_contacto": pedido.cliente.email,
                "estado_anterior": pedido.estado,
                "estado_nuevo": pedido.estado,
                "evento": "email_post_pago",
                "resultado": "dispatch_ok",
            },
        )


def _cuerpo_confirmacion(pedido: Pedido) -> str:
    lineas = "\n".join(
        f"- {linea.nombre_producto}: {linea.cantidad}u · {linea.subtotal} {linea.moneda}"
        for linea in pedido.lineas
    )
    return (
        "Hemos recibido tu pago correctamente.\n"
        f"Pedido: {pedido.id_pedido}\n"
        f"Estado actual: {pedido.estado}\n"
        f"Importe: {pedido.subtotal} {pedido.moneda}\n"
        "Resumen:\n"
        f"{lineas}\n"
        "Próximo paso: revisaremos el pedido y lo pasaremos a preparación cuando corresponda.\n"
        "Aviso: esta confirmación no implica todavía logística avanzada ni promesa de expedición inmediata."
    )


def _resolver_remitente() -> str:
    remitente = getattr(settings, "DEFAULT_FROM_EMAIL", "").strip()
    return remitente or "no-reply@botica-lore.local"
