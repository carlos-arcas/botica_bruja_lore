"""Casos de uso de pago real v1 sobre el agregado Pedido."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from ..dominio.excepciones import ErrorDominio
from .casos_de_uso import ErrorAplicacionLookup
from .dto_pago_pedidos import EventoPagoNormalizadoDTO, IntencionPagoPedidoDTO
from .puertos.pasarela_pago import PuertoPasarelaPago
from .puertos.repositorios_pedidos import RepositorioPedidos

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class IniciarPagoPedido:
    repositorio_pedidos: RepositorioPedidos
    pasarela_pago: PuertoPasarelaPago

    def ejecutar(self, id_pedido: str, operation_id: str) -> IntencionPagoPedidoDTO:
        pedido = self._obtener_pedido(id_pedido)
        pedido.puede_iniciar_pago()
        respuesta = self.pasarela_pago.crear_intencion_pago(pedido, operation_id)
        pedido_actualizado = pedido.registrar_intencion_pago(
            proveedor=str(respuesta["proveedor_pago"]),
            id_externo_pago=str(respuesta["id_externo_pago"]),
            url_pago=_opcional(respuesta.get("url_pago")),
            estado_pago=str(respuesta["estado_pago"]),
        )
        persistido = self.repositorio_pedidos.guardar(pedido_actualizado)
        logger.info("pago_real_intencion_persistida", extra=_extra_pago(operation_id, persistido, "ok"))
        return IntencionPagoPedidoDTO(
            id_pedido=persistido.id_pedido,
            proveedor_pago=persistido.proveedor_pago or "",
            id_externo_pago=persistido.id_externo_pago or "",
            estado_pago=persistido.estado_pago,
            moneda=persistido.moneda,
            importe=persistido.subtotal,
            url_pago=persistido.url_pago,
        )

    def _obtener_pedido(self, id_pedido: str):
        pedido = self.repositorio_pedidos.obtener_por_id(id_pedido)
        if pedido is None:
            raise ErrorAplicacionLookup(f"Pedido real no encontrado: {id_pedido}")
        return pedido


@dataclass(slots=True)
class ProcesarWebhookPagoPedido:
    repositorio_pedidos: RepositorioPedidos
    pasarela_pago: PuertoPasarelaPago

    def ejecutar(self, payload: bytes, firma: str | None, operation_id: str) -> dict[str, object]:
        evento = self.pasarela_pago.validar_webhook(payload, firma)
        if not self.repositorio_pedidos.guardar_evento_webhook(evento.proveedor_pago, evento.id_evento, evento.payload_crudo):
            logger.info("pago_real_webhook_duplicado", extra=_extra_evento(operation_id, evento, "duplicado"))
            return {"resultado": "duplicado", "id_pedido": evento.id_pedido, "tipo_evento": evento.tipo_evento}
        pedido = self._resolver_pedido(evento)
        if pedido is None:
            logger.warning("pago_real_webhook_pedido_no_encontrado", extra=_extra_evento(operation_id, evento, "pedido_no_encontrado"))
            return {"resultado": "pedido_no_encontrado", "id_pedido": evento.id_pedido, "tipo_evento": evento.tipo_evento}
        return self._aplicar_evento(evento, pedido, operation_id)

    def _resolver_pedido(self, evento: EventoPagoNormalizadoDTO):
        pedido = self.repositorio_pedidos.obtener_por_pago_externo(evento.proveedor_pago, evento.id_externo_pago)
        if pedido is None:
            pedido = self.repositorio_pedidos.obtener_por_id(evento.id_pedido)
        return pedido

    def _aplicar_evento(self, evento: EventoPagoNormalizadoDTO, pedido, operation_id: str) -> dict[str, object]:
        if evento.estado_pago == "pagado":
            actualizado = pedido.marcar_pagado(datetime.now(tz=UTC))
            self.repositorio_pedidos.guardar(actualizado)
            logger.info("pago_real_transicion_pagado", extra=_extra_pago(operation_id, actualizado, "ok", evento.tipo_evento, pedido.estado))
            return {"resultado": "pagado", "id_pedido": actualizado.id_pedido, "tipo_evento": evento.tipo_evento}
        actualizado = pedido.registrar_fallo_pago()
        self.repositorio_pedidos.guardar(actualizado)
        logger.info("pago_real_evento_no_exitoso", extra=_extra_pago(operation_id, actualizado, "ok", evento.tipo_evento, pedido.estado))
        return {"resultado": "ignorado", "id_pedido": actualizado.id_pedido, "tipo_evento": evento.tipo_evento}


def _extra_pago(operation_id: str, pedido, resultado: str, tipo_evento: str | None = None, estado_anterior: str | None = None) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": pedido.id_pedido,
        "proveedor_pago": pedido.proveedor_pago,
        "id_externo_pago": pedido.id_externo_pago,
        "moneda": pedido.moneda,
        "importe": str(pedido.subtotal),
        "estado_anterior": estado_anterior or pedido.estado,
        "estado_nuevo": pedido.estado,
        "tipo_evento": tipo_evento,
        "resultado": resultado,
    }


def _extra_evento(operation_id: str, evento: EventoPagoNormalizadoDTO, resultado: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": evento.id_pedido,
        "proveedor_pago": evento.proveedor_pago,
        "id_externo_pago": evento.id_externo_pago,
        "moneda": evento.moneda,
        "importe": str(evento.importe),
        "estado_anterior": "pendiente_pago",
        "estado_nuevo": "pendiente_pago",
        "tipo_evento": evento.tipo_evento,
        "resultado": resultado,
    }


def _opcional(valor: object) -> str | None:
    if valor is None:
        return None
    texto = str(valor).strip()
    return texto or None
