"""Helpers mínimos para contratos de error JSON en APIs públicas."""

from django.http import JsonResponse


def json_error(detalle: str, status: int, codigo: str | None = None) -> JsonResponse:
    payload = {"detalle": str(detalle)}
    if codigo:
        payload["codigo"] = codigo
    return JsonResponse(payload, status=status)


def json_no_encontrado(detalle: str, codigo: str | None = None) -> JsonResponse:
    return json_error(detalle=detalle, status=404, codigo=codigo)


def json_validacion(detalle: str, codigo: str | None = None) -> JsonResponse:
    return json_error(detalle=detalle, status=400, codigo=codigo)


def json_no_autorizado(detalle: str, codigo: str | None = None) -> JsonResponse:
    return json_error(detalle=detalle, status=401, codigo=codigo)
