"""Validacion preventiva de stock antes de avanzar a pago."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from ..dominio.pedidos import LineaPedido, Pedido
from .errores_pedidos import ErrorStockPedido, LineaStockError
from .puertos.repositorios_inventario import RepositorioInventario

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ValidarStockPreventivoPedido:
    repositorio_inventario: RepositorioInventario

    def validar(self, pedido: Pedido, operation_id: str) -> None:
        incidencias = tuple(
            incidencia
            for linea in pedido.lineas
            if (incidencia := self._validar_linea(linea)) is not None
        )
        if not incidencias:
            logger.info("pedido_stock_preventivo_validado", extra=_extra_stock(pedido, operation_id, "ok"))
            return
        logger.warning(
            "pedido_stock_preventivo_rechazado",
            extra={**_extra_stock(pedido, operation_id, "error"), "lineas": [linea.a_payload() for linea in incidencias]},
        )
        raise ErrorStockPedido(
            "No se puede continuar al pago porque una o mas lineas no tienen stock disponible.",
            lineas=incidencias,
        )

    def _validar_linea(self, linea: LineaPedido) -> LineaStockError | None:
        inventario = self.repositorio_inventario.obtener_por_id_producto(linea.id_producto)
        if inventario is None:
            return _linea_error(
                linea,
                codigo="inventario_no_registrado",
                detalle="El producto no tiene inventario operativo registrado.",
            )
        if linea.unidad_comercial != inventario.unidad_base:
            return _linea_error(
                linea,
                cantidad_disponible=inventario.cantidad_disponible,
                codigo="unidad_incompatible",
                detalle="La unidad comercial no coincide con la unidad base operativa del inventario.",
            )
        if inventario.puede_cubrir(linea.cantidad_comercial):
            return None
        return _linea_error(
            linea,
            cantidad_disponible=inventario.cantidad_disponible,
            codigo="stock_insuficiente",
            detalle="La cantidad solicitada supera el stock disponible en este momento.",
        )


def _linea_error(
    linea: LineaPedido,
    *,
    codigo: str,
    detalle: str,
    cantidad_disponible: int | None = None,
) -> LineaStockError:
    return LineaStockError(
        id_producto=linea.id_producto,
        slug_producto=linea.slug_producto,
        nombre_producto=linea.nombre_producto,
        cantidad_solicitada=linea.cantidad_comercial,
        cantidad_disponible=cantidad_disponible,
        codigo=codigo,
        detalle=detalle,
    )


def _extra_stock(pedido: Pedido, operation_id: str, resultado: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "id_pedido": pedido.id_pedido,
        "numero_lineas": len(pedido.lineas),
        "resultado": resultado,
    }
