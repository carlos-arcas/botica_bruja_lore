"""Cableado de dependencias de aplicación para la API pública."""

from dataclasses import dataclass

from ...aplicacion.casos_de_uso import (
    ObtenerDetallePlanta,
    ObtenerListadoHerbalNavegable,
    ObtenerRelacionesHerbalesPorIntencion,
    ObtenerResolucionComercialMinimaDePlanta,
)
from ...aplicacion.casos_de_uso_rituales import (
    ObtenerDetalleRitual,
    ObtenerListadoRitualNavegable,
    ObtenerPlantasRelacionadasDeRitual,
    ObtenerProductosRelacionadosDeRitual,
    ObtenerRitualesRelacionadosDePlantaPorSlug,
    ObtenerRitualesRelacionadosPorIntencion,
)
from ...infraestructura.persistencia_django.repositorios import (
    RepositorioPlantasORM,
    RepositorioProductosORM,
    RepositorioRitualesORM,
)


@dataclass(frozen=True, slots=True)
class ServiciosPublicosHerbales:
    listado_herbal: ObtenerListadoHerbalNavegable
    detalle_planta: ObtenerDetallePlanta
    resolucion_comercial: ObtenerResolucionComercialMinimaDePlanta
    relaciones_por_intencion: ObtenerRelacionesHerbalesPorIntencion
    rituales_por_planta: ObtenerRitualesRelacionadosDePlantaPorSlug


@dataclass(frozen=True, slots=True)
class ServiciosPublicosRituales:
    listado_ritual: ObtenerListadoRitualNavegable
    detalle_ritual: ObtenerDetalleRitual
    plantas_por_ritual: ObtenerPlantasRelacionadasDeRitual
    productos_por_ritual: ObtenerProductosRelacionadosDeRitual
    rituales_por_intencion: ObtenerRitualesRelacionadosPorIntencion


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
        rituales_por_planta=ObtenerRitualesRelacionadosDePlantaPorSlug(
            repositorio_plantas,
            RepositorioRitualesORM(),
        ),
    )


def construir_servicios_publicos_rituales() -> ServiciosPublicosRituales:
    repositorio_rituales = RepositorioRitualesORM()
    return ServiciosPublicosRituales(
        listado_ritual=ObtenerListadoRitualNavegable(repositorio_rituales),
        detalle_ritual=ObtenerDetalleRitual(repositorio_rituales),
        plantas_por_ritual=ObtenerPlantasRelacionadasDeRitual(repositorio_rituales),
        productos_por_ritual=ObtenerProductosRelacionadosDeRitual(repositorio_rituales),
        rituales_por_intencion=ObtenerRitualesRelacionadosPorIntencion(repositorio_rituales),
    )
