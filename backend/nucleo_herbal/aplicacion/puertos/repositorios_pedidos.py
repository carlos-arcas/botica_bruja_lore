"""Puertos de persistencia para el agregado Pedido real."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.pedidos import Pedido


class RepositorioPedidos(ABC):
    @abstractmethod
    def guardar(self, pedido: Pedido) -> Pedido:
        """Persiste un pedido real y devuelve el agregado reconstruido."""

    @abstractmethod
    def obtener_por_id(self, id_pedido: str) -> Pedido | None:
        """Recupera un pedido real por identificador."""

    @abstractmethod
    def obtener_por_pago_externo(self, proveedor_pago: str, id_externo_pago: str) -> Pedido | None:
        """Recupera un pedido por referencia externa de pago."""

    @abstractmethod
    def guardar_evento_webhook(self, proveedor_pago: str, id_evento: str, payload_crudo: str) -> bool:
        """Registra un evento de webhook y devuelve False si ya existía."""

    @abstractmethod
    def listar(self, *, solo_pagados: bool = False) -> tuple[Pedido, ...]:
        """Lista pedidos reales para operación administrativa mínima."""
