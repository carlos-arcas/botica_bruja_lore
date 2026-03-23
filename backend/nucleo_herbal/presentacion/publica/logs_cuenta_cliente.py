"""Logging estructurado para autenticación y área de cuenta real."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


EVENTOS_WARNING = {
    "error",
    "credenciales_invalidas",
    "token_invalido",
    "token_expirado",
    "token_usado",
    "cuenta_ya_verificada",
    "password_invalida",
    "direccion_invalida",
}



def log_evento_cuenta(*, evento: str, operation_id: str, email: str | None, usuario_id: str | None, resultado: str, error: str | None = None) -> None:
    payload = {
        "operation_id": operation_id,
        "email": email,
        "usuario_id": usuario_id,
        "flujo": "cuenta_real_v1_1_password_recovery",
        "resultado": resultado,
    }
    if error:
        payload["error"] = error
    metodo = logger.warning if resultado in EVENTOS_WARNING else logger.info
    metodo(evento, extra=payload)
