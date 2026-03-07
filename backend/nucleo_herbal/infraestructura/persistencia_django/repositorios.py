"""Repositorios concretos Django para el núcleo herbal."""

from ...aplicacion.puertos.repositorios import RepositorioPlantas, RepositorioProductos
from ...dominio.entidades import Planta, Producto, TIPO_PRODUCTO_HERBAL
from .mapeadores import a_planta, a_producto
from .models import PlantaModelo, ProductoModelo


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
