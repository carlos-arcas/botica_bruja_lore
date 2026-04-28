"""Views HTTP del pago real v1 para Pedido."""

from __future__ import annotations

import logging
from uuid import uuid4

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.errores_pedidos import ErrorStockPedido
from ...dominio.excepciones import ErrorDominio
from .autorizacion_pedidos import validar_acceso_pedido
from .dependencias import construir_servicios_publicos_pedidos
from .dependencias import construir_servicios_publicos_pago_pedidos
from .pedidos_serializadores import serializar_pedido
from .respuestas_json import json_conflicto, json_no_encontrado, json_validacion

logger = logging.getLogger(__name__)


def iniciar_pago_pedido(request: HttpRequest, id_pedido: str) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    try:
        pedido = construir_servicios_publicos_pedidos().obtener_pedido.ejecutar(id_pedido)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    acceso_denegado = validar_acceso_pedido(request, pedido, recurso="iniciar_pago")
    if acceso_denegado is not None:
        return acceso_denegado
    try:
        dto = construir_servicios_publicos_pago_pedidos().iniciar_pago.ejecutar(id_pedido, operation_id)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    except ErrorStockPedido as error_stock:
        logger.warning("pago_real_inicio_stock_rechazado", extra=_extra_stock(operation_id, id_pedido, error_stock))
        return _respuesta_stock(error_stock)
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


def confirmar_pago_simulado_pedido(request: HttpRequest, id_pedido: str) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "MÃ©todo no permitido."}, status=405)
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    try:
        pedido = construir_servicios_publicos_pedidos().obtener_pedido.ejecutar(id_pedido)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    acceso_denegado = validar_acceso_pedido(request, pedido, recurso="confirmar_pago_simulado")
    if acceso_denegado is not None:
        return acceso_denegado
    try:
        construir_servicios_publicos_pago_pedidos().confirmar_pago_simulado.ejecutar(id_pedido, operation_id)
        actualizado = construir_servicios_publicos_pedidos().obtener_pedido.ejecutar(id_pedido)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    except ErrorStockPedido as error_stock:
        logger.warning("pago_simulado_confirmacion_stock_rechazado", extra=_extra_stock(operation_id, id_pedido, error_stock))
        return _respuesta_stock(error_stock)
    except ErrorDominio as error_dominio:
        logger.warning("pago_simulado_confirmacion_fallida", extra=_extra_confirmacion(operation_id, id_pedido, "error", str(error_dominio)))
        return json_validacion(str(error_dominio))
    logger.info("pago_simulado_confirmacion_http_ok", extra=_extra_confirmacion(operation_id, id_pedido, "ok", ""))
    return JsonResponse({"resultado": "pagado", "pedido": serializar_pedido(actualizado)}, status=200)


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


def retorno_pago_success(request: HttpRequest, id_pedido: str) -> JsonResponse:
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    logger.info(
        "pago_real_retorno_success",
        extra={
            "operation_id": operation_id,
            "pedido_id": id_pedido,
            "id_externo_pago": request.GET.get("session_id", ""),
            "email_contacto": None,
            "estado_anterior": None,
            "estado_nuevo": None,
            "evento": "retorno_success",
            "resultado": "ok",
        },
    )
    return JsonResponse({"retorno": "success", "pedido_id": id_pedido, "session_id": request.GET.get("session_id")})


def retorno_pago_cancel(request: HttpRequest, id_pedido: str) -> JsonResponse:
    operation_id = request.headers.get("X-Operation-Id", "").strip() or str(uuid4())
    logger.info(
        "pago_real_retorno_cancel",
        extra={
            "operation_id": operation_id,
            "pedido_id": id_pedido,
            "id_externo_pago": request.GET.get("session_id", ""),
            "email_contacto": None,
            "estado_anterior": None,
            "estado_nuevo": None,
            "evento": "retorno_cancel",
            "resultado": "ok",
        },
    )
    return JsonResponse({"retorno": "cancel", "pedido_id": id_pedido, "session_id": request.GET.get("session_id")})


def _extra_confirmacion(operation_id: str, id_pedido: str, resultado: str, error: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": id_pedido,
        "proveedor_pago": "simulado_local",
        "resultado": resultado,
        "error": error,
    }


def _respuesta_stock(error_stock: ErrorStockPedido) -> JsonResponse:
    return json_conflicto(
        error_stock.detalle,
        codigo=error_stock.codigo,
        lineas=[linea.a_payload() for linea in error_stock.lineas],
    )


def _extra_stock(operation_id: str, id_pedido: str, error_stock: ErrorStockPedido) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": id_pedido,
        "resultado": "error",
        "codigo": error_stock.codigo,
        "lineas": [linea.a_payload() for linea in error_stock.lineas],
    }
