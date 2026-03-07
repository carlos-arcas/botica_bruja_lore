"""Serializadores HTTP para DTOs del núcleo herbal público."""

from ...aplicacion.dto import (
    IntencionDTO,
    PlantaDetalleDTO,
    PlantaResumenDTO,
    ProductoResumenDTO,
    RelacionIntencionHerbalDTO,
)


def serializar_planta_resumen(dto: PlantaResumenDTO) -> dict:
    return {
        "slug": dto.slug,
        "nombre": dto.nombre,
        "intenciones": [serializar_intencion(item) for item in dto.intenciones],
    }


def serializar_planta_detalle(dto: PlantaDetalleDTO) -> dict:
    return {
        "slug": dto.slug,
        "nombre": dto.nombre,
        "descripcion_breve": dto.descripcion_breve,
        "intenciones": [serializar_intencion(item) for item in dto.intenciones],
    }


def serializar_producto_resumen(dto: ProductoResumenDTO) -> dict:
    return {
        "sku": dto.sku,
        "slug": dto.slug,
        "nombre": dto.nombre,
        "tipo_producto": dto.tipo_producto,
        "categoria_comercial": dto.categoria_comercial,
    }


def serializar_relacion_intencion(dto: RelacionIntencionHerbalDTO) -> dict:
    return {
        "intencion": serializar_intencion(dto.intencion),
        "plantas": [serializar_planta_resumen(item) for item in dto.plantas],
    }


def serializar_intencion(dto: IntencionDTO) -> dict:
    return {"slug": dto.slug, "nombre": dto.nombre}
