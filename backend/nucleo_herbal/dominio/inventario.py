"""Entidades puras para inventario operativo de productos vendibles."""

from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime

from .excepciones import ErrorDominio


@dataclass(frozen=True, slots=True)
class InventarioProducto:
    id_producto: str
    cantidad_disponible: int
    umbral_bajo_stock: int | None = None
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None

    def __post_init__(self) -> None:
        if not self.id_producto.strip():
            raise ErrorDominio("El inventario requiere id de producto.")
        if self.cantidad_disponible < 0:
            raise ErrorDominio("El inventario no permite stock negativo.")
        if self.umbral_bajo_stock is not None and self.umbral_bajo_stock < 0:
            raise ErrorDominio("El umbral de bajo stock no puede ser negativo.")

    @property
    def bajo_stock(self) -> bool:
        return self.umbral_bajo_stock is not None and self.cantidad_disponible <= self.umbral_bajo_stock

    def puede_cubrir(self, cantidad_requerida: int) -> bool:
        if cantidad_requerida <= 0:
            raise ErrorDominio("La validación de stock requiere una cantidad positiva.")
        return self.cantidad_disponible >= cantidad_requerida

    def ajustar(self, delta: int, *, fecha_actualizacion: datetime | None = None) -> "InventarioProducto":
        nueva_cantidad = self.cantidad_disponible + delta
        if nueva_cantidad < 0:
            raise ErrorDominio("El ajuste de inventario no puede dejar stock negativo.")
        return replace(self, cantidad_disponible=nueva_cantidad, fecha_actualizacion=fecha_actualizacion)
