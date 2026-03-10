"""Puertos de persistencia para pedido demo del ciclo transaccional."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.pedidos_demo import PedidoDemo


class RepositorioPedidosDemo(ABC):
    @abstractmethod
    def guardar(self, pedido: PedidoDemo) -> PedidoDemo:
        """Persiste un agregado pedido demo y devuelve su versión reconstruida."""

    @abstractmethod
    def obtener_por_id(self, id_pedido: str) -> PedidoDemo | None:
        """Recupera un pedido demo por identificador de agregado."""

    @abstractmethod
    def actualizar_estado(self, id_pedido: str, estado: str) -> PedidoDemo | None:
        """Actualiza estado demo y devuelve agregado reconstruido."""
