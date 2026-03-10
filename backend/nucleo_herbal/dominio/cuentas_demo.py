"""Dominio mínimo para cuenta demo con valor en ciclo 4."""

from __future__ import annotations

from dataclasses import dataclass

from .excepciones import ErrorDominio


@dataclass(frozen=True, slots=True)
class PerfilCuentaDemo:
    """Perfil mínimo utilizable en área de cuenta demo."""

    nombre_visible: str

    def __post_init__(self) -> None:
        if not self.nombre_visible.strip():
            raise ErrorDominio("El perfil requiere nombre visible.")


@dataclass(frozen=True, slots=True)
class CredencialCuentaDemo:
    """Credencial demo mínima para autenticación no productiva."""

    clave_acceso_demo: str

    def __post_init__(self) -> None:
        if len(self.clave_acceso_demo.strip()) < 4:
            raise ErrorDominio("La credencial demo requiere al menos 4 caracteres.")


@dataclass(frozen=True, slots=True)
class CuentaDemo:
    """Agregado mínimo de cuenta útil para autenticación y continuidad demo."""

    id_usuario: str
    email: str
    perfil: PerfilCuentaDemo
    credencial: CredencialCuentaDemo

    def __post_init__(self) -> None:
        if not self.id_usuario.strip():
            raise ErrorDominio("La cuenta demo requiere id de usuario.")
        if not _email_valido(self.email):
            raise ErrorDominio("La cuenta demo requiere email válido.")

    def validar_credencial_demo(self, clave_plana: str) -> bool:
        return self.credencial.clave_acceso_demo == clave_plana.strip()



def _email_valido(email: str) -> bool:
    email_normalizado = email.strip()
    return "@" in email_normalizado and "." in email_normalizado.split("@")[-1]
