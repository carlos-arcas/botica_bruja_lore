"""Casos de uso mínimos para operación administrativa de pedidos reales."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from .casos_de_uso import ErrorAplicacionLookup
from .casos_de_uso_pedidos import _a_dto
from .dto_pedidos import PedidoRealDTO
from ..dominio.excepciones import ErrorDominio
from .puertos.notificador_pedidos import NotificadorPostPagoPedido
from .puertos.pasarela_pago import PuertoPasarelaPago
from .puertos.repositorios_inventario import RepositorioInventario
from .puertos.repositorios_movimientos_inventario import RepositorioMovimientosInventario
from .puertos.repositorios_pedidos import RepositorioPedidos
from .puertos.transacciones import PuertoTransacciones
from ..dominio.inventario_movimientos import MovimientoInventario

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class DatosEnvioBackoffice:
    transportista: str
    codigo_seguimiento: str = ""
    envio_sin_seguimiento: bool = False
    observaciones_operativas: str = ""


@dataclass(slots=True)
class ListarPedidosBackoffice:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, *, estado: str | None = None, solo_pagados: bool = False) -> tuple[PedidoRealDTO, ...]:
        estados = () if not estado else (estado,)
        pedidos = self.repositorio_pedidos.listar(estados=estados, solo_pagados=solo_pagados)
        return tuple(_a_dto(pedido) for pedido in pedidos)


@dataclass(slots=True)
class MarcarPedidoPreparando:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str) -> PedidoRealDTO:
        pedido = _obtener_pedido(self.repositorio_pedidos, id_pedido)
        actualizado = self.repositorio_pedidos.guardar(pedido.marcar_preparando(datetime.now(tz=UTC)))
        _log_transition(operation_id, actor, pedido, actualizado, "marcar_preparando", "ok")
        return _a_dto(actualizado)


@dataclass(slots=True)
class MarcarPedidoEnviado:
    repositorio_pedidos: RepositorioPedidos
    notificador: NotificadorPostPagoPedido

    def ejecutar(self, id_pedido: str, datos_envio: DatosEnvioBackoffice, operation_id: str, actor: str) -> PedidoRealDTO:
        pedido = _obtener_pedido(self.repositorio_pedidos, id_pedido)
        actualizado = pedido.marcar_enviado(
            fecha_envio=datetime.now(tz=UTC),
            transportista=datos_envio.transportista,
            codigo_seguimiento=datos_envio.codigo_seguimiento,
            envio_sin_seguimiento=datos_envio.envio_sin_seguimiento,
            observaciones_operativas=datos_envio.observaciones_operativas,
        )
        persistido = self.repositorio_pedidos.guardar(actualizado)
        _log_transition(operation_id, actor, pedido, persistido, "marcar_enviado", "ok")
        return _a_dto(self._enviar_email_si_aplica(persistido, operation_id, actor))

    def _enviar_email_si_aplica(self, pedido, operation_id: str, actor: str):
        if pedido.email_envio_enviado:
            _log_transition(operation_id, actor, pedido, pedido, "email_envio", "ya_enviado")
            return pedido
        try:
            self.notificador.enviar_confirmacion_envio(pedido, operation_id)
        except Exception as error:  # noqa: BLE001
            logger.error("backoffice_pedido_email_envio_error", extra=_extra_log(operation_id, actor, pedido, pedido, "email_envio", "error", str(error)))
            return pedido
        actualizado = self.repositorio_pedidos.guardar(pedido.marcar_email_envio_enviado(datetime.now(tz=UTC)))
        _log_transition(operation_id, actor, pedido, actualizado, "email_envio", "ok")
        return actualizado


@dataclass(slots=True)
class MarcarIncidenciaStockRevisada:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str, observaciones_operativas: str = "") -> PedidoRealDTO:
        pedido = _obtener_pedido(self.repositorio_pedidos, id_pedido)
        actualizado = self.repositorio_pedidos.guardar(
            pedido.marcar_incidencia_stock_revisada(
                datetime.now(tz=UTC),
                observaciones_operativas=observaciones_operativas,
            )
        )
        _log_transition(operation_id, actor, pedido, actualizado, "marcar_incidencia_stock_revisada", "ok")
        return _a_dto(actualizado)


@dataclass(slots=True)
class MarcarPedidoEntregado:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str, observaciones_operativas: str = "") -> PedidoRealDTO:
        pedido = _obtener_pedido(self.repositorio_pedidos, id_pedido)
        actualizado = self.repositorio_pedidos.guardar(
            pedido.marcar_entregado(datetime.now(tz=UTC), observaciones_operativas=observaciones_operativas)
        )
        _log_transition(operation_id, actor, pedido, actualizado, "marcar_entregado", "ok")
        return _a_dto(actualizado)


@dataclass(slots=True)
class CancelarPedidoOperativoPorIncidenciaStock:
    repositorio_pedidos: RepositorioPedidos
    notificador: NotificadorPostPagoPedido

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str, motivo_cancelacion: str) -> PedidoRealDTO:
        pedido = _obtener_pedido(self.repositorio_pedidos, id_pedido)
        try:
            actualizado = pedido.cancelar_operativamente_por_incidencia_stock(
                fecha_cancelacion=datetime.now(tz=UTC),
                motivo_cancelacion=motivo_cancelacion,
            )
        except ErrorDominio as error:
            _log_transition(operation_id, actor, pedido, pedido, "cancelacion_operativa_incidencia_stock", "rechazado")
            logger.warning(
                "backoffice_pedido_cancelacion_operativa_rechazada",
                extra=_extra_log(
                    operation_id,
                    actor,
                    pedido,
                    pedido,
                    "cancelacion_operativa_incidencia_stock",
                    "rechazado",
                    str(error),
                ),
            )
            raise
        persistido = self.repositorio_pedidos.guardar(actualizado)
        _log_transition(operation_id, actor, pedido, persistido, "cancelacion_operativa_incidencia_stock", "ok")
        return _a_dto(self._enviar_email_si_aplica(persistido, operation_id, actor))

    def _enviar_email_si_aplica(self, pedido, operation_id: str, actor: str):
        if pedido.email_cancelacion_enviado:
            _log_transition(operation_id, actor, pedido, pedido, "email_cancelacion", "ya_enviado")
            return pedido
        try:
            self.notificador.enviar_cancelacion_operativa_stock(pedido, operation_id)
        except Exception as error:  # noqa: BLE001
            logger.error("backoffice_pedido_email_cancelacion_error", extra=_extra_log(operation_id, actor, pedido, pedido, "email_cancelacion", "error", str(error)))
            return pedido
        actualizado = self.repositorio_pedidos.guardar(pedido.marcar_email_cancelacion_enviado(datetime.now(tz=UTC)))
        _log_transition(operation_id, actor, pedido, actualizado, "email_cancelacion", "ok")
        return actualizado


@dataclass(slots=True)
class ReembolsarPedidoCanceladoPorIncidenciaStock:
    repositorio_pedidos: RepositorioPedidos
    pasarela_pago: PuertoPasarelaPago
    transacciones: PuertoTransacciones
    notificador: NotificadorPostPagoPedido

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str) -> PedidoRealDTO:
        with self.transacciones.atomic():
            pedido = _obtener_pedido_para_actualizar(self.repositorio_pedidos, id_pedido)
            logger.info("backoffice_pedido_reembolso_manual_intento", extra=_extra_log(operation_id, actor, pedido, pedido, "reembolso_manual", "intento"))
            if pedido.estado_reembolso == "ejecutado":
                logger.info("backoffice_pedido_reembolso_manual_reintento_idempotente", extra=_extra_log(operation_id, actor, pedido, pedido, "reembolso_manual", "idempotente"))
                return _a_dto(self._enviar_email_si_aplica(pedido, operation_id, actor))
            try:
                pedido.validar_reembolso_manual()
            except ErrorDominio as error:
                logger.warning(
                    "backoffice_pedido_reembolso_manual_invalido",
                    extra=_extra_log(operation_id, actor, pedido, pedido, "reembolso_manual", "rechazado", str(error)),
                )
                raise
            respuesta = self.pasarela_pago.ejecutar_reembolso_total(
                id_externo_pago=pedido.id_externo_pago or "",
                moneda=pedido.moneda,
                importe=pedido.total,
                operation_id=operation_id,
            )
            if respuesta["resultado"] == "ejecutado":
                actualizado = pedido.registrar_reembolso_exitoso(
                    fecha_reembolso=datetime.now(tz=UTC),
                    id_externo_reembolso=str(respuesta["id_externo_reembolso"]),
                )
                persistido = self.repositorio_pedidos.guardar(actualizado)
                logger.info("backoffice_pedido_reembolso_manual_ok", extra=_extra_log(operation_id, actor, pedido, persistido, "reembolso_manual", "ok"))
                return _a_dto(self._enviar_email_si_aplica(persistido, operation_id, actor))
            actualizado = pedido.registrar_fallo_reembolso(motivo_fallo=str(respuesta.get("detalle", "")))
            persistido = self.repositorio_pedidos.guardar(actualizado)
            logger.error(
                "backoffice_pedido_reembolso_manual_fallido",
                extra=_extra_log(
                    operation_id,
                    actor,
                    pedido,
                    persistido,
                    "reembolso_manual",
                    "fallido",
                    str(respuesta.get("detalle", "")),
                ),
            )
            return _a_dto(persistido)

    def _enviar_email_si_aplica(self, pedido, operation_id: str, actor: str):
        if pedido.email_reembolso_enviado:
            _log_transition(operation_id, actor, pedido, pedido, "email_reembolso", "ya_enviado")
            return pedido
        try:
            self.notificador.enviar_reembolso_manual_ejecutado(pedido, operation_id)
        except Exception as error:  # noqa: BLE001
            logger.error("backoffice_pedido_email_reembolso_error", extra=_extra_log(operation_id, actor, pedido, pedido, "email_reembolso", "error", str(error)))
            return pedido
        actualizado = self.repositorio_pedidos.guardar(pedido.marcar_email_reembolso_enviado(datetime.now(tz=UTC)))
        _log_transition(operation_id, actor, pedido, actualizado, "email_reembolso", "ok")
        return actualizado


@dataclass(slots=True)
class RestituirInventarioManualPedidoCancelado:
    repositorio_pedidos: RepositorioPedidos
    repositorio_inventario: RepositorioInventario
    repositorio_movimientos: RepositorioMovimientosInventario
    transacciones: PuertoTransacciones

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str) -> PedidoRealDTO:
        with self.transacciones.atomic():
            pedido = _obtener_pedido_para_actualizar(self.repositorio_pedidos, id_pedido)
            logger.info("backoffice_pedido_restitucion_manual_intento", extra=_extra_log(operation_id, actor, pedido, pedido, "restitucion_manual", "intento"))
            if pedido.inventario_restituido:
                logger.info("backoffice_pedido_restitucion_manual_reintento_idempotente", extra=_extra_log(operation_id, actor, pedido, pedido, "restitucion_manual", "idempotente"))
                return _a_dto(pedido)
            try:
                pedido.validar_restitucion_manual_inventario()
            except ErrorDominio as error:
                logger.warning(
                    "backoffice_pedido_restitucion_manual_rechazada",
                    extra=_extra_log(operation_id, actor, pedido, pedido, "restitucion_manual", "rechazado", str(error)),
                )
                raise
            self._restituir_lineas(pedido, operation_id)
            actualizado = pedido.marcar_inventario_restituido(fecha_restitucion=datetime.now(tz=UTC))
            persistido = self.repositorio_pedidos.guardar(actualizado)
            logger.info("backoffice_pedido_restitucion_manual_ok", extra=_extra_log(operation_id, actor, pedido, persistido, "restitucion_manual", "ok"))
            return _a_dto(persistido)

    def _restituir_lineas(self, pedido, operation_id: str) -> None:
        for indice, linea in enumerate(pedido.lineas):
            inventario = self.repositorio_inventario.obtener_por_id_producto(linea.id_producto)
            if inventario is None:
                raise ErrorDominio(f"No existe inventario para restituir el producto {linea.id_producto}.")
            if inventario.unidad_base != linea.unidad_comercial:
                raise ErrorDominio("La unidad comercial de la línea no coincide con la unidad base de inventario.")
            actualizado = inventario.ajustar(linea.cantidad_comercial, fecha_actualizacion=datetime.now(tz=UTC))
            persistido = self.repositorio_inventario.guardar(actualizado)
            self.repositorio_movimientos.registrar(
                MovimientoInventario(
                    id_producto=linea.id_producto,
                    tipo_movimiento="restitucion_manual",
                    cantidad=linea.cantidad_comercial,
                    unidad_base=persistido.unidad_base,
                    referencia=pedido.id_pedido,
                    operation_id=f"{operation_id}:restitucion_manual:{indice}:{linea.id_producto}",
                )
            )


def _obtener_pedido(repositorio: RepositorioPedidos, id_pedido: str):
    pedido = repositorio.obtener_por_id(id_pedido)
    if pedido is None:
        raise ErrorAplicacionLookup(f"Pedido real no encontrado: {id_pedido}")
    return pedido


def _obtener_pedido_para_actualizar(repositorio: RepositorioPedidos, id_pedido: str):
    pedido = repositorio.obtener_por_id_para_actualizar(id_pedido)
    if pedido is None:
        raise ErrorAplicacionLookup(f"Pedido real no encontrado: {id_pedido}")
    return pedido


def _log_transition(operation_id: str, actor: str, anterior, actual, evento: str, resultado: str) -> None:
    logger.info(f"backoffice_pedido_{evento}", extra=_extra_log(operation_id, actor, anterior, actual, evento, resultado))


def _extra_log(operation_id: str, actor: str, anterior, actual, evento: str, resultado: str, error: str = "") -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": actual.id_pedido,
        "id_externo_pago": actual.id_externo_pago,
        "email_contacto": actual.cliente.email,
        "estado_anterior": anterior.estado,
        "estado_nuevo": actual.estado,
        "transportista": actual.transportista,
        "codigo_seguimiento": actual.codigo_seguimiento,
        "actor": actor,
        "evento": evento,
        "resultado": resultado,
        "error": error,
    }
