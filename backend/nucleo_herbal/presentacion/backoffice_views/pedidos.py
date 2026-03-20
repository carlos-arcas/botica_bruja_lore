from __future__ import annotations

import json
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_backoffice_pedidos import DatosEnvioBackoffice
from ...dominio.excepciones import ErrorDominio
from ..publica.dependencias import construir_servicios_backoffice_pedidos
from ..publica.pedidos_serializadores import serializar_pedido
from .auth import usuario_staff
from .shared import json_no_autorizado, operation_id


def listado_pedidos_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)
    solo_pagados = request.GET.get("solo_pagados", "").strip().lower() == "true"
    estado = request.GET.get("estado", "").strip() or None
    pedidos = construir_servicios_backoffice_pedidos().listar_pedidos.ejecutar(estado=estado, solo_pagados=solo_pagados)
    items = [serializar_pedido(pedido) for pedido in pedidos]
    return JsonResponse({"items": items, "metricas": {"total": len(items)}})


@csrf_exempt
def marcar_pedido_preparando_backoffice(request: HttpRequest, pedido_id: str) -> JsonResponse:
    return _ejecutar_transicion(request, pedido_id, lambda servicios, actor, op, _: servicios.marcar_preparando.ejecutar(pedido_id, op, actor))


@csrf_exempt
def marcar_pedido_enviado_backoffice(request: HttpRequest, pedido_id: str) -> JsonResponse:
    return _ejecutar_transicion(
        request,
        pedido_id,
        lambda servicios, actor, op, payload: servicios.marcar_enviado.ejecutar(pedido_id, _datos_envio(payload), op, actor),
    )


@csrf_exempt
def marcar_pedido_entregado_backoffice(request: HttpRequest, pedido_id: str) -> JsonResponse:
    return _ejecutar_transicion(
        request,
        pedido_id,
        lambda servicios, actor, op, payload: servicios.marcar_entregado.ejecutar(
            pedido_id,
            op,
            actor,
            str(payload.get("observaciones_operativas", "")),
        ),
    )


def _ejecutar_transicion(request: HttpRequest, pedido_id: str, accion):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    staff = usuario_staff(request)
    if staff is None:
        return json_no_autorizado(request)
    operation_id_actual = operation_id(request)
    payload = _leer_payload(request)
    try:
        pedido = accion(construir_servicios_backoffice_pedidos(), staff.username, operation_id_actual, payload)
    except ErrorAplicacionLookup as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id_actual}, status=404)
    except ErrorDominio as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id_actual}, status=400)
    return JsonResponse({"item": serializar_pedido(pedido), "pedido": serializar_pedido(pedido), "operation_id": operation_id_actual})


def _leer_payload(request: HttpRequest) -> dict[str, object]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}


def _datos_envio(payload: dict[str, object]) -> DatosEnvioBackoffice:
    return DatosEnvioBackoffice(
        transportista=str(payload.get("transportista", "")),
        codigo_seguimiento=str(payload.get("codigo_seguimiento", "")),
        envio_sin_seguimiento=bool(payload.get("envio_sin_seguimiento", False)),
        observaciones_operativas=str(payload.get("observaciones_operativas", "")),
    )
