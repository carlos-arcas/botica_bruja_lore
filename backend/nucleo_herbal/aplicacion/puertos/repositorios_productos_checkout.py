"""Puerto mínimo para validar semántica comercial de productos en checkout real."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class SemanticaComercialProducto:
    id_producto: str
    unidad_comercial: str
    incremento_minimo_venta: int
    cantidad_minima_compra: int


class RepositorioProductosCheckout(ABC):
    @abstractmethod
    def obtener_semantica_comercial_por_id(self, id_producto: str) -> SemanticaComercialProducto | None:
        """Recupera la semántica comercial mínima para validar líneas de pedido real."""
