"""DTOs de inventario operativo real v1."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class InventarioProductoDTO:
    id_producto: str
    cantidad_disponible: int
    umbral_bajo_stock: int | None
    bajo_stock: bool
    fecha_creacion: datetime | None
    fecha_actualizacion: datetime | None
