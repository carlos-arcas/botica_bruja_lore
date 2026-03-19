"""Views HTTP del pago real v1 para Pedido."""

from __future__ import annotations

import logging
from uuid import uuid4

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...dominio.excepciones import ErrorDominio
from .dependencias import construir_servicios_publicos_pago_pedidos
from .respuestas_json import json_no_encontrado, json_validacion

logger = logging.getLogger(__name__)


def iniciar_pago_pedido(request: HttpRequest, id_pedido: str) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    try:
        dto = construir_servicios_publicos_pago_pedidos().iniciar_pago.ejecutar(id_pedido, operation_id)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    except ErrorDominio as error_dominio:
        logger.warning("pago_real_inicio_fallido", extra={"operation_id": operation_id, "pedido_id": id_pedido, "resultado": "error", "error": str(error_dominio)})
        return json_validacion(str(error_dominio))
    return JsonResponse(
        {
            "pago": {
                "id_pedido": dto.id_pedido,
                "proveedor_pago": dto.proveedor_pago,
                "id_externo_pago": dto.id_externo_pago,
                "estado_pago": dto.estado_pago,
                "moneda": str(dto.moneda),
                "importe": str(dto.importe),
                "url_pago": dto.url_pago,
            }
        },
        status=201,
    )


@csrf_exempt
def webhook_pago_stripe(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    firma = request.headers.get("Stripe-Signature")
    try:
        resultado = construir_servicios_publicos_pago_pedidos().procesar_webhook.ejecutar(request.body, firma, operation_id)
    except ErrorDominio as error_dominio:
        logger.warning("pago_real_webhook_rechazado", extra={"operation_id": operation_id, "pedido_id": None, "resultado": "error", "error": str(error_dominio), "proveedor_pago": "stripe"})
        return JsonResponse({"detalle": str(error_dominio)}, status=400)
    return JsonResponse(resultado, status=200)
