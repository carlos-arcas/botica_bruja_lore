"""Casos de uso de postventa local con pago simulado."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from .casos_de_uso import ErrorAplicacionLookup
from .casos_de_uso_pedidos import _a_dto
from .dto_pedidos import PedidoRealDTO
from .puertos.repositorios_inventario import RepositorioInventario
from .puertos.repositorios_movimientos_inventario import RepositorioMovimientosInventario
from .puertos.repositorios_pedidos import RepositorioPedidos
from .puertos.transacciones import PuertoTransacciones
from ..dominio.excepciones import ErrorDominio
from ..dominio.inventario_movimientos import MovimientoInventario

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ReembolsarPagoSimuladoManualPedido:
    repositorio_pedidos: RepositorioPedidos
    transacciones: PuertoTransacciones

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str) -> PedidoRealDTO:
        with self.transacciones.atomic():
            pedido = _obtener_pedido_para_actualizar(self.repositorio_pedidos, id_pedido)
            _log_evento(operation_id, actor, pedido, pedido, "reembolso_simulado_manual", "intento")
            if pedido.estado_reembolso == "ejecutado":
                _log_evento(operation_id, actor, pedido, pedido, "reembolso_simulado_manual", "idempotente")
                return _a_dto(pedido)
            try:
                actualizado = pedido.registrar_reembolso_simulado_manual(
                    fecha_reembolso=datetime.now(tz=UTC),
                    id_externo_reembolso=_id_reembolso_simulado(id_pedido, operation_id),
                )
            except ErrorDominio as error:
                _log_evento(operation_id, actor, pedido, pedido, "reembolso_simulado_manual", "rechazado", str(error))
                raise
            persistido = self.repositorio_pedidos.guardar(actualizado)
            _log_evento(operation_id, actor, pedido, persistido, "reembolso_simulado_manual", "ok")
            return _a_dto(persistido)


@dataclass(slots=True)
class RestituirInventarioManualPostventa:
    repositorio_pedidos: RepositorioPedidos
    repositorio_inventario: RepositorioInventario
    repositorio_movimientos: RepositorioMovimientosInventario
    transacciones: PuertoTransacciones

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str) -> PedidoRealDTO:
        with self.transacciones.atomic():
            pedido = _obtener_pedido_para_actualizar(self.repositorio_pedidos, id_pedido)
            _log_evento(operation_id, actor, pedido, pedido, "restitucion_postventa", "intento")
            if pedido.inventario_restituido:
                _log_evento(operation_id, actor, pedido, pedido, "restitucion_postventa", "idempotente")
                return _a_dto(pedido)
            try:
                pedido.validar_restitucion_manual_postventa()
            except ErrorDominio as error:
                _log_evento(operation_id, actor, pedido, pedido, "restitucion_postventa", "rechazado", str(error))
                raise
            self._restituir_lineas(pedido, operation_id)
            persistido = self.repositorio_pedidos.guardar(
                pedido.marcar_inventario_restituido_postventa(datetime.now(tz=UTC))
            )
            _log_evento(operation_id, actor, pedido, persistido, "restitucion_postventa", "ok")
            return _a_dto(persistido)

    def _restituir_lineas(self, pedido, operation_id: str) -> None:
        for indice, linea in enumerate(pedido.lineas):
            inventario = self.repositorio_inventario.obtener_por_id_producto(linea.id_producto)
            if inventario is None:
                raise ErrorDominio(f"No existe inventario para restituir el producto {linea.id_producto}.")
            if inventario.unidad_base != linea.unidad_comercial:
                raise ErrorDominio("La unidad comercial de la linea no coincide con la unidad base de inventario.")
            persistido = self.repositorio_inventario.guardar(
                inventario.ajustar(linea.cantidad_comercial, fecha_actualizacion=datetime.now(tz=UTC))
            )
            self.repositorio_movimientos.registrar(
                MovimientoInventario(
                    id_producto=linea.id_producto,
                    tipo_movimiento="restitucion_manual",
                    cantidad=linea.cantidad_comercial,
                    unidad_base=persistido.unidad_base,
                    referencia=pedido.id_pedido,
                    operation_id=f"{operation_id}:postventa:{indice}:{linea.id_producto}",
                )
            )


def _obtener_pedido_para_actualizar(repositorio: RepositorioPedidos, id_pedido: str):
    pedido = repositorio.obtener_por_id_para_actualizar(id_pedido)
    if pedido is None:
        raise ErrorAplicacionLookup(f"Pedido real no encontrado: {id_pedido}")
    return pedido


def _id_reembolso_simulado(id_pedido: str, operation_id: str) -> str:
    return f"SIM-REF-{id_pedido[:64]}-{operation_id[:48]}"


def _log_evento(operation_id: str, actor: str, anterior, actual, evento: str, resultado: str, error: str = "") -> None:
    logger.info(
        f"postventa_local_{evento}",
        extra={
            "operation_id": operation_id,
            "pedido_id": actual.id_pedido,
            "id_externo_pago": actual.id_externo_pago,
            "id_externo_reembolso": actual.id_externo_reembolso,
            "estado_anterior": anterior.estado,
            "estado_nuevo": actual.estado,
            "estado_reembolso": actual.estado_reembolso,
            "proveedor_pago": actual.proveedor_pago,
            "actor": actor,
            "evento": evento,
            "resultado": resultado,
            "error": error,
        },
    )
