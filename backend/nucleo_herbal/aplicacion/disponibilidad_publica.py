"""Resolución de disponibilidad pública mínima desde inventario real."""

from __future__ import annotations

from ..dominio.inventario import InventarioProducto
from .dto import DisponibilidadPublicaDTO



def resolver_disponibilidad_publica(inventario: InventarioProducto | None) -> DisponibilidadPublicaDTO:
    if inventario is None or inventario.cantidad_disponible <= 0:
        return DisponibilidadPublicaDTO(
            disponible=False,
            estado_disponibilidad="no_disponible",
            cantidad_disponible=0 if inventario else None,
            mensaje_disponibilidad="Sin stock disponible en este momento.",
        )
    if inventario.bajo_stock:
        return DisponibilidadPublicaDTO(
            disponible=True,
            estado_disponibilidad="bajo_stock",
            cantidad_disponible=inventario.cantidad_disponible,
            mensaje_disponibilidad="Pocas unidades disponibles.",
        )
    return DisponibilidadPublicaDTO(
        disponible=True,
        estado_disponibilidad="disponible",
        cantidad_disponible=inventario.cantidad_disponible,
        mensaje_disponibilidad="Disponible para compra.",
    )
