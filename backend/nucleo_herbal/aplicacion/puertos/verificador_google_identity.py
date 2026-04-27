"""Puerto para verificar credenciales de Google Identity."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class IdentidadGoogleVerificada:
    google_sub: str
    email: str
    nombre_visible: str
    email_verificado: bool


class VerificadorGoogleIdentity(ABC):
    @abstractmethod
    def verificar(self, *, credential: str) -> IdentidadGoogleVerificada:
        """Valida la credencial emitida por Google y devuelve una identidad verificada."""
