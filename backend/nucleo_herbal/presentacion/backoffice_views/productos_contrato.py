from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from backend.nucleo_herbal.infraestructura.persistencia_django.catalogo_botica import (
    BENEFICIOS_BOTICA,
    CATEGORIAS_VISIBLES_BOTICA,
    FORMATOS_BOTICA,
    MODOS_USO_BOTICA,
    opciones_a_valores,
    parsear_precio_numerico,
)


TIPOS_PRODUCTO_CANONICOS = {
    "hierbas-a-granel",
    "inciensos-y-sahumerios",
    "herramientas-rituales",
    "tarot-y-oraculos",
    "minerales-y-piedras",
    "packs-y-cestas",
}

MAPEO_TIPO_LEGACY_BOTICA = {
    "a-granel-25g": "hierbas-a-granel",
    "a-granel-50g": "hierbas-a-granel",
    "a-granel-100g": "hierbas-a-granel",
    "atado": "hierbas-a-granel",
    "bolsita-ritual": "inciensos-y-sahumerios",
    "personalizado": "herramientas-rituales",
}

VALORES_BENEFICIO = opciones_a_valores(BENEFICIOS_BOTICA)
VALORES_FORMATO = opciones_a_valores(FORMATOS_BOTICA)
VALORES_MODO_USO = opciones_a_valores(MODOS_USO_BOTICA)
VALORES_CATEGORIA_VISIBLE = opciones_a_valores(CATEGORIAS_VISIBLES_BOTICA)

CAMPOS_CONTRATO_ENTRADA = {
    "id",
    "sku",
    "slug",
    "nombre",
    "tipo_producto",
    "categoria_comercial",
    "publicado",
    "planta_id",
    "descripcion_corta",
    "imagen_url",
    "precio_numerico",
    "precio_visible",
    "seccion_publica",
    "orden_publicacion",
    "beneficio_principal",
    "beneficios_secundarios",
    "formato_comercial",
    "modo_uso",
    "categoria_visible",
    "formato_peso",
    "formato_peso_personalizado",
    "__forzar_error_respuesta__",
}


class ErrorValidacionProducto(ValueError):
    def __init__(self, detalle: str, *, errores: dict[str, str] | None = None) -> None:
        super().__init__(detalle)
        self.detalle = detalle
        self.errores = errores or {}


@dataclass(frozen=True)
class ProductoNormalizado:
    modo: str
    campos_normalizados: dict[str, object]
    campos_desconocidos: tuple[str, ...]


def _a_slug_catalogo(valor: str) -> str:
    return valor.strip().lower().replace(" ", "-")


def _normalizar_lista(valor: object) -> tuple[str, ...]:
    if isinstance(valor, list):
        items = [str(item).strip() for item in valor if str(item).strip()]
    else:
        items = [item.strip() for item in str(valor or "").split(",") if item.strip()]
    return tuple(dict.fromkeys(_a_slug_catalogo(item) for item in items if item))


def _validar_opcion(valor: object, permitidos: set[str], campo: str, defecto: str) -> str:
    limpio = _a_slug_catalogo(str(valor or ""))
    if not limpio:
        return defecto
    if limpio not in permitidos:
        raise ErrorValidacionProducto(f"{campo} inválido para Botica Natural.", errores={campo.lower(): f"Valor no permitido: {limpio}"})
    return limpio


def normalizar_tipo_producto_botica(data: dict[str, object]) -> str:
    tipo_raw = str(data.get("tipo_producto", "")).strip()
    if tipo_raw in TIPOS_PRODUCTO_CANONICOS:
        return tipo_raw
    return MAPEO_TIPO_LEGACY_BOTICA.get(tipo_raw, "herramientas-rituales")


def normalizar_categoria_botica(data: dict[str, object]) -> str:
    categoria = str(data.get("categoria_comercial", "")).strip()
    if categoria:
        return _a_slug_catalogo(categoria)
    formato = str(data.get("formato_peso", "")).strip()
    if formato == "personalizado":
        formato = str(data.get("formato_peso_personalizado", "")).strip()
    return _a_slug_catalogo(formato)


def _derivar_categoria_visible(tipo_producto: str, categoria_comercial: str) -> str:
    categoria = _a_slug_catalogo(categoria_comercial)
    if categoria in VALORES_CATEGORIA_VISIBLE:
        return categoria
    if tipo_producto == "hierbas-a-granel":
        return "hierbas"
    if tipo_producto == "inciensos-y-sahumerios":
        return "inciensos"
    return "rituales"


def _resolver_precio(data: dict[str, object]) -> tuple[Decimal | None, str]:
    crudo = data.get("precio_numerico", data.get("precio_visible", ""))
    try:
        precio_numerico = parsear_precio_numerico(str(crudo or ""))
    except ValueError as exc:
        raise ErrorValidacionProducto(str(exc), errores={"precio_numerico": str(exc)}) from exc
    if precio_numerico is None:
        return None, ""
    precio_visible = f"{precio_numerico:.2f}".replace(".", ",") + " €"
    return precio_numerico, precio_visible


