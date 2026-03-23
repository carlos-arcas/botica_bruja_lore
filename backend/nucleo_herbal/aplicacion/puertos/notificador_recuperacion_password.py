"""Puerto de email de recuperación de contraseña para cuenta cliente real."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from ...dominio.cuentas_cliente import CuentaCliente


class NotificadorRecuperacionPassword(ABC):
    @abstractmethod
    def enviar_recuperacion(self, *, cuenta: CuentaCliente, token_plano: str, expira_en: datetime, operation_id: str) -> None:
        """Envía el email mínimo para restablecer la contraseña."""
