"""Puerto de envío de verificación de email para cuenta cliente real."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from ...dominio.cuentas_cliente import CuentaCliente


class NotificadorVerificacionEmail(ABC):
    @abstractmethod
    def enviar_verificacion(self, *, cuenta: CuentaCliente, token_plano: str, expira_en: datetime, operation_id: str) -> None:
        """Envía el email transaccional mínimo de verificación."""
