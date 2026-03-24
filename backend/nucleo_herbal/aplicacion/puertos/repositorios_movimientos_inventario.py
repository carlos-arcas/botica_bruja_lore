"""Puertos de persistencia para ledger mínimo de inventario."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.inventario_movimientos import MovimientoInventario


class RepositorioMovimientosInventario(ABC):
    @abstractmethod
    def registrar(self, movimiento: MovimientoInventario) -> None:
        """Registra un movimiento de inventario auditable."""

    @abstractmethod
    def listar_por_producto(self, id_producto: str, *, limite: int = 10) -> tuple[MovimientoInventario, ...]:
        """Devuelve los últimos movimientos de inventario para un producto."""
