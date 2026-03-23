"""Adaptador mínimo para recuperación de contraseña de cuenta cliente."""

from __future__ import annotations

import logging

from django.core.mail import send_mail

from ..aplicacion.puertos.notificador_recuperacion_password import NotificadorRecuperacionPassword
from ..dominio.cuentas_cliente import CuentaCliente
from .notificaciones_email_cuenta import construir_url_publica_cuenta, resolver_remitente_cuenta

logger = logging.getLogger(__name__)


class NotificadorEmailRecuperacionPasswordCuenta(NotificadorRecuperacionPassword):
    def enviar_recuperacion(self, *, cuenta: CuentaCliente, token_plano: str, expira_en, operation_id: str) -> None:
        enlace = construir_url_publica_cuenta("/recuperar-password", {"token": token_plano})
        send_mail(
            subject="Recupera tu contraseña en La Botica de la Bruja Lore",
            message=_cuerpo_recuperacion(cuenta, enlace, expira_en),
            from_email=resolver_remitente_cuenta(),
            recipient_list=[cuenta.email],
            fail_silently=False,
        )
        logger.info(
            "cuenta_real_password_recovery_dispatch",
            extra={
                "operation_id": operation_id,
                "usuario_id": cuenta.id_usuario,
                "email": cuenta.email,
                "resultado": "dispatch_ok",
                "expira_en": expira_en.isoformat(),
            },
        )


def _cuerpo_recuperacion(cuenta: CuentaCliente, enlace: str, expira_en) -> str:
    return (
        f"Hola {cuenta.nombre_visible}.\n\n"
        "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta real.\n"
        f"Puedes crear una nueva contraseña desde este enlace: {enlace}\n\n"
        f"Este enlace caduca el {expira_en.isoformat()}.\n"
        "Si no has solicitado este cambio, puedes ignorar este mensaje."
    )
