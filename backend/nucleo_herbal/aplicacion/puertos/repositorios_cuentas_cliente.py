"""Puertos para la cuenta real de cliente."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.cuentas_cliente import (
    CuentaCliente,
    CredencialesCuentaCliente,
    SolicitudRecuperacionPassword,
    SolicitudVerificacionEmail,
)


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

    @abstractmethod
    def crear_solicitud_verificacion(self, *, id_usuario: str, token_hash: str, expira_en) -> SolicitudVerificacionEmail:
        """Crea o sustituye la solicitud activa de verificación para una cuenta existente."""

    @abstractmethod
    def obtener_solicitud_por_token_hash(self, token_hash: str) -> SolicitudVerificacionEmail | None:
        """Recupera una solicitud activa por hash de token."""

    @abstractmethod
    def marcar_email_verificado(self, *, id_usuario: str, token_hash: str) -> CuentaCliente | None:
        """Marca la cuenta como verificada si coincide la solicitud esperada."""

    @abstractmethod
    def obtener_solicitud_activa_por_usuario(self, id_usuario: str) -> SolicitudVerificacionEmail | None:
        """Recupera la última solicitud activa para la cuenta."""

    @abstractmethod
    def crear_solicitud_recuperacion_password(self, *, id_usuario: str, token_hash: str, expira_en) -> SolicitudRecuperacionPassword:
        """Crea o sustituye la solicitud activa de recuperación para una cuenta existente."""

    @abstractmethod
    def obtener_solicitud_recuperacion_por_token_hash(self, token_hash: str) -> SolicitudRecuperacionPassword | None:
        """Recupera una solicitud de recuperación por hash de token."""

    @abstractmethod
    def actualizar_password(self, *, id_usuario: str, password_plano: str, token_hash: str) -> CuentaCliente | None:
        """Actualiza la contraseña y marca la solicitud de recuperación como usada."""
