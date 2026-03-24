"""Adaptador Stripe v1 desacoplado a través del puerto de pasarela."""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
from dataclasses import dataclass
from decimal import Decimal
from urllib import parse, request

from django.conf import settings

from ..aplicacion.dto_pago_pedidos import EventoPagoNormalizadoDTO
from ..aplicacion.puertos.pasarela_pago import PuertoPasarelaPago
from ..dominio.excepciones import ErrorDominio
from ..dominio.pedidos import Pedido

logger = logging.getLogger(__name__)

API_BASE = "https://api.stripe.com/v1"


@dataclass(frozen=True, slots=True)
class ConfiguracionStripe:
    api_key_secreta: str
    webhook_secret: str
    public_key: str
    success_url: str
    cancel_url: str


class PasarelaPagoStripe(PuertoPasarelaPago):
    proveedor = "stripe"

    def __init__(self, configuracion: ConfiguracionStripe) -> None:
        self.configuracion = configuracion

    def crear_intencion_pago(self, pedido: Pedido, operation_id: str) -> dict[str, object]:
        if pedido.id_externo_pago and pedido.url_pago:
            logger.info("pago_real_intencion_reutilizada", extra=_extra(operation_id, pedido, pedido.id_externo_pago, "ok"))
            return _respuesta_intencion(pedido.id_externo_pago, pedido.url_pago)
        payload = _payload_checkout_session(pedido, self.configuracion)
        respuesta = self._post("/checkout/sessions", payload)
        id_externo = str(respuesta.get("id", "")).strip()
        url_pago = str(respuesta.get("url", "")).strip() or None
        if not id_externo:
            raise ErrorDominio("Stripe no devolvió una referencia externa de pago válida.")
        logger.info("pago_real_intencion_creada", extra=_extra(operation_id, pedido, id_externo, "ok"))
        return _respuesta_intencion(id_externo, url_pago)

    def validar_webhook(self, payload: bytes, firma: str | None) -> EventoPagoNormalizadoDTO:
        _validar_firma_stripe(payload, firma, self.configuracion.webhook_secret)
        evento = json.loads(payload.decode("utf-8"))
        return _normalizar_evento(evento)

    def consultar_estado_externo(self, id_externo_pago: str) -> tuple[str, Decimal, str]:
        respuesta = self._get(f"/checkout/sessions/{parse.quote(id_externo_pago)}")
        estado = "pagado" if respuesta.get("payment_status") == "paid" else "pendiente"
        importe = Decimal(str((respuesta.get("amount_total") or 0) / 100))
        moneda = str(respuesta.get("currency", "eur")).upper()
        return estado, importe, moneda

    def ejecutar_reembolso_total(self, *, id_externo_pago: str, moneda: str, importe: Decimal, operation_id: str) -> dict[str, object]:
        sesion = self._get(f"/checkout/sessions/{parse.quote(id_externo_pago)}")
        payment_intent = str(sesion.get("payment_intent", "")).strip()
        if not payment_intent:
            raise ErrorDominio("Stripe no devolvió payment_intent para ejecutar el reembolso manual.")
        payload = {
            "payment_intent": payment_intent,
            "metadata[operation]": "reembolso_manual_incidencia_stock",
            "metadata[id_externo_pago]": id_externo_pago,
        }
        respuesta = self._post("/refunds", payload)
        estado = str(respuesta.get("status", "")).strip()
        id_externo_reembolso = str(respuesta.get("id", "")).strip()
        if not id_externo_reembolso:
            raise ErrorDominio("Stripe no devolvió referencia externa de reembolso.")
        if estado in {"succeeded", "pending"}:
            logger.info(
                "pago_real_reembolso_manual_ok",
                extra=_extra_reembolso(operation_id, id_externo_pago, id_externo_reembolso, moneda, importe, "ok"),
            )
            return {"resultado": "ejecutado", "id_externo_reembolso": id_externo_reembolso, "detalle": ""}
        detalle = str(respuesta.get("failure_reason", "")).strip() or f"Estado de reembolso no exitoso: {estado or 'desconocido'}."
        logger.warning(
            "pago_real_reembolso_manual_rechazado",
            extra=_extra_reembolso(operation_id, id_externo_pago, id_externo_reembolso, moneda, importe, "rechazado", detalle),
        )
        return {"resultado": "fallido", "id_externo_reembolso": id_externo_reembolso, "detalle": detalle}

    def _post(self, path: str, payload: dict[str, str]) -> dict[str, object]:
        data = parse.urlencode(payload).encode("utf-8")
        return self._request_json(path, data)

    def _get(self, path: str) -> dict[str, object]:
        return self._request_json(path, None)

    def _request_json(self, path: str, data: bytes | None) -> dict[str, object]:
        req = request.Request(
            f"{API_BASE}{path}",
            data=data,
            headers={"Authorization": f"Bearer {self.configuracion.api_key_secreta}"},
            method="POST" if data is not None else "GET",
        )
        try:
            with request.urlopen(req, timeout=15) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:  # noqa: BLE001
            raise ErrorDominio("No se pudo completar la operación contra Stripe.") from error


def construir_pasarela_pago_stripe() -> PasarelaPagoStripe:
    return PasarelaPagoStripe(
        ConfiguracionStripe(
            api_key_secreta=_obligatoria("STRIPE_SECRET_KEY"),
            webhook_secret=_obligatoria("STRIPE_WEBHOOK_SECRET"),
            public_key=getattr(settings, "STRIPE_PUBLIC_KEY", "").strip(),
            success_url=_obligatoria("PAYMENT_SUCCESS_URL"),
            cancel_url=_obligatoria("PAYMENT_CANCEL_URL"),
        )
    )


