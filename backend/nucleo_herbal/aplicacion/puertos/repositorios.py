"""Puertos de repositorio para desacoplar la aplicación del almacenamiento."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.entidades import Planta, Producto


class RepositorioPlantas(ABC):
    @abstractmethod
    def listar_navegables(self) -> tuple[Planta, ...]:
        """Devuelve plantas publicables para navegación herbal."""

    @abstractmethod
    def obtener_por_slug(self, slug_planta: str) -> Planta | None:
        """Busca detalle de planta por slug."""

    @abstractmethod
    def listar_por_intencion(self, slug_intencion: str) -> tuple[Planta, ...]:
        """Devuelve plantas relacionadas a una intención."""


class RepositorioProductos(ABC):
    @abstractmethod
    def listar_herbales_por_planta(self, id_planta: str) -> tuple[Producto, ...]:
        """Devuelve resolución comercial mínima asociada a una planta."""

    @abstractmethod
    def listar_publicos_por_seccion(self, slug_seccion: str, limite: int) -> tuple[Producto, ...]:
        """Devuelve productos públicos de una sección comercial en orden estable."""

    @abstractmethod
    def obtener_publico_por_slug(self, slug_producto: str) -> Producto | None:
        """Busca un producto público por slug para ficha pública."""
