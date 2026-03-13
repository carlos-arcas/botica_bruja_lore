"""Esquemas de columnas y ayuda para importación masiva."""

from dataclasses import dataclass


@dataclass(frozen=True)
class EsquemaEntidad:
    columnas_obligatorias: tuple[str, ...]
    columnas_opcionales: tuple[str, ...]
    ejemplo: dict[str, str]
    regla_relaciones: str = ""

    @property
    def todas_columnas(self) -> tuple[str, ...]:
        return self.columnas_obligatorias + self.columnas_opcionales


ESQUEMAS_IMPORTACION: dict[str, EsquemaEntidad] = {
    "productos": EsquemaEntidad(
        columnas_obligatorias=(
            "sku",
            "nombre",
            "tipo_producto",
            "categoria_comercial",
            "seccion_publica",
            "descripcion_corta",
            "precio_visible",
            "publicado",
        ),
        columnas_opcionales=("imagen_url", "imagen_ref", "orden_publicacion"),
        ejemplo={
            "sku": "SKU-MELISA-50G",
            "slug": "melisa-a-granel-50g",
            "nombre": "Melisa a granel 50g",
            "publicado": "true",
            "imagen_ref": "melisa.jpg",
        },
    ),
    "rituales": EsquemaEntidad(
        columnas_obligatorias=("nombre", "contexto_breve", "contenido", "publicado"),
        columnas_opcionales=(
            "imagen_url",
            "imagen_ref",
            "seccion_publica",
            "orden_publicacion",
            "intenciones_relacionadas",
            "productos_relacionados",
        ),
        ejemplo={
            "slug": "ritual-luna-creciente",
            "nombre": "Ritual luna creciente",
            "publicado": "true",
            "intenciones_relacionadas": "amor-propio,claridad",
            "productos_relacionados": "vela-azul,incienso-ruda",
        },
        regla_relaciones="intenciones_relacionadas y productos_relacionados aceptan slugs separados por coma.",
    ),
    "articulos_editoriales": EsquemaEntidad(
        columnas_obligatorias=("titulo", "resumen", "contenido", "publicado", "indexable"),
        columnas_opcionales=("tema", "hub", "subhub", "seccion_publica", "imagen_url", "imagen_ref"),
        ejemplo={
            "slug": "guia-melisa-rituales",
            "titulo": "Guía de melisa para rituales",
            "publicado": "true",
            "indexable": "true",
        },
    ),
    "secciones_publicas": EsquemaEntidad(
        columnas_obligatorias=("nombre", "publicada"),
        columnas_opcionales=("descripcion", "orden"),
        ejemplo={"slug": "rituales", "nombre": "Rituales", "publicada": "true"},
    ),
}


def detectar_entidad_por_columnas(columnas: set[str]) -> str | None:
    for entidad, esquema in ESQUEMAS_IMPORTACION.items():
        if set(esquema.columnas_obligatorias).issubset(columnas):
            return entidad
    return None
