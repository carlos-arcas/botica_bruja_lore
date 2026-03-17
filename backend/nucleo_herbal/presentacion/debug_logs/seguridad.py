from __future__ import annotations

import secrets

from django.conf import settings
from django.http import Http404, HttpRequest


def validar_acceso_debug_logs(request: HttpRequest) -> None:
    if not getattr(settings, "DEBUG_LOG_VIEWER_ENABLED", False):
        raise Http404("Not found")

    clave_configurada = getattr(settings, "DEBUG_LOG_VIEWER_KEY", "")
    if not clave_configurada:
        raise Http404("Not found")

    clave = request.headers.get("X-Debug-Log-Key") or request.GET.get("debug_key", "")
    if not secrets.compare_digest(clave, clave_configurada):
        raise Http404("Not found")
