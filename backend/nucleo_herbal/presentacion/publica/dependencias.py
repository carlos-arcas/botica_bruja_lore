"""Cableado de dependencias de aplicación para la API pública."""

from dataclasses import dataclass

from ...aplicacion.casos_de_uso import (
    ObtenerDetallePlanta,
    ObtenerListadoHerbalNavegable,
    ObtenerRelacionesHerbalesPorIntencion,
    ObtenerResolucionComercialMinimaDePlanta,
)
from ...infraestructura.persistencia_django.repositorios import (
    RepositorioPlantasORM,
    RepositorioProductosORM,
)


@dataclass(frozen=True, slots=True)
class ServiciosPublicosHerbales:
    listado_herbal: ObtenerListadoHerbalNavegable
    detalle_planta: ObtenerDetallePlanta
    resolucion_comercial: ObtenerResolucionComercialMinimaDePlanta
    relaciones_por_intencion: ObtenerRelacionesHerbalesPorIntencion


def construir_servicios_publicos_herbales() -> ServiciosPublicosHerbales:
    repositorio_plantas = RepositorioPlantasORM()
    repositorio_productos = RepositorioProductosORM()
    return ServiciosPublicosHerbales(
        listado_herbal=ObtenerListadoHerbalNavegable(repositorio_plantas),
        detalle_planta=ObtenerDetallePlanta(repositorio_plantas),
        resolucion_comercial=ObtenerResolucionComercialMinimaDePlanta(
            repositorio_plantas,
            repositorio_productos,
        ),
        relaciones_por_intencion=ObtenerRelacionesHerbalesPorIntencion(repositorio_plantas),
    )
