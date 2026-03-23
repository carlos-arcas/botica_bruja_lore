"""Casos de uso puros del Ciclo 1 para núcleo herbal."""

from __future__ import annotations

from dataclasses import dataclass

from ..dominio.entidades import Intencion, Planta, Producto
from ..dominio.inventario import InventarioProducto
from .dto import (
    IntencionDTO,
    PlantaDetalleDTO,
    PlantaResumenDTO,
    ProductoResumenDTO,
    RelacionIntencionHerbalDTO,
)
from .puertos.repositorios import RepositorioPlantas, RepositorioProductos
from .puertos.repositorios_inventario import RepositorioInventario


class ErrorAplicacionLookup(LookupError):
    """Error de lookup para recursos no encontrados en aplicación."""


@dataclass(slots=True)
class ObtenerListadoHerbalNavegable:
    repositorio_plantas: RepositorioPlantas

    def ejecutar(self) -> tuple[PlantaResumenDTO, ...]:
        plantas = self.repositorio_plantas.listar_navegables()
        return tuple(_a_planta_resumen(planta) for planta in plantas)


@dataclass(slots=True)
class ObtenerDetallePlanta:
    repositorio_plantas: RepositorioPlantas

    def ejecutar(self, slug_planta: str) -> PlantaDetalleDTO:
        planta = self.repositorio_plantas.obtener_por_slug(slug_planta)
        if planta is None:
            raise ErrorAplicacionLookup(f"Planta no encontrada: {slug_planta}")
        return _a_planta_detalle(planta)


@dataclass(slots=True)
class ObtenerResolucionComercialMinimaDePlanta:
    repositorio_plantas: RepositorioPlantas
    repositorio_productos: RepositorioProductos
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, slug_planta: str) -> tuple[ProductoResumenDTO, ...]:
        planta = self.repositorio_plantas.obtener_por_slug(slug_planta)
        if planta is None:
            raise ErrorAplicacionLookup(f"Planta no encontrada: {slug_planta}")
        productos = self.repositorio_productos.listar_herbales_por_planta(planta.id)
        return tuple(_a_producto_resumen(producto, self.repositorio_inventario.obtener_por_id_producto(producto.id)) for producto in productos)


@dataclass(slots=True)
class ObtenerListadoPublicoProductosPorSeccion:
    repositorio_productos: RepositorioProductos
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, slug_seccion: str, filtros: dict[str, str] | None = None) -> tuple[ProductoResumenDTO, ...]:
        productos = self.repositorio_productos.listar_publicos_por_seccion(slug_seccion, filtros or {})
        return tuple(_a_producto_resumen(producto, self.repositorio_inventario.obtener_por_id_producto(producto.id)) for producto in productos)


@dataclass(slots=True)
class ObtenerDetallePublicoProductoPorSlug:
    repositorio_productos: RepositorioProductos
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, slug_producto: str) -> ProductoResumenDTO:
        producto = self.repositorio_productos.obtener_publico_por_slug(slug_producto)
        if producto is None:
            raise ErrorAplicacionLookup(f"Producto no encontrado: {slug_producto}")
        return _a_producto_resumen(producto, self.repositorio_inventario.obtener_por_id_producto(producto.id))


@dataclass(slots=True)
class ObtenerRelacionesHerbalesPorIntencion:
    repositorio_plantas: RepositorioPlantas

    def ejecutar(self, slug_intencion: str) -> RelacionIntencionHerbalDTO:
        plantas = self.repositorio_plantas.listar_por_intencion(slug_intencion)
        if not plantas:
            raise ErrorAplicacionLookup(f"Intención sin plantas: {slug_intencion}")
        intencion = _resolver_intencion(plantas, slug_intencion)
        return RelacionIntencionHerbalDTO(
            intencion=_a_intencion_dto(intencion),
            plantas=tuple(_a_planta_resumen(planta) for planta in plantas),
        )


def _resolver_intencion(plantas: tuple[Planta, ...], slug_intencion: str) -> Intencion:
    for planta in plantas:
        for intencion in planta.intenciones:
            if intencion.slug == slug_intencion:
                return intencion
    raise ErrorAplicacionLookup(f"Intención no encontrada: {slug_intencion}")


def _a_planta_resumen(planta: Planta) -> PlantaResumenDTO:
    return PlantaResumenDTO(
        slug=planta.slug,
        nombre=planta.nombre,
        descripcion_breve=planta.descripcion_breve,
        intenciones=tuple(_a_intencion_dto(item) for item in planta.intenciones),
    )


def _a_planta_detalle(planta: Planta) -> PlantaDetalleDTO:
    return PlantaDetalleDTO(
        slug=planta.slug,
        nombre=planta.nombre,
        descripcion_breve=planta.descripcion_breve,
        intenciones=tuple(_a_intencion_dto(item) for item in planta.intenciones),
    )


def _a_producto_resumen(producto: Producto, inventario: InventarioProducto | None) -> ProductoResumenDTO:
    return ProductoResumenDTO(
        sku=producto.sku,
        slug=producto.slug,
        nombre=producto.nombre,
        tipo_producto=producto.tipo_producto,
        categoria_comercial=producto.categoria_comercial,
        seccion_publica=producto.seccion_publica,
        descripcion_corta=producto.descripcion_corta,
        precio_visible=producto.precio_visible,
        imagen_url=producto.imagen_url,
        beneficio_principal=producto.beneficio_principal,
        beneficios_secundarios=producto.beneficios_secundarios,
        formato_comercial=producto.formato_comercial,
        modo_uso=producto.modo_uso,
        categoria_visible=producto.categoria_visible,
        disponible=_es_producto_disponible(inventario),
        estado_disponibilidad=_estado_disponibilidad(inventario),
    )


def _a_intencion_dto(intencion: Intencion) -> IntencionDTO:
    return IntencionDTO(slug=intencion.slug, nombre=intencion.nombre)


def _es_producto_disponible(inventario: InventarioProducto | None) -> bool:
    return inventario is not None and inventario.cantidad_disponible > 0


def _estado_disponibilidad(inventario: InventarioProducto | None) -> str:
    if inventario is None or inventario.cantidad_disponible <= 0:
        return "no_disponible"
    if inventario.bajo_stock:
        return "bajo_stock"
    return "disponible"
