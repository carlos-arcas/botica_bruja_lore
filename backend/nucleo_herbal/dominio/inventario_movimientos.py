"""Entidades puras para ledger mínimo de movimientos de inventario."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from .excepciones import ErrorDominio
from .inventario import UNIDADES_BASE_INVENTARIO

TIPOS_MOVIMIENTO_INVENTARIO = (
    "alta_inicial",
    "ajuste_manual",
    "descuento_pago",
    "restitucion_manual",
)


@dataclass(frozen=True, slots=True)
class MovimientoInventario:
    id_producto: str
    tipo_movimiento: str
    cantidad: int
    unidad_base: str
    referencia: str = ""
    metadata: dict[str, str] | None = None
    operation_id: str = ""
    fecha_creacion: datetime | None = None

    def __post_init__(self) -> None:
        if not self.id_producto.strip():
            raise ErrorDominio("El movimiento de inventario requiere id de producto.")
        if self.tipo_movimiento not in TIPOS_MOVIMIENTO_INVENTARIO:
            raise ErrorDominio("El tipo de movimiento de inventario no es válido.")
        if not isinstance(self.cantidad, int):
            raise ErrorDominio("La cantidad del movimiento debe expresarse en enteros.")
        if self.cantidad == 0:
            raise ErrorDominio("La cantidad del movimiento no puede ser cero.")
        if self.unidad_base not in UNIDADES_BASE_INVENTARIO:
            raise ErrorDominio("La unidad base del movimiento no es válida.")
        if self.fecha_creacion is not None and self.fecha_creacion.tzinfo is None:
            raise ErrorDominio("La fecha del movimiento debe ser timezone-aware.")
        if self.fecha_creacion is None:
            object.__setattr__(self, "fecha_creacion", datetime.now(tz=UTC))
