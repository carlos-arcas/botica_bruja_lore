"""Puertos para la cuenta real de cliente."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.cuentas_cliente import CuentaCliente, CredencialesCuentaCliente


class RepositorioCuentasCliente(ABC):
    @abstractmethod
    def registrar(self, *, email: str, nombre_visible: str, password_plano: str) -> CuentaCliente:
        """Crea y reconstruye una cuenta cliente real."""

    @abstractmethod
    def autenticar(self, credenciales: CredencialesCuentaCliente) -> CuentaCliente | None:
        """Valida credenciales y devuelve cuenta real."""

    @abstractmethod
    def obtener_por_email(self, email: str) -> CuentaCliente | None:
        """Obtiene cuenta real por email."""

    @abstractmethod
    def obtener_por_id_usuario(self, id_usuario: str) -> CuentaCliente | None:
        """Obtiene cuenta real por id canónico."""
