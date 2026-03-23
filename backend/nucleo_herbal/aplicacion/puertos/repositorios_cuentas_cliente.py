"""Puertos para la cuenta real de cliente."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.cuentas_cliente import (
    ComandoDireccionCuentaCliente,
    CuentaCliente,
    CredencialesCuentaCliente,
    DireccionCuentaCliente,
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
    def listar_direcciones(self, *, id_usuario: str) -> tuple[DireccionCuentaCliente, ...]:
        """Lista la libreta de direcciones de una cuenta."""

    @abstractmethod
    def crear_direccion(self, *, id_usuario: str, comando: ComandoDireccionCuentaCliente) -> DireccionCuentaCliente:
        """Crea una dirección para la cuenta."""

    @abstractmethod
    def actualizar_direccion(self, *, id_usuario: str, id_direccion: str, comando: ComandoDireccionCuentaCliente) -> DireccionCuentaCliente | None:
        """Actualiza una dirección propia."""

    @abstractmethod
    def eliminar_direccion(self, *, id_usuario: str, id_direccion: str) -> bool:
        """Elimina una dirección propia."""

    @abstractmethod
    def marcar_direccion_predeterminada(self, *, id_usuario: str, id_direccion: str) -> DireccionCuentaCliente | None:
        """Marca una dirección propia como predeterminada."""

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
