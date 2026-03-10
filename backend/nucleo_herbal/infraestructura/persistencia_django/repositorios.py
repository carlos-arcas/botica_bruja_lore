"""Repositorios concretos Django para el núcleo herbal."""

from django.db import transaction

from ...aplicacion.puertos.repositorios import RepositorioPlantas, RepositorioProductos
from ...aplicacion.puertos.repositorios_pedidos_demo import RepositorioPedidosDemo
from ...aplicacion.puertos.repositorios_rituales import RepositorioRituales
from ...dominio.entidades import Planta, Producto, TIPO_PRODUCTO_HERBAL
from ...dominio.pedidos_demo import PedidoDemo
from ...dominio.rituales import Ritual
from .mapeadores import a_datos_linea_pedido, a_pedido_demo, a_planta, a_producto, a_ritual
from .models import (
    LineaPedidoModelo,
    PedidoDemoModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
)


class RepositorioPlantasORM(RepositorioPlantas):
    def listar_navegables(self) -> tuple[Planta, ...]:
        queryset = PlantaModelo.objects.filter(publicada=True).prefetch_related("intenciones")
        return tuple(a_planta(planta) for planta in queryset)

    def obtener_por_slug(self, slug_planta: str) -> Planta | None:
        try:
            planta = PlantaModelo.objects.prefetch_related("intenciones").get(
                slug=slug_planta,
                publicada=True,
            )
        except PlantaModelo.DoesNotExist:
            return None
        return a_planta(planta)

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Planta, ...]:
        queryset = (
            PlantaModelo.objects.filter(
                publicada=True,
                intenciones__slug=slug_intencion,
                intenciones__es_publica=True,
            )
            .prefetch_related("intenciones")
            .distinct()
        )
        return tuple(a_planta(planta) for planta in queryset)


class RepositorioProductosORM(RepositorioProductos):
    def listar_herbales_por_planta(self, id_planta: str) -> tuple[Producto, ...]:
        queryset = ProductoModelo.objects.filter(
            publicado=True,
            tipo_producto=TIPO_PRODUCTO_HERBAL,
            planta_id=id_planta,
        )
        return tuple(a_producto(producto) for producto in queryset)


class RepositorioRitualesORM(RepositorioRituales):
    def listar_navegables(self) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(publicado=True)
        return tuple(a_ritual(ritual) for ritual in queryset)

    def obtener_por_slug(self, slug_ritual: str) -> Ritual | None:
        try:
            ritual = self._base_queryset().get(slug=slug_ritual, publicado=True)
        except RitualModelo.DoesNotExist:
            return None
        return a_ritual(ritual)

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(
            publicado=True,
            intenciones__slug=slug_intencion,
            intenciones__es_publica=True,
        )
        return tuple(a_ritual(ritual) for ritual in queryset.distinct())

    def listar_por_planta(self, id_planta: str) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(
            publicado=True,
            plantas_relacionadas__id=id_planta,
            plantas_relacionadas__publicada=True,
        )
        return tuple(a_ritual(ritual) for ritual in queryset.distinct())

    def listar_por_producto(self, id_producto: str) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(
            publicado=True,
            productos_relacionados__id=id_producto,
            productos_relacionados__publicado=True,
        )
        return tuple(a_ritual(ritual) for ritual in queryset.distinct())

    def listar_plantas_relacionadas(self, id_ritual: str) -> tuple[Planta, ...]:
        queryset = PlantaModelo.objects.filter(
            publicada=True,
            rituales__id=id_ritual,
            rituales__publicado=True,
        ).prefetch_related("intenciones")
        return tuple(a_planta(planta) for planta in queryset.distinct())

    def listar_productos_relacionados(self, id_ritual: str) -> tuple[Producto, ...]:
        queryset = ProductoModelo.objects.filter(
            publicado=True,
            rituales__id=id_ritual,
            rituales__publicado=True,
        )
        return tuple(a_producto(producto) for producto in queryset.distinct())

    def _base_queryset(self):
        return RitualModelo.objects.prefetch_related(
            "intenciones",
            "plantas_relacionadas",
            "productos_relacionados",
        )


class RepositorioPedidosDemoORM(RepositorioPedidosDemo):
    @transaction.atomic
    def guardar(self, pedido: PedidoDemo) -> PedidoDemo:
        modelo, _ = PedidoDemoModelo.objects.update_or_create(
            id_pedido=pedido.id_pedido,
            defaults={
                "email_contacto": pedido.email_contacto,
                "canal_compra": pedido.canal_compra,
                "estado": pedido.estado,
                "fecha_creacion": pedido.fecha_creacion,
                "id_usuario": pedido.id_usuario,
            },
        )
        modelo.lineas.all().delete()
        LineaPedidoModelo.objects.bulk_create(
            [
                LineaPedidoModelo(pedido=modelo, **a_datos_linea_pedido(linea))
                for linea in pedido.lineas
            ]
        )
        return self._reconstruir(modelo.id_pedido)

    def obtener_por_id(self, id_pedido: str) -> PedidoDemo | None:
        try:
            modelo = self._base_queryset().get(id_pedido=id_pedido)
        except PedidoDemoModelo.DoesNotExist:
            return None
        return a_pedido_demo(modelo)

    @transaction.atomic
    def actualizar_estado(self, id_pedido: str, estado: str) -> PedidoDemo | None:
        actualizados = PedidoDemoModelo.objects.filter(id_pedido=id_pedido).update(estado=estado)
        if not actualizados:
            return None
        return self._reconstruir(id_pedido)

    def _reconstruir(self, id_pedido: str) -> PedidoDemo:
        return a_pedido_demo(self._base_queryset().get(id_pedido=id_pedido))

    def _base_queryset(self):
        return PedidoDemoModelo.objects.prefetch_related("lineas")
