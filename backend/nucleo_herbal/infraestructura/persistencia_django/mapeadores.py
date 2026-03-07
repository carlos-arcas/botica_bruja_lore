"""Mapeadores de ORM Django a entidades de dominio."""

from ...dominio.entidades import Intencion, Planta, Producto
from .models import IntencionModelo, PlantaModelo, ProductoModelo


def a_intencion(modelo: IntencionModelo) -> Intencion:
    return Intencion(
        id=modelo.id,
        slug=modelo.slug,
        nombre=modelo.nombre,
        descripcion=modelo.descripcion,
    )


def a_planta(modelo: PlantaModelo) -> Planta:
    intenciones = tuple(
        a_intencion(item)
        for item in modelo.intenciones.filter(es_publica=True).order_by("nombre")
    )
    return Planta(
        id=modelo.id,
        slug=modelo.slug,
        nombre=modelo.nombre,
        descripcion_breve=modelo.descripcion_breve,
        intenciones=intenciones,
    )


def a_producto(modelo: ProductoModelo) -> Producto:
    return Producto(
        id=modelo.id,
        sku=modelo.sku,
        slug=modelo.slug,
        nombre=modelo.nombre,
        tipo_producto=modelo.tipo_producto,
        categoria_comercial=modelo.categoria_comercial,
        planta_id=modelo.planta_id,
    )
