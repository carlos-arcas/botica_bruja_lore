from __future__ import annotations

from django.http import HttpRequest, JsonResponse

from backend.nucleo_herbal.presentacion.backoffice_auth import resolver_usuario_backoffice

from .shared import json_no_autorizado


def usuario_staff(request: HttpRequest):
    usuario = resolver_usuario_backoffice(request)
    return usuario if usuario and usuario.is_staff and usuario.is_active else None


def estado_backoffice(request: HttpRequest) -> JsonResponse:
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    return JsonResponse(
        {
            "autorizado": True,
            "usuario": {
                "username": usuario.username,
                "is_staff": True,
                "is_superuser": bool(usuario.is_superuser),
            },
        }
    )
