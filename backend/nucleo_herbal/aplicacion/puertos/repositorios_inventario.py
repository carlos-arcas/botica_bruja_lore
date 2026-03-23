"""Puertos de persistencia para inventario operativo por producto."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.inventario import InventarioProducto


class RepositorioInventario(ABC):
    @abstractmethod
    def obtener_por_id_producto(self, id_producto: str) -> InventarioProducto | None:
        """Recupera el inventario actual de un producto vendible."""

    @abstractmethod
    def crear_inicial(self, inventario: InventarioProducto) -> InventarioProducto:
        """Crea el inventario inicial si aún no existe para el producto."""

    @abstractmethod
    def guardar(self, inventario: InventarioProducto) -> InventarioProducto:
        """Persiste el estado actual del inventario existente."""

    @abstractmethod
    def obtener_para_actualizar_por_ids_producto(self, ids_producto: tuple[str, ...]) -> tuple[InventarioProducto, ...]:
        """Recupera y bloquea inventarios por producto para un ajuste atómico."""

    @abstractmethod
    def listar_operativo(self, *, solo_bajo_stock: bool = False) -> tuple[InventarioProducto, ...]:
        """Lista inventario para operación interna mínima."""
