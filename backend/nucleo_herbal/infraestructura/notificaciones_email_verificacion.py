"""Adaptador mínimo para verificación de email de cuenta cliente."""

from __future__ import annotations

import logging
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail

from ..aplicacion.puertos.notificador_verificacion_email import NotificadorVerificacionEmail
from ..dominio.cuentas_cliente import CuentaCliente

logger = logging.getLogger(__name__)


class NotificadorEmailVerificacionCuenta(NotificadorVerificacionEmail):
    def enviar_verificacion(self, *, cuenta: CuentaCliente, token_plano: str, expira_en, operation_id: str) -> None:
        enlace = _construir_enlace_verificacion(token_plano)
        send_mail(
            subject="Verifica tu email en La Botica de la Bruja Lore",
            message=_cuerpo_verificacion(cuenta, enlace, expira_en),
            from_email=_resolver_remitente(),
            recipient_list=[cuenta.email],
            fail_silently=False,
        )
        logger.info(
            "cuenta_real_verificacion_email_dispatch",
            extra={
                "operation_id": operation_id,
                "usuario_id": cuenta.id_usuario,
                "email": cuenta.email,
                "resultado": "dispatch_ok",
                "expira_en": expira_en.isoformat(),
            },
        )


def _construir_enlace_verificacion(token_plano: str) -> str:
    base = getattr(settings, "PUBLIC_SITE_URL", "").strip().rstrip("/") or "http://localhost:3000"
    return f"{base}/verificar-email?{urlencode({'token': token_plano})}"


def _cuerpo_verificacion(cuenta: CuentaCliente, enlace: str, expira_en) -> str:
    return (
        f"Hola {cuenta.nombre_visible}.\n\n"
        "Tu cuenta real ya está creada, pero aún necesitamos verificar tu email.\n"
        f"Confirma tu dirección desde este enlace: {enlace}\n\n"
        f"Este enlace caduca el {expira_en.isoformat()}.\n"
        "Si no has solicitado esta cuenta, puedes ignorar este mensaje."
    )


def _resolver_remitente() -> str:
    remitente = getattr(settings, "DEFAULT_FROM_EMAIL", "").strip()
    return remitente or "no-reply@botica-lore.local"
