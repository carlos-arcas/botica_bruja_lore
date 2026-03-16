"""Entidades puras del dominio herbal."""

from __future__ import annotations

from dataclasses import dataclass

from .excepciones import ErrorDominio

TIPOS_PRODUCTO_VALIDOS = {
    "hierbas-a-granel",
    "inciensos-y-sahumerios",
    "herramientas-rituales",
    "tarot-y-oraculos",
    "minerales-y-piedras",
    "packs-y-cestas",
}
TIPO_PRODUCTO_HERBAL = "hierbas-a-granel"


@dataclass(frozen=True, slots=True)
class Intencion:
    """Eje de descubrimiento editorial, no categoría comercial."""

    id: str
    slug: str
    nombre: str
    descripcion: str

    def __post_init__(self) -> None:
        if not self.slug.strip():
            raise ErrorDominio("La intención requiere slug.")
        if not self.nombre.strip():
            raise ErrorDominio("La intención requiere nombre.")


@dataclass(frozen=True, slots=True)
class Planta:
    """Entidad editorial herbácea desacoplada del plano comercial."""

    id: str
    slug: str
    nombre: str
    descripcion_breve: str
    intenciones: tuple[Intencion, ...]

    def __post_init__(self) -> None:
        if not self.slug.strip():
            raise ErrorDominio("La planta requiere slug.")
        if not self.nombre.strip():
            raise ErrorDominio("La planta requiere nombre.")
        _validar_intenciones_unicas(self.intenciones)


@dataclass(frozen=True, slots=True)
class Producto:
    """Entidad comercial separada de Planta por decisión de dominio."""

    id: str
    sku: str
    slug: str
    nombre: str
    tipo_producto: str
    categoria_comercial: str
    planta_id: str | None
    seccion_publica: str = "catalogo-general"
    descripcion_corta: str = ""
    precio_visible: str = ""
    imagen_url: str = ""
    beneficio_principal: str = ""
    beneficios_secundarios: tuple[str, ...] = ()
    formato_comercial: str = ""
    modo_uso: str = ""
    categoria_visible: str = ""

    def __post_init__(self) -> None:
        if not self.sku.strip():
            raise ErrorDominio("El producto requiere SKU.")
        if not self.slug.strip():
            raise ErrorDominio("El producto requiere slug.")
        if not self.nombre.strip():
            raise ErrorDominio("El producto requiere nombre.")
        if self.tipo_producto not in TIPOS_PRODUCTO_VALIDOS:
            raise ErrorDominio("El producto requiere un tipo de producto válido.")
        if not self.categoria_comercial.strip():
            raise ErrorDominio("El producto requiere categoría comercial.")
        if not self.seccion_publica.strip():
            raise ErrorDominio("El producto requiere sección pública.")
        if self.tipo_producto == TIPO_PRODUCTO_HERBAL and not _hay_texto(self.planta_id):
            raise ErrorDominio(
                "Un producto de tipo hierbas-a-granel debe vincularse a una planta."
            )



def _validar_intenciones_unicas(intenciones: tuple[Intencion, ...]) -> None:
    slugs = [intencion.slug for intencion in intenciones]
    if len(slugs) != len(set(slugs)):
        raise ErrorDominio("Una planta no puede repetir intenciones.")



def _hay_texto(valor: str | None) -> bool:
    if valor is None:
        return False
    return bool(valor.strip())
