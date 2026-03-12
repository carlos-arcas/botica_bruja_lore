"""Serializadores HTTP para DTOs del núcleo herbal público."""

from ...aplicacion.dto import (
    ConsultaCalendarioRitualDTO,
    IntencionDTO,
    PlantaDetalleDTO,
    PlantaResumenDTO,
    ProductoResumenDTO,
    RelacionIntencionHerbalDTO,
    RelacionIntencionRitualDTO,
    RitualDetalleDTO,
    RitualCalendarioDTO,
    RitualResumenDTO,
)


def serializar_planta_resumen(dto: PlantaResumenDTO) -> dict:
    return {
        "slug": dto.slug,
        "nombre": dto.nombre,
        "descripcion_breve": dto.descripcion_breve,
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
        "seccion_publica": dto.seccion_publica,
        "descripcion_corta": dto.descripcion_corta,
        "precio_visible": dto.precio_visible,
        "imagen_url": dto.imagen_url,
    }


def serializar_relacion_intencion(dto: RelacionIntencionHerbalDTO) -> dict:
    return {
        "intencion": serializar_intencion(dto.intencion),
        "plantas": [serializar_planta_resumen(item) for item in dto.plantas],
    }


def serializar_ritual_resumen(dto: RitualResumenDTO) -> dict:
    return {
        "slug": dto.slug,
        "nombre": dto.nombre,
        "contexto_breve": dto.contexto_breve,
        "intenciones": [serializar_intencion(item) for item in dto.intenciones],
    }


def serializar_ritual_detalle(dto: RitualDetalleDTO) -> dict:
    return {
        "slug": dto.slug,
        "nombre": dto.nombre,
        "contexto_breve": dto.contexto_breve,
        "intenciones": [serializar_intencion(item) for item in dto.intenciones],
        "ids_plantas_relacionadas": list(dto.ids_plantas_relacionadas),
        "ids_productos_relacionados": list(dto.ids_productos_relacionados),
    }


def serializar_relacion_intencion_ritual(dto: RelacionIntencionRitualDTO) -> dict:
    return {
        "intencion": serializar_intencion(dto.intencion),
        "rituales": [serializar_ritual_resumen(item) for item in dto.rituales],
    }


def serializar_intencion(dto: IntencionDTO) -> dict:
    return {"slug": dto.slug, "nombre": dto.nombre}


def serializar_consulta_calendario_ritual(dto: ConsultaCalendarioRitualDTO) -> dict:
    return {
        "fecha_consulta": dto.fecha_consulta,
        "rituales": [serializar_ritual_calendario(item) for item in dto.rituales],
    }


def serializar_ritual_calendario(dto: RitualCalendarioDTO) -> dict:
    return {
        "slug": dto.slug,
        "nombre": dto.nombre,
        "contexto_breve": dto.contexto_breve,
        "nombre_regla": dto.nombre_regla,
        "prioridad": dto.prioridad,
    }
