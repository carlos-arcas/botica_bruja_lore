"""Orquestación de efectos post-pago reales desacoplados del webhook."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from ..dominio.pedidos import Pedido
from .puertos.notificador_pedidos import NotificadorPostPagoPedido
from .puertos.repositorios_pedidos import RepositorioPedidos

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ProcesarPostPagoPedido:
    repositorio_pedidos: RepositorioPedidos
    notificador: NotificadorPostPagoPedido

    def ejecutar(self, pedido: Pedido, operation_id: str, tipo_evento: str) -> Pedido:
        actualizado = pedido.marcar_pagado(datetime.now(tz=UTC))
        persistido = self.repositorio_pedidos.guardar(actualizado)
        logger.info("pedido_post_pago_transicion_ok", extra=_extra(persistido, operation_id, tipo_evento, pedido.estado, "ok"))
        return self._enviar_email_si_aplica(persistido, operation_id, tipo_evento)

    def _enviar_email_si_aplica(self, pedido: Pedido, operation_id: str, tipo_evento: str) -> Pedido:
        if pedido.email_post_pago_enviado:
            logger.info("pedido_post_pago_email_omitido", extra=_extra(pedido, operation_id, tipo_evento, pedido.estado, "ya_enviado"))
            return pedido
        try:
            self.notificador.enviar_confirmacion_pago(pedido, operation_id)
        except Exception as error:  # noqa: BLE001
            logger.error(
                "pedido_post_pago_email_error",
                extra={**_extra(pedido, operation_id, tipo_evento, pedido.estado, "error"), "error": str(error)},
            )
            return pedido
        actualizado = pedido.marcar_email_post_pago_enviado(datetime.now(tz=UTC))
        persistido = self.repositorio_pedidos.guardar(actualizado)
        logger.info("pedido_post_pago_email_enviado", extra=_extra(persistido, operation_id, tipo_evento, persistido.estado, "ok"))
        return persistido


def _extra(pedido: Pedido, operation_id: str, tipo_evento: str, estado_anterior: str, resultado: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": pedido.id_pedido,
        "id_externo_pago": pedido.id_externo_pago,
        "email_contacto": pedido.cliente.email,
        "estado_anterior": estado_anterior,
        "estado_nuevo": pedido.estado,
        "evento": tipo_evento,
        "resultado": resultado,
    }
