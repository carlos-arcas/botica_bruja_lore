"""Casos de uso mínimos para base de inventario real v1."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from ..dominio.excepciones import ErrorDominio
from ..dominio.inventario import InventarioProducto
from .casos_de_uso import ErrorAplicacionLookup
from .dto_inventario import InventarioProductoDTO
from .puertos.repositorios import RepositorioProductos
from .puertos.repositorios_inventario import RepositorioInventario

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ObtenerInventarioProducto:
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, id_producto: str) -> InventarioProductoDTO:
        inventario = self.repositorio_inventario.obtener_por_id_producto(id_producto)
        if inventario is None:
            raise ErrorAplicacionLookup(f"Inventario no encontrado para producto: {id_producto}")
        return _a_dto(inventario)


@dataclass(slots=True)
class CrearInventarioInicialProducto:
    repositorio_inventario: RepositorioInventario
    repositorio_productos: RepositorioProductos

    def ejecutar(
        self,
        *,
        id_producto: str,
        cantidad_inicial: int,
        umbral_bajo_stock: int | None,
        operation_id: str,
        unidad_base: str = "ud",
    ) -> InventarioProductoDTO:
        if self.repositorio_productos.obtener_por_id(id_producto) is None:
            raise ErrorAplicacionLookup(f"Producto no encontrado para inventario: {id_producto}")
        inventario = InventarioProducto(
            id_producto=id_producto,
            cantidad_disponible=cantidad_inicial,
            unidad_base=unidad_base,
            umbral_bajo_stock=umbral_bajo_stock,
            fecha_creacion=datetime.now(tz=UTC),
            fecha_actualizacion=datetime.now(tz=UTC),
        )
        try:
            creado = self.repositorio_inventario.crear_inicial(inventario)
        except ErrorDominio:
            logger.warning("inventario_inicial_duplicado", extra=_extra_log(operation_id, id_producto, "crear_inicial", "error", cantidad_inicial, umbral_bajo_stock))
            raise
        logger.info("inventario_inicial_creado", extra=_extra_log(operation_id, id_producto, "crear_inicial", "ok", creado.cantidad_disponible, creado.umbral_bajo_stock))
        return _a_dto(creado)


@dataclass(slots=True)
class AjustarInventarioProducto:
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, *, id_producto: str, delta: int, operation_id: str) -> InventarioProductoDTO:
        inventario = self.repositorio_inventario.obtener_por_id_producto(id_producto)
        if inventario is None:
            raise ErrorAplicacionLookup(f"Inventario no encontrado para producto: {id_producto}")
        try:
            actualizado = inventario.ajustar(delta, fecha_actualizacion=datetime.now(tz=UTC))
        except ErrorDominio:
            logger.warning("inventario_ajuste_rechazado", extra=_extra_log(operation_id, id_producto, "ajuste", "error", delta, inventario.umbral_bajo_stock))
            raise
        persistido = self.repositorio_inventario.guardar(actualizado)
        logger.info("inventario_ajustado", extra=_extra_log(operation_id, id_producto, "ajuste", "ok", delta, persistido.umbral_bajo_stock, persistido.cantidad_disponible))
        return _a_dto(persistido)


@dataclass(slots=True)
class ListarInventarioOperativo:
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, *, solo_bajo_stock: bool = False) -> tuple[InventarioProductoDTO, ...]:
        inventarios = self.repositorio_inventario.listar_operativo(solo_bajo_stock=solo_bajo_stock)
        return tuple(_a_dto(inventario) for inventario in inventarios)



def _a_dto(inventario: InventarioProducto) -> InventarioProductoDTO:
    return InventarioProductoDTO(
        id_producto=inventario.id_producto,
        cantidad_disponible=inventario.cantidad_disponible,
        unidad_base=inventario.unidad_base,
        umbral_bajo_stock=inventario.umbral_bajo_stock,
        bajo_stock=inventario.bajo_stock,
        fecha_creacion=inventario.fecha_creacion,
        fecha_actualizacion=inventario.fecha_actualizacion,
    )


def _extra_log(
    operation_id: str,
    id_producto: str,
    evento: str,
    resultado: str,
    cantidad: int,
    umbral: int | None,
    cantidad_actual: int | None = None,
) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "producto_id": id_producto,
        "evento": evento,
        "resultado": resultado,
        "cantidad": cantidad,
        "umbral_bajo_stock": umbral,
        "cantidad_actual": cantidad_actual,
    }
