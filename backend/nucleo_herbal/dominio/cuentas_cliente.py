"""Contrato de cuenta real de cliente para ecommerce final."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .excepciones import ErrorDominio


@dataclass(frozen=True, slots=True)
class CuentaCliente:
    """Cuenta real canónica separada del legado demo."""

    id_usuario: str
    email: str
    nombre_visible: str
    hash_password: str
    activo: bool
    email_verificado: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    def __post_init__(self) -> None:
        if not self.id_usuario.strip():
            raise ErrorDominio("La cuenta cliente requiere identificador.")
        if not _email_valido(self.email):
            raise ErrorDominio("La cuenta cliente requiere email válido.")
        if not self.nombre_visible.strip():
            raise ErrorDominio("La cuenta cliente requiere nombre visible.")
        if not self.hash_password.strip():
            raise ErrorDominio("La cuenta cliente requiere hash de contraseña.")


@dataclass(frozen=True, slots=True)
class CredencialesCuentaCliente:
    email: str
    password_plano: str

    def __post_init__(self) -> None:
        if not _email_valido(self.email):
            raise ErrorDominio("Las credenciales requieren email válido.")
        if len(self.password_plano.strip()) < 8:
            raise ErrorDominio("La contraseña requiere al menos 8 caracteres.")


@dataclass(frozen=True, slots=True)
class SolicitudVerificacionEmail:
    id_solicitud: str
    id_usuario: str
    email: str
    token_hash: str
    expira_en: datetime
    fecha_creacion: datetime
    fecha_envio: datetime
    fecha_confirmacion: datetime | None = None

    def __post_init__(self) -> None:
        if not self.id_solicitud.strip():
            raise ErrorDominio("La solicitud de verificación requiere identificador.")
        if not self.id_usuario.strip():
            raise ErrorDominio("La solicitud de verificación requiere usuario.")
        if not _email_valido(self.email):
            raise ErrorDominio("La solicitud de verificación requiere email válido.")
        if not self.token_hash.strip():
            raise ErrorDominio("La solicitud de verificación requiere hash de token.")


@dataclass(frozen=True, slots=True)
class SolicitudRecuperacionPassword:
    id_solicitud: str
    id_usuario: str
    email: str
    token_hash: str
    expira_en: datetime
    fecha_creacion: datetime
    fecha_envio: datetime
    fecha_uso: datetime | None = None

    def __post_init__(self) -> None:
        if not self.id_solicitud.strip():
            raise ErrorDominio("La solicitud de recuperación requiere identificador.")
        if not self.id_usuario.strip():
            raise ErrorDominio("La solicitud de recuperación requiere usuario.")
        if not _email_valido(self.email):
            raise ErrorDominio("La solicitud de recuperación requiere email válido.")
        if not self.token_hash.strip():
            raise ErrorDominio("La solicitud de recuperación requiere hash de token.")


ESTRATEGIA_CONVIVENCIA_CUENTAS = {
    "contrato_canonico": "CuentaCliente",
    "legado_demo": "CuentaDemo",
    "modo": "coexistencia_controlada",
    "ruta_legacy": "/api/v1/cuentas-demo/",
    "ruta_objetivo": "/api/v1/cuenta/",
    "estado": "cuenta_real_v1_1_password_recovery",
}


def _email_valido(email: str) -> bool:
    normalizado = email.strip()
    return "@" in normalizado and "." in normalizado.split("@")[-1]