def _payload_checkout_session(pedido: Pedido, config: ConfiguracionStripe) -> dict[str, str]:
    payload = {
        "mode": "payment",
        "success_url": _resolver_url_retorno(config.success_url, pedido.id_pedido),
        "cancel_url": _resolver_url_retorno(config.cancel_url, pedido.id_pedido),
        "client_reference_id": pedido.id_pedido,
        "metadata[id_pedido]": pedido.id_pedido,
        "metadata[operation]": "checkout_real_v1",
    }
    for indice, linea in enumerate(pedido.lineas):
        base = f"line_items[{indice}]"
        payload[f"{base}[quantity]"] = str(linea.cantidad_comercial)
        payload[f"{base}[price_data][currency]"] = linea.moneda.lower()
        payload[f"{base}[price_data][unit_amount]"] = str(int(linea.precio_unitario * 100))
        payload[f"{base}[price_data][product_data][name]"] = linea.nombre_producto
    indice_envio = len(pedido.lineas)
    base_envio = f"line_items[{indice_envio}]"
    payload[f"{base_envio}[quantity]"] = "1"
    payload[f"{base_envio}[price_data][currency]"] = pedido.moneda.lower()
    payload[f"{base_envio}[price_data][unit_amount]"] = str(int(pedido.importe_envio * 100))
    payload[f"{base_envio}[price_data][product_data][name]"] = "Envío estándar"
    return payload



def _resolver_url_retorno(template: str, id_pedido: str) -> str:
    return template.replace("{ID_PEDIDO}", id_pedido).replace("{CHECKOUT_SESSION_ID}", "{CHECKOUT_SESSION_ID}")

def _validar_firma_stripe(payload: bytes, firma: str | None, secreto: str) -> None:
    if not firma:
        raise ErrorDominio("Falta la firma del webhook de Stripe.")
    partes = dict(fragmento.split("=", 1) for fragmento in firma.split(",") if "=" in fragmento)
    timestamp = partes.get("t", "")
    firma_remota = partes.get("v1", "")
    if not timestamp or not firma_remota:
        raise ErrorDominio("La firma del webhook de Stripe es inválida.")
    firmado = f"{timestamp}.".encode("utf-8") + payload
    digest = hmac.new(secreto.encode("utf-8"), firmado, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(digest, firma_remota):
        raise ErrorDominio("La firma del webhook de Stripe no coincide.")
    if abs(time.time() - int(timestamp)) > 300:
        raise ErrorDominio("El webhook de Stripe está fuera de ventana temporal.")


def _normalizar_evento(evento: dict[str, object]) -> EventoPagoNormalizadoDTO:
    data = evento.get("data", {}) if isinstance(evento.get("data"), dict) else {}
    objeto = data.get("object", {}) if isinstance(data.get("object"), dict) else {}
    metadata = objeto.get("metadata", {}) if isinstance(objeto.get("metadata"), dict) else {}
    id_pedido = str(metadata.get("id_pedido") or objeto.get("client_reference_id") or "").strip()
    id_externo = str(objeto.get("id", "")).strip()
    tipo_evento = str(evento.get("type", "")).strip()
    if tipo_evento == "checkout.session.completed" and objeto.get("payment_status") == "paid":
        estado_pago = "pagado"
    elif tipo_evento == "checkout.session.expired":
        estado_pago = "cancelado"
    else:
        estado_pago = "fallido"
    if not id_pedido or not id_externo or not tipo_evento:
        raise ErrorDominio("El webhook de Stripe no trae los datos mínimos requeridos.")
    importe = Decimal(str((objeto.get("amount_total") or 0) / 100))
    moneda = str(objeto.get("currency", "eur")).upper()
    return EventoPagoNormalizadoDTO(
        id_evento=str(evento.get("id", "")).strip(),
        tipo_evento=tipo_evento,
        proveedor_pago="stripe",
        id_externo_pago=id_externo,
        id_pedido=id_pedido,
        estado_pago=estado_pago,
        moneda=moneda,
        importe=importe,
        payload_crudo=json.dumps(evento, sort_keys=True),
    )


def _respuesta_intencion(id_externo_pago: str, url_pago: str | None) -> dict[str, object]:
    return {
        "proveedor_pago": "stripe",
        "id_externo_pago": id_externo_pago,
        "estado_pago": "requiere_accion",
        "url_pago": url_pago,
    }


def _obligatoria(nombre: str) -> str:
    valor = getattr(settings, nombre, "").strip()
    if not valor:
        raise ErrorDominio(f"Falta la configuración obligatoria {nombre} para pago real v1.")
    return valor


def _extra(operation_id: str, pedido: Pedido, id_externo_pago: str, resultado: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": pedido.id_pedido,
        "proveedor_pago": "stripe",
        "id_externo_pago": id_externo_pago,
        "moneda": pedido.moneda,
        "importe": str(pedido.total),
        "estado_anterior": pedido.estado,
        "estado_nuevo": pedido.estado,
        "tipo_evento": "create_checkout_session",
        "resultado": resultado,
    }


def _extra_reembolso(
    operation_id: str,
    id_externo_pago: str,
    id_externo_reembolso: str,
    moneda: str,
    importe: Decimal,
    resultado: str,
    error: str = "",
) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": None,
        "proveedor_pago": "stripe",
        "id_externo_pago": id_externo_pago,
        "id_externo_reembolso": id_externo_reembolso,
        "moneda": moneda,
        "importe": str(importe),
        "tipo_evento": "manual_refund",
        "resultado": resultado,
        "error": error,
    }
