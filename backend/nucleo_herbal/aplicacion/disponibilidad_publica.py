"""Resolución de disponibilidad pública mínima desde inventario real."""

from __future__ import annotations

from ..dominio.inventario import InventarioProducto
from .dto import DisponibilidadPublicaDTO



def resolver_disponibilidad_publica(inventario: InventarioProducto | None) -> DisponibilidadPublicaDTO:
    if inventario is None or inventario.cantidad_disponible <= 0:
        return DisponibilidadPublicaDTO(disponible=False, estado_disponibilidad="no_disponible")
    if inventario.bajo_stock:
        return DisponibilidadPublicaDTO(disponible=True, estado_disponibilidad="bajo_stock")
    return DisponibilidadPublicaDTO(disponible=True, estado_disponibilidad="disponible")
