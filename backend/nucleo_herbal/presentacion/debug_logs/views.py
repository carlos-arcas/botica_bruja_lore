from __future__ import annotations

import json

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from .seguridad import validar_acceso_debug_logs
from .servicio_logs import FUENTES_VALIDAS, extraer_logs, limpiar_logs


@require_GET
def obtener_logs(request):
    validar_acceso_debug_logs(request)
    source = request.GET.get("source", "app")
    if source not in FUENTES_VALIDAS:
        return JsonResponse({"detalle": "source inválido"}, status=400)

    texto = request.GET.get("q", "")
    nivel = request.GET.get("level", "")
    limite = request.GET.get("limit", "200")
    try:
        limite_int = max(1, min(int(limite), 500))
    except ValueError:
        return JsonResponse({"detalle": "limit inválido"}, status=400)

    data = extraer_logs(source=source, texto=texto, nivel=nivel, limite=limite_int)
    return JsonResponse(data, status=200)


@require_POST
def limpiar_logs_view(request):
    validar_acceso_debug_logs(request)
    try:
        payload = json.loads(request.body or "{}") if request.body else {}
    except json.JSONDecodeError:
        return JsonResponse({"detalle": "JSON inválido"}, status=400)
    source = payload.get("source")
    if source is not None and source not in FUENTES_VALIDAS:
        return JsonResponse({"detalle": "source inválido"}, status=400)

    resultado = limpiar_logs(source=source)
    return JsonResponse({"limpiado": resultado}, status=200)
