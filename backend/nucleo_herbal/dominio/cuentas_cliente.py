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
class DireccionCuentaCliente:
    id_direccion: str
    id_usuario: str
    alias: str
    nombre_destinatario: str
    telefono_contacto: str
    linea_1: str
    linea_2: str
    codigo_postal: str
    ciudad: str
    provincia: str
    pais_iso: str
    predeterminada: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    def __post_init__(self) -> None:
        if not self.id_direccion.strip():
            raise ErrorDominio("La dirección requiere identificador.")
        if not self.id_usuario.strip():
            raise ErrorDominio("La dirección requiere usuario.")
        if not self.nombre_destinatario.strip():
            raise ErrorDominio("La dirección requiere nombre destinatario.")
        if not self.telefono_contacto.strip():
            raise ErrorDominio("La dirección requiere teléfono de contacto.")
        if not self.linea_1.strip():
            raise ErrorDominio("La dirección requiere línea principal.")
        if not self.codigo_postal.strip():
            raise ErrorDominio("La dirección requiere código postal.")
        if not self.ciudad.strip():
            raise ErrorDominio("La dirección requiere ciudad.")
        if not self.provincia.strip():
            raise ErrorDominio("La dirección requiere provincia.")
        if len(_pais_iso_normalizado(self.pais_iso)) != 2:
            raise ErrorDominio("La dirección requiere país ISO de 2 letras.")

    def a_direccion_entrega(self) -> dict[str, str]:
        return {
            "nombre_destinatario": self.nombre_destinatario,
            "linea_1": self.linea_1,
            "linea_2": self.linea_2,
            "codigo_postal": self.codigo_postal,
            "ciudad": self.ciudad,
            "provincia": self.provincia,
            "pais_iso": _pais_iso_normalizado(self.pais_iso),
            "observaciones": "",
        }


@dataclass(frozen=True, slots=True)
class ComandoDireccionCuentaCliente:
    alias: str = ""
    nombre_destinatario: str = ""
    telefono_contacto: str = ""
    linea_1: str = ""
    linea_2: str = ""
    codigo_postal: str = ""
    ciudad: str = ""
    provincia: str = ""
    pais_iso: str = "ES"

    def __post_init__(self) -> None:
        if not self.nombre_destinatario.strip():
            raise ErrorDominio("El nombre destinatario es obligatorio.")
        if not self.telefono_contacto.strip():
            raise ErrorDominio("El teléfono de contacto es obligatorio.")
        if not self.linea_1.strip():
            raise ErrorDominio("La línea principal es obligatoria.")
        if not self.codigo_postal.strip():
            raise ErrorDominio("El código postal es obligatorio.")
        if not self.ciudad.strip():
            raise ErrorDominio("La ciudad es obligatoria.")
        if not self.provincia.strip():
            raise ErrorDominio("La provincia es obligatoria.")
        if len(_pais_iso_normalizado(self.pais_iso)) != 2:
            raise ErrorDominio("El país debe usar ISO de 2 letras.")


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
    "estado": "cuenta_real_v1_1_address_book",
}


def _email_valido(email: str) -> bool:
    normalizado = email.strip()
    return "@" in normalizado and "." in normalizado.split("@")[-1]


def _pais_iso_normalizado(pais_iso: str) -> str:
    return pais_iso.strip().upper()
