"""Puertos de persistencia para cuenta demo (prompt 1 ciclo 4)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.cuentas_demo import CuentaDemo


class RepositorioCuentasDemo(ABC):
    @abstractmethod
    def guardar(self, cuenta: CuentaDemo) -> CuentaDemo:
        """Persiste una cuenta demo y devuelve su versión reconstruida."""

    @abstractmethod
    def obtener_por_email(self, email: str) -> CuentaDemo | None:
        """Recupera cuenta demo por email normalizado."""

    @abstractmethod
    def obtener_por_id_usuario(self, id_usuario: str) -> CuentaDemo | None:
        """Recupera cuenta demo por id de usuario."""
