"""Repositorios Django para inventario operativo real v1."""

from __future__ import annotations

from django.db import IntegrityError, transaction, models

from ...aplicacion.puertos.repositorios_inventario import RepositorioInventario
from ...dominio.excepciones import ErrorDominio
from ...dominio.inventario import InventarioProducto
from .mapeadores_inventario import a_datos_inventario, a_inventario
from .models_inventario import InventarioProductoModelo


class RepositorioInventarioORM(RepositorioInventario):
    def obtener_por_id_producto(self, id_producto: str) -> InventarioProducto | None:
        try:
            modelo = self._base_queryset().get(producto_id=id_producto)
        except InventarioProductoModelo.DoesNotExist:
            return None
        return a_inventario(modelo)

    @transaction.atomic
    def crear_inicial(self, inventario: InventarioProducto) -> InventarioProducto:
        try:
            modelo = InventarioProductoModelo.objects.create(
                producto_id=inventario.id_producto,
                **a_datos_inventario(inventario),
            )
        except IntegrityError as error:
            raise ErrorDominio("Ya existe inventario para el producto indicado.") from error
        return a_inventario(modelo)

    @transaction.atomic
    def guardar(self, inventario: InventarioProducto) -> InventarioProducto:
        actualizados = InventarioProductoModelo.objects.filter(producto_id=inventario.id_producto).update(
            **a_datos_inventario(inventario)
        )
        if not actualizados:
            raise ErrorDominio("No existe inventario previo para el producto indicado.")
        return self._obtener_requerido(inventario.id_producto)

    def listar_operativo(self, *, solo_bajo_stock: bool = False) -> tuple[InventarioProducto, ...]:
        queryset = self._base_queryset()
        if solo_bajo_stock:
            queryset = queryset.filter(
                umbral_bajo_stock__isnull=False,
                cantidad_disponible__lte=models.F("umbral_bajo_stock"),
            )
        return tuple(a_inventario(modelo) for modelo in queryset)

    def _obtener_requerido(self, id_producto: str) -> InventarioProducto:
        inventario = self.obtener_por_id_producto(id_producto)
        if inventario is None:
            raise ErrorDominio("No existe inventario previo para el producto indicado.")
        return inventario

    def _base_queryset(self):
        return InventarioProductoModelo.objects.select_related("producto").order_by("producto__nombre")
