"""Mapeadores ORM <-> dominio para inventario."""

from __future__ import annotations

from ...dominio.inventario import InventarioProducto
from ...dominio.inventario_movimientos import MovimientoInventario
from .models_inventario import InventarioProductoModelo, MovimientoInventarioModelo



def a_inventario(modelo: InventarioProductoModelo) -> InventarioProducto:
    return InventarioProducto(
        id_producto=modelo.producto_id,
        cantidad_disponible=modelo.cantidad_disponible,
        unidad_base=modelo.unidad_base,
        umbral_bajo_stock=modelo.umbral_bajo_stock,
        fecha_creacion=modelo.fecha_creacion,
        fecha_actualizacion=modelo.fecha_actualizacion,
    )



def a_datos_inventario(inventario: InventarioProducto) -> dict[str, object]:
    return {
        "cantidad_disponible": inventario.cantidad_disponible,
        "unidad_base": inventario.unidad_base,
        "umbral_bajo_stock": inventario.umbral_bajo_stock,
    }


def a_datos_movimiento(movimiento: MovimientoInventario) -> dict[str, object]:
    return {
        "tipo_movimiento": movimiento.tipo_movimiento,
        "cantidad": movimiento.cantidad,
        "unidad_base": movimiento.unidad_base,
        "referencia": movimiento.referencia,
        "metadata": movimiento.metadata or {},
        "operation_id": movimiento.operation_id,
    }


def a_movimiento(modelo: MovimientoInventarioModelo) -> MovimientoInventario:
    return MovimientoInventario(
        id_producto=modelo.inventario.producto_id,
        tipo_movimiento=modelo.tipo_movimiento,
        cantidad=modelo.cantidad,
        unidad_base=modelo.unidad_base,
        referencia=modelo.referencia,
        metadata=modelo.metadata,
        operation_id=modelo.operation_id,
        fecha_creacion=modelo.fecha_creacion,
    )
