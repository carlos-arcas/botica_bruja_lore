from __future__ import annotations

from uuid import uuid4

from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...dominio.excepciones import ErrorDominio
from ..publica.dependencias import construir_servicios_backoffice_pedidos
from ..publica.pedidos_serializadores import serializar_pedido
from .auth import usuario_staff
from .shared import json_no_autorizado


def listado_pedidos_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    solo_pagados = request.GET.get("solo_pagados", "").strip().lower() == "true"
    pedidos = construir_servicios_backoffice_pedidos().listar_pedidos.ejecutar(solo_pagados=solo_pagados)
    items = [serializar_pedido(pedido) for pedido in pedidos]
    return JsonResponse({"items": items, "metricas": {"total": len(items)}})


@csrf_exempt
def marcar_pedido_preparando_backoffice(request: HttpRequest, pedido_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    operation_id = request.headers.get("X-Request-ID", str(uuid4()))
    try:
        pedido = construir_servicios_backoffice_pedidos().marcar_preparando.ejecutar(pedido_id, operation_id)
    except ErrorAplicacionLookup as exc:
        return JsonResponse({"detalle": str(exc)}, status=404)
    except ErrorDominio as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
    return JsonResponse({"item": serializar_pedido(pedido), "pedido": serializar_pedido(pedido)})
