"""Errores y detalles operativos del post-pago real."""

from __future__ import annotations

from dataclasses import dataclass

from .errores_pedidos import LineaStockError


@dataclass(frozen=True, slots=True)
class IncidenciaStockPostPago:
    detalle: str
    lineas: tuple[LineaStockError, ...]
