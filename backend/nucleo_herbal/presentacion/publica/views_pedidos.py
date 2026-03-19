"""Views HTTP del checkout real v1."""

from __future__ import annotations

import json
import logging
from uuid import uuid4

from django.http import HttpRequest, JsonResponse

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...dominio.excepciones import ErrorDominio
from .dependencias import construir_servicios_publicos_pedidos
from .payload_pedidos import construir_payload_pedido
from .pedidos_serializadores import serializar_pedido
from .respuestas_json import json_no_encontrado, json_validacion

logger = logging.getLogger(__name__)


def crear_pedido(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    payload, error = _leer_json(request)
    if error is not None:
        _log_error(operation_id, payload.get("canal_checkout"), payload.get("email_contacto"), error)
        return error
    try:
        if request.user.is_authenticated:
            payload = dict(payload)
            payload["id_usuario"] = str(request.user.id)
            payload["canal_checkout"] = "web_autenticado"
            logger.info(
                "pedido_real_asociado_a_usuario_autenticado",
                extra={
                    "operation_id": operation_id,
                    "flujo": "checkout_real_v1",
                    "usuario_id": str(request.user.id),
                    "email": request.user.email,
                    "resultado": "ok",
                },
            )
        pedido_payload = construir_payload_pedido(payload)
        pedido = construir_servicios_publicos_pedidos().registrar_pedido.ejecutar(
            pedido_payload,
            operation_id=operation_id,
        )
    except ErrorDominio as error_dominio:
        _log_error(operation_id, payload.get("canal_checkout"), payload.get("email_contacto"), error_dominio)
        return json_validacion(str(error_dominio))
    return JsonResponse({"pedido": serializar_pedido(pedido)}, status=201)


def detalle_pedido(_request: HttpRequest, id_pedido: str) -> JsonResponse:
    try:
        pedido = construir_servicios_publicos_pedidos().obtener_pedido.ejecutar(id_pedido)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    return JsonResponse({"pedido": serializar_pedido(pedido)})


def _leer_json(request: HttpRequest) -> tuple[dict, JsonResponse | None]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}, json_validacion("JSON inválido.")
    if not isinstance(payload, dict):
        return {}, json_validacion("El payload debe ser un objeto JSON.")
    return payload, None


def _log_error(operation_id: str, canal_checkout: object, email_contacto: object, error: Exception | JsonResponse) -> None:
    detalle = getattr(error, "content", b"").decode("utf-8") if isinstance(error, JsonResponse) else str(error)
    logger.warning(
        "pedido_real_error_creacion",
        extra={
            "operation_id": operation_id,
            "ruta": "/api/v1/pedidos/",
            "flujo": "checkout_real_v1",
            "canal_checkout": canal_checkout,
            "email_contacto": email_contacto,
            "numero_lineas": 0,
            "subtotal": "0.00",
            "estado_inicial": "pendiente_pago",
            "error": detalle,
        },
    )
