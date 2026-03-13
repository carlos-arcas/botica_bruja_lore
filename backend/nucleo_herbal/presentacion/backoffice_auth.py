"""Utilidades de autenticación para el backoffice Next.js."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.http import HttpRequest
from django.core import signing

SAL_AUTH_BACKOFFICE = "backoffice-auth-v1"


class TokenBackofficeInvalido(Exception):
    """Error de token inválido o expirado."""


def usuario_staff_activo(usuario) -> bool:
    return bool(
        usuario
        and getattr(usuario, "is_authenticated", False)
        and bool(getattr(usuario, "is_active", False))
        and bool(getattr(usuario, "is_staff", False))
    )


def crear_token_backoffice(usuario) -> str:
    payload = {"user_id": str(usuario.pk)}
    return signing.dumps(payload, salt=SAL_AUTH_BACKOFFICE)


def resolver_usuario_por_token(token: str | None, max_age_segundos: int):
    if not token:
        return None

    try:
        payload = signing.loads(token, salt=SAL_AUTH_BACKOFFICE, max_age=max_age_segundos)
    except signing.BadSignature as exc:
        raise TokenBackofficeInvalido from exc
    except signing.SignatureExpired as exc:
        raise TokenBackofficeInvalido from exc

    user_id = payload.get("user_id")
    if not user_id:
        raise TokenBackofficeInvalido

    User = get_user_model()
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        raise TokenBackofficeInvalido


def extraer_token_bearer(request: HttpRequest) -> str | None:
    cabecera = request.headers.get("Authorization", "")
    prefijo = "Bearer "
    if cabecera.startswith(prefijo):
        return cabecera[len(prefijo) :].strip() or None
    return None


def resolver_usuario_backoffice(request: HttpRequest):
    token = extraer_token_bearer(request)
    if token:
        try:
            usuario = resolver_usuario_por_token(token, 28800)
        except TokenBackofficeInvalido:
            return None
        return usuario if usuario_staff_activo(usuario) else None

    usuario = getattr(request, "user", None)
    return usuario if usuario_staff_activo(usuario) else None
