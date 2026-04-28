"""Pasarela local simulada para ecommerce real sin PSP externo."""

from __future__ import annotations

import logging
import re
from decimal import Decimal

from ..aplicacion.dto_pago_pedidos import EventoPagoNormalizadoDTO
from ..aplicacion.puertos.pasarela_pago import PuertoPasarelaPago
from ..dominio.excepciones import ErrorDominio
from ..dominio.pedidos import Pedido

logger = logging.getLogger(__name__)

PROVEEDOR_PAGO_SIMULADO_LOCAL = "simulado_local"
ESTADO_INICIAL_PAGO_SIMULADO = "requiere_accion"


class PasarelaPagoSimuladaLocal(PuertoPasarelaPago):
    proveedor = PROVEEDOR_PAGO_SIMULADO_LOCAL

    def crear_intencion_pago(self, pedido: Pedido, operation_id: str) -> dict[str, object]:
        if pedido.id_externo_pago and pedido.url_pago:
            logger.info("pago_simulado_intencion_reutilizada", extra=_extra(operation_id, pedido, pedido.id_externo_pago, "ok"))
            return _respuesta_intencion(pedido.id_externo_pago, pedido.url_pago)
        id_externo = _id_externo_simulado(pedido.id_pedido, operation_id)
        url_pago = _url_pago_simulado(pedido.id_pedido, id_externo)
        logger.info("pago_simulado_intencion_creada", extra=_extra(operation_id, pedido, id_externo, "ok"))
        return _respuesta_intencion(id_externo, url_pago)

    def validar_webhook(self, payload: bytes, firma: str | None) -> EventoPagoNormalizadoDTO:
        raise ErrorDominio("La pasarela simulada local no procesa webhooks en esta fase.")

    def consultar_estado_externo(self, id_externo_pago: str) -> tuple[str, Decimal, str]:
        if not id_externo_pago.startswith("SIM-"):
            raise ErrorDominio("La referencia de pago simulado no es valida.")
        return "pendiente", Decimal("0.00"), "EUR"

    def ejecutar_reembolso_total(self, *, id_externo_pago: str, moneda: str, importe: Decimal, operation_id: str) -> dict[str, object]:
        raise ErrorDominio("La pasarela simulada local no ejecuta reembolsos en esta fase.")


def construir_pasarela_pago_simulada_local() -> PasarelaPagoSimuladaLocal:
    return PasarelaPagoSimuladaLocal()


def _id_externo_simulado(id_pedido: str, operation_id: str) -> str:
    pedido = _normalizar_segmento(id_pedido)
    operacion = _normalizar_segmento(operation_id) or "SIN-OPERATION"
    return f"SIM-{pedido}-{operacion}"


def _url_pago_simulado(id_pedido: str, id_externo_pago: str) -> str:
    return f"/pedido/{id_pedido}?pago=simulado&id_externo_pago={id_externo_pago}"


def _normalizar_segmento(valor: str) -> str:
    limpio = re.sub(r"[^A-Za-z0-9_-]+", "-", valor.strip())
    return limpio.strip("-").upper()


def _respuesta_intencion(id_externo_pago: str, url_pago: str | None) -> dict[str, object]:
    return {
        "proveedor_pago": PROVEEDOR_PAGO_SIMULADO_LOCAL,
        "id_externo_pago": id_externo_pago,
        "estado_pago": ESTADO_INICIAL_PAGO_SIMULADO,
        "url_pago": url_pago,
    }


def _extra(operation_id: str, pedido: Pedido, id_externo_pago: str, resultado: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": pedido.id_pedido,
        "proveedor_pago": PROVEEDOR_PAGO_SIMULADO_LOCAL,
        "id_externo_pago": id_externo_pago,
        "moneda": pedido.moneda,
        "importe": str(pedido.total),
        "estado_anterior": pedido.estado,
        "estado_nuevo": pedido.estado,
        "tipo_evento": "create_local_payment_intent",
        "resultado": resultado,
    }
