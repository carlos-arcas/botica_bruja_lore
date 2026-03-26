"""Reglas mínimas de ACL para acceso a pedidos y documentos."""

from __future__ import annotations

import logging
from typing import Any

from django.http import HttpRequest, JsonResponse

from .respuestas_json import json_error, json_no_autorizado

logger = logging.getLogger(__name__)


def validar_acceso_pedido(request: HttpRequest, pedido: Any, *, recurso: str) -> JsonResponse | None:
    """Valida acceso a recursos sensibles de pedido.

    Política mínima:
    - staff activo puede acceder a cualquier pedido;
    - pedido de cuenta real (id_cliente informado) sólo por dueño autenticado;
    - pedido invitado mantiene compatibilidad de acceso público.
    """
    if _es_staff_activo(request):
        return None

    cliente = getattr(pedido, "cliente", None)
    id_cliente = str(
        getattr(cliente, "id_cliente", None)
        or getattr(cliente, "id_usuario", None)
        or ""
    ).strip()
    if not id_cliente:
        return None

    if not request.user.is_authenticated:
        logger.warning(
            "pedido_acl_denegado_no_autenticado",
            extra={"id_pedido": getattr(pedido, "id_pedido", ""), "recurso": recurso},
        )
        return json_no_autorizado("Debes iniciar sesión para acceder a este recurso de pedido.")

    id_usuario_actual = str(request.user.id).strip()
    if id_usuario_actual != id_cliente:
        logger.warning(
            "pedido_acl_denegado_usuario_distinto",
            extra={
                "id_pedido": getattr(pedido, "id_pedido", ""),
                "recurso": recurso,
                "id_usuario_actual": id_usuario_actual,
                "id_cliente_pedido": id_cliente,
            },
        )
        return json_error("No tienes permisos para acceder a este pedido.", status=403, codigo="pedido_no_permitido")

    return None


def _es_staff_activo(request: HttpRequest) -> bool:
    user = request.user
    return bool(user.is_authenticated and user.is_staff and user.is_active)
