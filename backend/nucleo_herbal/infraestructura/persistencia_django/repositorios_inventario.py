"""Repositorios Django para inventario operativo real v1."""

from __future__ import annotations

from django.db import IntegrityError, models, transaction

from ...aplicacion.puertos.repositorios_inventario import RepositorioInventario
from ...aplicacion.puertos.repositorios_movimientos_inventario import RepositorioMovimientosInventario
from ...dominio.excepciones import ErrorDominio
from ...dominio.inventario import InventarioProducto
from ...dominio.inventario_movimientos import MovimientoInventario
from .mapeadores_inventario import a_datos_inventario, a_datos_movimiento, a_inventario, a_movimiento
from .models_inventario import InventarioProductoModelo, MovimientoInventarioModelo


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

    def obtener_para_actualizar_por_ids_producto(self, ids_producto: tuple[str, ...]) -> tuple[InventarioProducto, ...]:
        if not ids_producto:
            return ()
        queryset = self._base_queryset().select_for_update().filter(producto_id__in=ids_producto)
        return tuple(a_inventario(modelo) for modelo in queryset)

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


class RepositorioMovimientosInventarioORM(RepositorioMovimientosInventario):
    @transaction.atomic
    def registrar(self, movimiento: MovimientoInventario) -> None:
        inventario = InventarioProductoModelo.objects.filter(producto_id=movimiento.id_producto).first()
        if inventario is None:
            raise ErrorDominio("No existe inventario previo para registrar el movimiento.")
        try:
            MovimientoInventarioModelo.objects.create(
                inventario=inventario,
                **a_datos_movimiento(movimiento),
            )
        except IntegrityError as error:
            if movimiento.operation_id:
                return
            raise ErrorDominio("No fue posible registrar el movimiento de inventario.") from error

    def listar_por_producto(self, id_producto: str, *, limite: int = 10) -> tuple[MovimientoInventario, ...]:
        if limite <= 0:
            return ()
        queryset = (
            MovimientoInventarioModelo.objects.select_related("inventario")
            .filter(inventario__producto_id=id_producto)
            .order_by("-fecha_creacion", "-id")[:limite]
        )
        return tuple(a_movimiento(modelo) for modelo in queryset)
