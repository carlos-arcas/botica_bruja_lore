"""Puerto de validación de contraseña para cuenta cliente real."""

from __future__ import annotations

from abc import ABC, abstractmethod


class ValidadorPasswordCuentaCliente(ABC):
    @abstractmethod
    def validar(self, *, password_plano: str, email: str, nombre_visible: str) -> None:
        """Valida la contraseña según la política activa de infraestructura."""
