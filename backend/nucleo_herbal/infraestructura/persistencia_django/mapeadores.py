"""Mapeadores de ORM Django a entidades de dominio."""

from ...dominio.entidades import Intencion, Planta, Producto
from ...dominio.pedidos_demo import LineaPedido, PedidoDemo
from ...dominio.rituales import Ritual
from .models import (
    IntencionModelo,
    LineaPedidoModelo,
    PedidoDemoModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
)


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


def a_pedido_demo(modelo: PedidoDemoModelo) -> PedidoDemo:
    lineas = tuple(a_linea_pedido(linea) for linea in modelo.lineas.order_by("id"))
    return PedidoDemo(
        id_pedido=modelo.id_pedido,
        email_contacto=modelo.email_contacto,
        canal_compra=modelo.canal_compra,
        lineas=lineas,
        estado=modelo.estado,
        fecha_creacion=modelo.fecha_creacion,
        id_usuario=modelo.id_usuario,
    )


def a_linea_pedido(modelo: LineaPedidoModelo) -> LineaPedido:
    return LineaPedido(
        id_producto=modelo.id_producto,
        slug_producto=modelo.slug_producto,
        nombre_producto=modelo.nombre_producto,
        cantidad=modelo.cantidad,
        precio_unitario_demo=modelo.precio_unitario_demo,
    )


def a_datos_linea_pedido(linea: LineaPedido) -> dict[str, object]:
    return {
        "id_producto": linea.id_producto,
        "slug_producto": linea.slug_producto,
        "nombre_producto": linea.nombre_producto,
        "cantidad": linea.cantidad,
        "precio_unitario_demo": linea.precio_unitario_demo,
    }
