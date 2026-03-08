"""Mapeadores de ORM Django a entidades de dominio."""

from ...dominio.entidades import Intencion, Planta, Producto
from ...dominio.rituales import Ritual
from .models import IntencionModelo, PlantaModelo, ProductoModelo, RitualModelo


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


def a_ritual(modelo: RitualModelo) -> Ritual:
    intenciones = tuple(
        a_intencion(item)
        for item in modelo.intenciones.filter(es_publica=True).order_by("nombre")
    )
    ids_plantas = tuple(
        modelo.plantas_relacionadas.order_by("nombre").values_list("id", flat=True)
    )
    ids_productos = tuple(
        modelo.productos_relacionados.order_by("nombre").values_list("id", flat=True)
    )
    return Ritual(
        id=modelo.id,
        slug=modelo.slug,
        nombre=modelo.nombre,
        contexto_breve=modelo.contexto_breve,
        intenciones=intenciones,
        ids_plantas_relacionadas=ids_plantas,
        ids_productos_relacionados=ids_productos,
    )
