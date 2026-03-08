"""Repositorios concretos Django para el núcleo herbal."""

from ...aplicacion.puertos.repositorios import RepositorioPlantas, RepositorioProductos
from ...aplicacion.puertos.repositorios_rituales import RepositorioRituales
from ...dominio.entidades import Planta, Producto, TIPO_PRODUCTO_HERBAL
from ...dominio.rituales import Ritual
from .mapeadores import a_planta, a_producto, a_ritual
from .models import PlantaModelo, ProductoModelo, RitualModelo


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
