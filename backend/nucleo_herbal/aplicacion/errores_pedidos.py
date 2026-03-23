"""Errores de aplicación específicos del checkout real."""

from __future__ import annotations

from dataclasses import dataclass

from ..dominio.excepciones import ErrorDominio


@dataclass(frozen=True, slots=True)
class LineaStockError:
    id_producto: str
    slug_producto: str
    nombre_producto: str
    cantidad_solicitada: int
    codigo: str
    detalle: str
    cantidad_disponible: int | None = None

    def a_payload(self) -> dict[str, object]:
        payload: dict[str, object] = {
            "id_producto": self.id_producto,
            "slug_producto": self.slug_producto,
            "nombre_producto": self.nombre_producto,
            "cantidad_solicitada": self.cantidad_solicitada,
            "codigo": self.codigo,
            "detalle": self.detalle,
        }
        if self.cantidad_disponible is not None:
            payload["cantidad_disponible"] = self.cantidad_disponible
        return payload


class ErrorStockPedido(ErrorDominio):
    """Error utilizable por presentación cuando el stock impide crear el pedido."""

    def __init__(self, detalle: str, *, lineas: tuple[LineaStockError, ...], codigo: str = "stock_no_disponible") -> None:
        super().__init__(detalle)
        self.detalle = detalle
        self.lineas = lineas
        self.codigo = codigo
