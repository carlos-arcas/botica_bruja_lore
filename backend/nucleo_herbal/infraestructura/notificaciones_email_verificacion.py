"""Adaptador mínimo para verificación de email de cuenta cliente."""

from __future__ import annotations

import logging

from django.core.mail import send_mail

from ..aplicacion.puertos.notificador_verificacion_email import NotificadorVerificacionEmail
from ..dominio.cuentas_cliente import CuentaCliente
from .notificaciones_email_cuenta import construir_url_publica_cuenta, resolver_remitente_cuenta

logger = logging.getLogger(__name__)


class NotificadorEmailVerificacionCuenta(NotificadorVerificacionEmail):
    def enviar_verificacion(self, *, cuenta: CuentaCliente, token_plano: str, expira_en, operation_id: str) -> None:
        enlace = construir_url_publica_cuenta("/verificar-email", {"token": token_plano})
        send_mail(
            subject="Verifica tu email en La Botica de la Bruja Lore",
            message=_cuerpo_verificacion(cuenta, enlace, expira_en),
            from_email=resolver_remitente_cuenta(),
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


def _cuerpo_verificacion(cuenta: CuentaCliente, enlace: str, expira_en) -> str:
    return (
        f"Hola {cuenta.nombre_visible}.\n\n"
        "Tu cuenta real ya está creada, pero aún necesitamos verificar tu email.\n"
        f"Confirma tu dirección desde este enlace: {enlace}\n\n"
        f"Este enlace caduca el {expira_en.isoformat()}.\n"
        "Si no has solicitado esta cuenta, puedes ignorar este mensaje."
    )
