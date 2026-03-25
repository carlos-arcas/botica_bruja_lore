"""Repositorio ORM para semántica comercial mínima usada por checkout real."""

from __future__ import annotations

from ...aplicacion.puertos.repositorios_productos_checkout import (
    RepositorioProductosCheckout,
    SemanticaComercialProducto,
)
from ...dominio.entidades import TIPOS_IMPOSITIVOS_POR_TIPO_FISCAL
from .models import ProductoModelo


class RepositorioProductosCheckoutORM(RepositorioProductosCheckout):
    def obtener_semantica_comercial_por_id(
        self, id_producto: str
    ) -> SemanticaComercialProducto | None:
        modelo = (
            ProductoModelo.objects.filter(id=id_producto)
            .only(
                "id",
                "unidad_comercial",
                "incremento_minimo_venta",
                "cantidad_minima_compra",
                "tipo_fiscal",
            )
            .first()
        )
        if modelo is None:
            return None
        return SemanticaComercialProducto(
            id_producto=modelo.id,
            unidad_comercial=modelo.unidad_comercial,
            incremento_minimo_venta=modelo.incremento_minimo_venta,
            cantidad_minima_compra=modelo.cantidad_minima_compra,
            tipo_fiscal=modelo.tipo_fiscal,
            tipo_impositivo=TIPOS_IMPOSITIVOS_POR_TIPO_FISCAL[modelo.tipo_fiscal],
        )
