"""Casos de uso mínimos para operación administrativa de pedidos reales."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from .casos_de_uso import ErrorAplicacionLookup
from .casos_de_uso_pedidos import _a_dto
from .dto_pedidos import PedidoRealDTO
from .puertos.notificador_pedidos import NotificadorPostPagoPedido
from .puertos.repositorios_pedidos import RepositorioPedidos

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
class MarcarPedidoEntregado:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, id_pedido: str, operation_id: str, actor: str, observaciones_operativas: str = "") -> PedidoRealDTO:
        pedido = _obtener_pedido(self.repositorio_pedidos, id_pedido)
        actualizado = self.repositorio_pedidos.guardar(
            pedido.marcar_entregado(datetime.now(tz=UTC), observaciones_operativas=observaciones_operativas)
        )
        _log_transition(operation_id, actor, pedido, actualizado, "marcar_entregado", "ok")
        return _a_dto(actualizado)


def _obtener_pedido(repositorio: RepositorioPedidos, id_pedido: str):
    pedido = repositorio.obtener_por_id(id_pedido)
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
