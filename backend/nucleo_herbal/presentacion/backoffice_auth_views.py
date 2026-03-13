"""Endpoints de autenticación para backoffice Next.js."""

from __future__ import annotations

import json
import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .backoffice_auth import (
    TokenBackofficeInvalido,
    crear_token_backoffice,
    extraer_token_bearer,
    resolver_usuario_por_token,
    usuario_staff_activo,
)

LOGGER = logging.getLogger(__name__)
TOKEN_TTL_SEGUNDOS = int(getattr(settings, "BACKOFFICE_TOKEN_TTL_SECONDS", 8 * 60 * 60))


def _responder_no_autorizado(mensaje: str = "Credenciales inválidas para backoffice.") -> JsonResponse:
    return JsonResponse({"autenticado": False, "detalle": mensaje}, status=401)


def _serializar_usuario(usuario) -> dict[str, object]:
    return {
        "username": usuario.get_username(),
        "is_staff": bool(usuario.is_staff),
        "is_superuser": bool(usuario.is_superuser),
    }


def _extraer_credenciales(request: HttpRequest) -> tuple[str, str] | None:
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None

    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    if not username or not password:
        return None
    return username, password


@csrf_exempt
def login_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    credenciales = _extraer_credenciales(request)
    if credenciales is None:
        return _responder_no_autorizado("Debes enviar usuario y contraseña.")

    username, password = credenciales
    usuario = authenticate(request, username=username, password=password)
    if not usuario_staff_activo(usuario):
        LOGGER.info("backoffice_login_failed", extra={"username": username})
        return _responder_no_autorizado()

    token = crear_token_backoffice(usuario)
    LOGGER.info("backoffice_login_ok", extra={"username": usuario.get_username()})
    return JsonResponse(
        {
            "autenticado": True,
            "token": token,
            "token_ttl": TOKEN_TTL_SEGUNDOS,
            "usuario": _serializar_usuario(usuario),
        }
    )


def sesion_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    token = extraer_token_bearer(request)
    try:
        usuario = resolver_usuario_por_token(token, TOKEN_TTL_SEGUNDOS)
    except TokenBackofficeInvalido:
        return _responder_no_autorizado("Sesión backoffice inválida o expirada.")

    if not usuario_staff_activo(usuario):
        return _responder_no_autorizado()

    return JsonResponse({"autenticado": True, "usuario": _serializar_usuario(usuario)})


@csrf_exempt
def logout_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    token = extraer_token_bearer(request)
    username = "desconocido"
    if token:
        try:
            usuario = resolver_usuario_por_token(token, TOKEN_TTL_SEGUNDOS)
            username = usuario.get_username()
        except TokenBackofficeInvalido:
            username = "token_invalido"

    LOGGER.info("backoffice_logout", extra={"username": username})
    return JsonResponse({"logout": True})
