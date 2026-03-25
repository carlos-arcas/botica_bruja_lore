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

CAMPOS_UI_CANONICOS_PRODUCTO = {
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
    "seccion_publica",
    "orden_publicacion",
    "beneficio_principal",
    "beneficios_secundarios",
    "formato_comercial",
    "modo_uso",
    "unidad_comercial",
    "incremento_minimo_venta",
    "cantidad_minima_compra",
    "tipo_fiscal",
    "__forzar_error_respuesta__",
}
CAMPOS_LEGACY_TOLERADOS_PRODUCTO = {
    "precio_visible",
    "categoria_visible",
    "formato_peso",
    "formato_peso_personalizado",
}
CAMPOS_CONTRATO_ENTRADA = CAMPOS_UI_CANONICOS_PRODUCTO | CAMPOS_LEGACY_TOLERADOS_PRODUCTO

CAMPOS_DERIVADOS_PRODUCTO = {"precio_visible", "categoria_visible"}
CAMPOS_PERSISTIDOS_PRODUCTO = (
    "nombre",
    "tipo_producto",
    "categoria_comercial",
    "seccion_publica",
    "descripcion_corta",
    "precio_numerico",
    "precio_visible",
    "imagen_url",
    "beneficio_principal",
    "beneficios_secundarios",
    "formato_comercial",
    "modo_uso",
    "categoria_visible",
    "planta_id",
    "unidad_comercial",
    "incremento_minimo_venta",
    "cantidad_minima_compra",
    "tipo_fiscal",
    "publicado",
    "orden_publicacion",
)
UNIDADES_COMERCIALES_VALIDAS = {"ud", "g", "ml"}
TIPOS_FISCALES_VALIDOS = {"iva_general", "iva_reducido"}


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
    campos_legacy_detectados: tuple[str, ...]


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
        if publicado:
            raise ErrorValidacionProducto(
                "No se puede publicar una hierba a granel sin planta asociada.",
                errores={"planta_id": "Selecciona una planta asociada."},
            )
        raise ErrorValidacionProducto(
            "Los productos de hierbas a granel requieren planta asociada para catálogo público.",
            errores={"planta_id": "Selecciona una planta asociada."},
        )




def validar_publicacion_producto_existente(producto: object, publicar: bool) -> None:
    _validar_publicacion(
        str(getattr(producto, "tipo_producto", "") or "").strip(),
        str(getattr(producto, "categoria_comercial", "") or "").strip(),
        str(getattr(producto, "planta_id", "") or "").strip(),
        publicar,
    )

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
    unidad_comercial = _a_slug_catalogo(str(data.get("unidad_comercial", "ud") or "ud"))
    if unidad_comercial not in UNIDADES_COMERCIALES_VALIDAS:
        raise ErrorValidacionProducto(
            "Unidad comercial inválida.",
            errores={"unidad_comercial": "Selecciona una unidad comercial válida (ud, g, ml)."},
        )

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
    incremento_raw = data.get("incremento_minimo_venta", 1)
    cantidad_raw = data.get("cantidad_minima_compra", 1)
    if incremento_raw in (None, ""):
        incremento_raw = 1
    if cantidad_raw in (None, ""):
        cantidad_raw = 1
    try:
        incremento_minimo_venta = int(incremento_raw)
        cantidad_minima_compra = int(cantidad_raw)
    except (TypeError, ValueError) as exc:
        raise ErrorValidacionProducto(
            "Incremento mínimo de venta y cantidad mínima deben ser enteros.",
            errores={
                "incremento_minimo_venta": "Debe ser entero.",
                "cantidad_minima_compra": "Debe ser entero.",
            },
        ) from exc
    if incremento_minimo_venta <= 0:
        raise ErrorValidacionProducto(
            "Incremento mínimo de venta inválido.",
            errores={"incremento_minimo_venta": "Debe ser un entero mayor que cero."},
        )
    if cantidad_minima_compra <= 0:
        raise ErrorValidacionProducto(
            "Cantidad mínima de compra inválida.",
            errores={"cantidad_minima_compra": "Debe ser un entero mayor que cero."},
        )
    if cantidad_minima_compra % incremento_minimo_venta != 0:
        raise ErrorValidacionProducto(
            "Cantidad mínima de compra incompatible con incremento mínimo.",
            errores={"cantidad_minima_compra": "Debe ser múltiplo del incremento mínimo de venta."},
        )
    tipo_fiscal = _a_slug_catalogo(str(data.get("tipo_fiscal", "iva_general") or "iva_general"))
    if tipo_fiscal not in TIPOS_FISCALES_VALIDOS:
        raise ErrorValidacionProducto(
            "Tipo fiscal inválido.",
            errores={"tipo_fiscal": "Selecciona un tipo fiscal válido."},
        )
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
        "unidad_comercial": unidad_comercial,
        "incremento_minimo_venta": incremento_minimo_venta,
        "cantidad_minima_compra": cantidad_minima_compra,
        "tipo_fiscal": tipo_fiscal,
        "publicado": publicado,
        "orden_publicacion": int(data.get("orden_publicacion", 100) or 100),
    }
    claves = set(data)
    campos_desconocidos = tuple(sorted(claves - CAMPOS_CONTRATO_ENTRADA))
    campos_legacy_detectados = tuple(sorted(claves & CAMPOS_LEGACY_TOLERADOS_PRODUCTO))
    return ProductoNormalizado(
        modo="editar" if data.get("id") else "crear",
        campos_normalizados=normalizado,
        campos_desconocidos=campos_desconocidos,
        campos_legacy_detectados=campos_legacy_detectados,
    )
