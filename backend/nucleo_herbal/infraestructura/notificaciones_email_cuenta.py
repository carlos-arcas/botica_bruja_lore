"""Utilidades compartidas de notificaciones email para cuenta cliente."""

from __future__ import annotations

from urllib.parse import urlencode

from django.conf import settings


def construir_url_publica_cuenta(path: str, query: dict[str, str]) -> str:
    base = getattr(settings, "PUBLIC_SITE_URL", "").strip().rstrip("/") or "http://localhost:3000"
    sufijo = urlencode(query)
    return f"{base}{path}?{sufijo}" if sufijo else f"{base}{path}"


def resolver_remitente_cuenta() -> str:
    remitente = getattr(settings, "DEFAULT_FROM_EMAIL", "").strip()
    return remitente or "no-reply@botica-lore.local"
