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

    @abstractmethod
    def enviar_cancelacion_operativa_stock(self, pedido: Pedido, operation_id: str) -> None:
        """Envía la cancelación operativa por incidencia de stock."""

    @abstractmethod
    def enviar_reembolso_manual_ejecutado(self, pedido: Pedido, operation_id: str) -> None:
        """Envía confirmación de reembolso manual ejecutado."""
