"""Entidades puras para inventario operativo de productos vendibles."""

from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime

from .excepciones import ErrorDominio

UNIDADES_BASE_INVENTARIO: tuple[str, ...] = ("ud", "g", "ml")


@dataclass(frozen=True, slots=True)
class InventarioProducto:
    id_producto: str
    cantidad_disponible: int
    unidad_base: str = "ud"
    umbral_bajo_stock: int | None = None
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None

    def __post_init__(self) -> None:
        if not self.id_producto.strip():
            raise ErrorDominio("El inventario requiere id de producto.")
        if not _es_entero(self.cantidad_disponible):
            raise ErrorDominio("El inventario solo permite cantidades enteras en unidad base.")
        if self.cantidad_disponible < 0:
            raise ErrorDominio("El inventario no permite stock negativo.")
        if self.unidad_base not in UNIDADES_BASE_INVENTARIO:
            raise ErrorDominio("La unidad base de inventario no es válida.")
        if self.umbral_bajo_stock is not None and not _es_entero(self.umbral_bajo_stock):
            raise ErrorDominio("El umbral de bajo stock debe expresarse en enteros.")
        if self.umbral_bajo_stock is not None and self.umbral_bajo_stock < 0:
            raise ErrorDominio("El umbral de bajo stock no puede ser negativo.")

    @property
    def bajo_stock(self) -> bool:
        return self.umbral_bajo_stock is not None and self.cantidad_disponible <= self.umbral_bajo_stock

    def puede_cubrir(self, cantidad_requerida: int) -> bool:
        if not _es_entero(cantidad_requerida):
            raise ErrorDominio("La validación de stock requiere una cantidad entera positiva.")
        if cantidad_requerida <= 0:
            raise ErrorDominio("La validación de stock requiere una cantidad positiva.")
        return self.cantidad_disponible >= cantidad_requerida

    def ajustar(self, delta: int, *, fecha_actualizacion: datetime | None = None) -> "InventarioProducto":
        if not _es_entero(delta):
            raise ErrorDominio("El ajuste de inventario debe expresarse en enteros.")
        nueva_cantidad = self.cantidad_disponible + delta
        if nueva_cantidad < 0:
            raise ErrorDominio("El ajuste de inventario no puede dejar stock negativo.")
        return replace(self, cantidad_disponible=nueva_cantidad, fecha_actualizacion=fecha_actualizacion)


def _es_entero(valor: object) -> bool:
    return isinstance(valor, int) and not isinstance(valor, bool)
