"""Casos de uso puros para rituales conectados del Ciclo 2."""

from __future__ import annotations

from dataclasses import dataclass

from ..dominio.entidades import Intencion, Planta, Producto
from ..dominio.inventario import InventarioProducto
from ..dominio.rituales import Ritual
from .casos_de_uso import ErrorAplicacionLookup
from .disponibilidad_publica import resolver_disponibilidad_publica
from .dto import (
    IntencionDTO,
    PlantaResumenDTO,
    ProductoResumenDTO,
    RelacionIntencionRitualDTO,
    RitualDetalleDTO,
    RitualResumenDTO,
)
from .puertos.repositorios import RepositorioPlantas
from .puertos.repositorios_inventario import RepositorioInventario
from .puertos.repositorios_rituales import RepositorioRituales


@dataclass(slots=True)
class ObtenerListadoRitualNavegable:
    repositorio_rituales: RepositorioRituales

    def ejecutar(self) -> tuple[RitualResumenDTO, ...]:
        rituales = self.repositorio_rituales.listar_navegables()
        return tuple(_a_ritual_resumen(ritual) for ritual in rituales)


@dataclass(slots=True)
class ObtenerDetalleRitual:
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, slug_ritual: str) -> RitualDetalleDTO:
        ritual = self.repositorio_rituales.obtener_por_slug(slug_ritual)
        if ritual is None:
            raise ErrorAplicacionLookup(f"Ritual no encontrado: {slug_ritual}")
        return _a_ritual_detalle(ritual)


@dataclass(slots=True)
class ObtenerPlantasRelacionadasDeRitual:
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, slug_ritual: str) -> tuple[PlantaResumenDTO, ...]:
        ritual = _obtener_ritual_o_error(self.repositorio_rituales, slug_ritual)
        plantas = self.repositorio_rituales.listar_plantas_relacionadas(ritual.id)
        return tuple(_a_planta_resumen(planta) for planta in plantas)


@dataclass(slots=True)
class ObtenerProductosRelacionadosDeRitual:
    repositorio_rituales: RepositorioRituales
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, slug_ritual: str) -> tuple[ProductoResumenDTO, ...]:
        ritual = _obtener_ritual_o_error(self.repositorio_rituales, slug_ritual)
        productos = self.repositorio_rituales.listar_productos_relacionados(ritual.id)
        return tuple(
            _a_producto_resumen(
                producto,
                self.repositorio_inventario.obtener_por_id_producto(producto.id),
            )
            for producto in productos
        )


@dataclass(slots=True)
class ObtenerRitualesRelacionadosPorIntencion:
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, slug_intencion: str) -> RelacionIntencionRitualDTO:
        rituales = self.repositorio_rituales.listar_por_intencion(slug_intencion)
        if not rituales:
            raise ErrorAplicacionLookup(f"Intención sin rituales: {slug_intencion}")
        intencion = _resolver_intencion(rituales, slug_intencion)
        return RelacionIntencionRitualDTO(
            intencion=_a_intencion_dto(intencion),
            rituales=tuple(_a_ritual_resumen(ritual) for ritual in rituales),
        )


@dataclass(slots=True)
class ObtenerRitualesRelacionadosPorPlanta:
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, id_planta: str) -> tuple[RitualResumenDTO, ...]:
        rituales = self.repositorio_rituales.listar_por_planta(id_planta)
        return tuple(_a_ritual_resumen(ritual) for ritual in rituales)


@dataclass(slots=True)
class ObtenerRitualesRelacionadosDePlantaPorSlug:
    repositorio_plantas: RepositorioPlantas
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, slug_planta: str) -> tuple[RitualResumenDTO, ...]:
        planta = self.repositorio_plantas.obtener_por_slug(slug_planta)
        if planta is None:
            raise ErrorAplicacionLookup(f"Planta no encontrada: {slug_planta}")
        rituales = self.repositorio_rituales.listar_por_planta(planta.id)
        return tuple(_a_ritual_resumen(ritual) for ritual in rituales)


@dataclass(slots=True)
class ObtenerRitualesRelacionadosPorProducto:
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, id_producto: str) -> tuple[RitualResumenDTO, ...]:
        rituales = self.repositorio_rituales.listar_por_producto(id_producto)
        return tuple(_a_ritual_resumen(ritual) for ritual in rituales)


def _obtener_ritual_o_error(
    repositorio_rituales: RepositorioRituales,
    slug_ritual: str,
) -> Ritual:
    ritual = repositorio_rituales.obtener_por_slug(slug_ritual)
    if ritual is None:
        raise ErrorAplicacionLookup(f"Ritual no encontrado: {slug_ritual}")
    return ritual


def _resolver_intencion(rituales: tuple[Ritual, ...], slug_intencion: str) -> Intencion:
    for ritual in rituales:
        for intencion in ritual.intenciones:
            if intencion.slug == slug_intencion:
                return intencion
    raise ErrorAplicacionLookup(f"Intención no encontrada: {slug_intencion}")


def _a_ritual_resumen(ritual: Ritual) -> RitualResumenDTO:
    return RitualResumenDTO(
        slug=ritual.slug,
        nombre=ritual.nombre,
        contexto_breve=ritual.contexto_breve,
        intenciones=tuple(_a_intencion_dto(item) for item in ritual.intenciones),
    )


def _a_ritual_detalle(ritual: Ritual) -> RitualDetalleDTO:
    return RitualDetalleDTO(
        slug=ritual.slug,
        nombre=ritual.nombre,
        contexto_breve=ritual.contexto_breve,
        intenciones=tuple(_a_intencion_dto(item) for item in ritual.intenciones),
        ids_plantas_relacionadas=ritual.ids_plantas_relacionadas,
        ids_productos_relacionados=ritual.ids_productos_relacionados,
    )


def _a_planta_resumen(planta: Planta) -> PlantaResumenDTO:
    return PlantaResumenDTO(
        slug=planta.slug,
        nombre=planta.nombre,
        descripcion_breve=planta.descripcion_breve,
        intenciones=tuple(_a_intencion_dto(item) for item in planta.intenciones),
    )


def _a_producto_resumen(producto: Producto, inventario: InventarioProducto | None) -> ProductoResumenDTO:
    disponibilidad = resolver_disponibilidad_publica(inventario)
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
        unidad_comercial=producto.unidad_comercial,
        incremento_minimo_venta=producto.incremento_minimo_venta,
        cantidad_minima_compra=producto.cantidad_minima_compra,
        tipo_fiscal=producto.tipo_fiscal,
        disponible=disponibilidad.disponible,
        estado_disponibilidad=disponibilidad.estado_disponibilidad,
        disponible_compra=disponibilidad.disponible,
        cantidad_disponible=disponibilidad.cantidad_disponible,
        mensaje_disponibilidad=disponibilidad.mensaje_disponibilidad,
    )


def _a_intencion_dto(intencion: Intencion) -> IntencionDTO:
    return IntencionDTO(slug=intencion.slug, nombre=intencion.nombre)
