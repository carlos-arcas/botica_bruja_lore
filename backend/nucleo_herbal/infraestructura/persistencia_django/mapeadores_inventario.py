"""Mapeadores ORM <-> dominio para inventario."""

from __future__ import annotations

from ...dominio.inventario import InventarioProducto
from .models_inventario import InventarioProductoModelo



def a_inventario(modelo: InventarioProductoModelo) -> InventarioProducto:
    return InventarioProducto(
        id_producto=modelo.producto_id,
        cantidad_disponible=modelo.cantidad_disponible,
        umbral_bajo_stock=modelo.umbral_bajo_stock,
        fecha_creacion=modelo.fecha_creacion,
        fecha_actualizacion=modelo.fecha_actualizacion,
    )



def a_datos_inventario(inventario: InventarioProducto) -> dict[str, object]:
    return {
        "cantidad_disponible": inventario.cantidad_disponible,
        "umbral_bajo_stock": inventario.umbral_bajo_stock,
    }