def _validar_publicacion(tipo_producto: str, categoria_comercial: str, planta_id: str, publicado: bool) -> None:
    if tipo_producto not in TIPOS_PRODUCTO_CANONICOS:
        raise ErrorValidacionProducto("Tipo de producto inválido.", errores={"tipo_producto": "Valor no soportado."})
    if not categoria_comercial.strip():
        raise ErrorValidacionProducto("Categoría comercial obligatoria.", errores={"categoria_comercial": "Debes indicar una categoría comercial."})
    if tipo_producto == "hierbas-a-granel" and not planta_id:
        raise ErrorValidacionProducto(
            "Los productos de hierbas a granel requieren planta asociada para catálogo público.",
            errores={"planta_id": "Selecciona una planta asociada."},
        )
    if publicado and tipo_producto == "hierbas-a-granel" and not planta_id:
        raise ErrorValidacionProducto("No se puede publicar una hierba a granel sin planta asociada.", errores={"planta_id": "La publicación requiere planta asociada."})


def normalizar_payload_producto(data: dict[str, object]) -> ProductoNormalizado:
    nombre = str(data.get("nombre", "")).strip()
    if not nombre:
        raise ErrorValidacionProducto("Producto requiere nombre.", errores={"nombre": "El nombre es obligatorio."})
    seccion = str(data.get("seccion_publica", "")).strip()
    if seccion not in {"botica-natural", "velas-e-incienso", "minerales-y-energia", "herramientas-esotericas"}:
        raise ErrorValidacionProducto("Sección de producto inválida.", errores={"seccion_publica": "Selecciona una sección válida."})

    tipo_producto = str(data.get("tipo_producto", "")).strip()
    categoria_comercial = str(data.get("categoria_comercial", "")).strip()
    if seccion == "botica-natural":
        tipo_producto = normalizar_tipo_producto_botica(data)
        categoria_comercial = normalizar_categoria_botica(data)

    precio_numerico, precio_visible = _resolver_precio(data)
    publicado = str(data.get("publicado", "")).lower() in {"1", "true", "yes", "on"} if not isinstance(data.get("publicado"), bool) else bool(data.get("publicado"))
    beneficios_secundarios = _normalizar_lista(data.get("beneficios_secundarios", ""))
    beneficio_principal = _a_slug_catalogo(str(data.get("beneficio_principal", "")))
    formato_comercial = _a_slug_catalogo(str(data.get("formato_comercial", "")))
    modo_uso = _a_slug_catalogo(str(data.get("modo_uso", "")))
    categoria_visible = _derivar_categoria_visible(tipo_producto, categoria_comercial)

    if seccion == "botica-natural":
        beneficio_principal = _validar_opcion(data.get("beneficio_principal", ""), VALORES_BENEFICIO, "beneficio_principal", "calma")
        invalidos = [item for item in beneficios_secundarios if item not in VALORES_BENEFICIO]
        if invalidos:
            raise ErrorValidacionProducto("Beneficios secundarios inválidos para Botica Natural.", errores={"beneficios_secundarios": ", ".join(invalidos)})
        formato_comercial = _validar_opcion(data.get("formato_comercial", ""), VALORES_FORMATO, "formato_comercial", "hoja-seca")
        modo_uso = _validar_opcion(data.get("modo_uso", ""), VALORES_MODO_USO, "modo_uso", "infusion")
        categoria_visible = _derivar_categoria_visible(tipo_producto, categoria_comercial)

    planta_id = str(data.get("planta_id", "")).strip()
    _validar_publicacion(tipo_producto, categoria_comercial, planta_id, publicado)
    normalizado = {
        "nombre": nombre,
        "tipo_producto": tipo_producto,
        "categoria_comercial": categoria_comercial,
        "seccion_publica": seccion,
        "descripcion_corta": str(data.get("descripcion_corta", "")).strip(),
        "precio_numerico": precio_numerico,
        "precio_visible": precio_visible,
        "imagen_url": str(data.get("imagen_url", "")).strip(),
        "beneficio_principal": beneficio_principal,
        "beneficios_secundarios": ",".join(beneficios_secundarios),
        "formato_comercial": formato_comercial,
        "modo_uso": modo_uso,
        "categoria_visible": categoria_visible,
        "planta_id": planta_id or None,
        "publicado": publicado,
        "orden_publicacion": int(data.get("orden_publicacion", 100) or 100),
    }
    campos_desconocidos = tuple(sorted(set(data) - CAMPOS_CONTRATO_ENTRADA))
    return ProductoNormalizado(
        modo="editar" if data.get("id") else "crear",
        campos_normalizados=normalizado,
        campos_desconocidos=campos_desconocidos,
    )
