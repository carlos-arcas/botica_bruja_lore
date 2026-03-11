"""Helpers mínimos para contratos de error JSON en APIs públicas."""

from django.http import JsonResponse


def json_error(detalle: str, status: int) -> JsonResponse:
    return JsonResponse({"detalle": str(detalle)}, status=status)


def json_no_encontrado(detalle: str) -> JsonResponse:
    return json_error(detalle=detalle, status=404)


def json_validacion(detalle: str) -> JsonResponse:
    return json_error(detalle=detalle, status=400)


def json_no_autorizado(detalle: str) -> JsonResponse:
    return json_error(detalle=detalle, status=401)
