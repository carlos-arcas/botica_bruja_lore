"""Puertos de repositorio para rituales conectados."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.entidades import Planta, Producto
from ...dominio.rituales import Ritual


class RepositorioRituales(ABC):
    @abstractmethod
    def listar_navegables(self) -> tuple[Ritual, ...]:
        """Devuelve rituales publicables para navegación."""

    @abstractmethod
    def obtener_por_slug(self, slug_ritual: str) -> Ritual | None:
        """Busca detalle de ritual por slug."""

    @abstractmethod
    def listar_por_intencion(self, slug_intencion: str) -> tuple[Ritual, ...]:
        """Devuelve rituales relacionados a una intención."""

    @abstractmethod
    def listar_por_planta(self, id_planta: str) -> tuple[Ritual, ...]:
        """Devuelve rituales conectados a una planta."""

    @abstractmethod
    def listar_por_producto(self, id_producto: str) -> tuple[Ritual, ...]:
        """Devuelve rituales conectados a un producto."""

    @abstractmethod
    def listar_plantas_relacionadas(self, id_ritual: str) -> tuple[Planta, ...]:
        """Devuelve plantas conectadas a un ritual."""

    @abstractmethod
    def listar_productos_relacionados(self, id_ritual: str) -> tuple[Producto, ...]:
        """Devuelve productos conectados a un ritual."""
