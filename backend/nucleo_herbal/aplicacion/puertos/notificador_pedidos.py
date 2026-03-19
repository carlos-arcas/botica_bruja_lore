"""Puertos de notificación para eventos operativos de pedidos reales."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.pedidos import Pedido


class NotificadorPostPagoPedido(ABC):
    @abstractmethod
    def enviar_confirmacion_pago(self, pedido: Pedido, operation_id: str) -> None:
        """Envía la confirmación mínima al cliente tras pago confirmado."""

    @abstractmethod
    def enviar_confirmacion_envio(self, pedido: Pedido, operation_id: str) -> None:
        """Envía la confirmación mínima al cliente tras marcar un envío."""
