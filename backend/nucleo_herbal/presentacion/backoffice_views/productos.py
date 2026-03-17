from __future__ import annotations

import logging

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.catalogo_botica import (
    BENEFICIOS_BOTICA,
    CATEGORIAS_VISIBLES_BOTICA,
    FORMATOS_BOTICA,
    MODOS_USO_BOTICA,
    opciones_a_valores,
    parsear_precio_numerico,
)
from backend.nucleo_herbal.infraestructura.persistencia_django.models import PlantaModelo, ProductoModelo

from .auth import usuario_staff
from .identificadores import generar_id_si_falta, generar_slug_unico
from .shared import json_no_autorizado, json_payload, to_bool, to_int

LOGGER = logging.getLogger(__name__)


SECCIONES_PRODUCTOS = {
    "botica-natural": "Botica Natural",
    "velas-e-incienso": "Velas e Incienso",
    "minerales-y-energia": "Minerales y Energía",
    "herramientas-esotericas": "Herramientas Esotéricas",
}



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


def _validar_valor_catalogo(valor: str, permitidos: set[str], etiqueta: str, valor_defecto: str) -> str:
    limpio = _a_slug_catalogo(valor)
    if not limpio:
        return valor_defecto
    if limpio not in permitidos:
        raise ValueError(f"{etiqueta} inválido para Botica Natural.")
    return limpio


def _normalizar_beneficios_secundarios(valor: str) -> str:
    slugs = [item for item in _normalizar_lista_slugs(valor).split(",") if item]
    invalidos = [item for item in slugs if item not in VALORES_BENEFICIO]
    if invalidos:
        raise ValueError("Beneficios secundarios inválidos para Botica Natural.")
    return ",".join(dict.fromkeys(slugs))


def normalizar_tipo_producto_botica(data: dict) -> str:
    tipo_raw = str(data.get("tipo_producto", "")).strip()
    if tipo_raw in TIPOS_PRODUCTO_CANONICOS:
        return tipo_raw
    return MAPEO_TIPO_LEGACY_BOTICA.get(tipo_raw, "herramientas-rituales")


def normalizar_categoria_botica(data: dict) -> str:
    categoria = str(data.get("categoria_comercial", "")).strip()
    if categoria:
        return categoria
    formato = str(data.get("formato_peso", "")).strip()
    if formato == "personalizado":
        formato = str(data.get("formato_peso_personalizado", "")).strip()
    return formato





def _validar_publicacion_catalogo(*, tipo_producto: str, categoria_comercial: str, planta_id: str, publicado: bool) -> None:
    if tipo_producto not in TIPOS_PRODUCTO_CANONICOS:
        raise ValueError("Tipo de producto inválido.")
    if not categoria_comercial.strip():
        raise ValueError("Categoría comercial obligatoria.")
    if tipo_producto == "hierbas-a-granel" and not planta_id:
        raise ValueError("Los productos de hierbas a granel requieren planta asociada para catálogo público.")
    if publicado and tipo_producto == "hierbas-a-granel" and not planta_id:
        raise ValueError("No se puede publicar una hierba a granel sin planta asociada.")

def _a_slug_catalogo(valor: str) -> str:
    return valor.strip().lower().replace(" ", "-")


def _normalizar_lista_slugs(valor: str) -> str:
    partes = [item.strip() for item in valor.split(",") if item.strip()]
    return ",".join(_a_slug_catalogo(item) for item in partes)

def _generar_sku_unico(sku_base: str, existente_id: str | None = None) -> str:
    sku_limpio = sku_base.strip().upper()[:40] or "SKU-PRODUCTO"
    usados = set(ProductoModelo.objects.exclude(id=existente_id).filter(sku__startswith=sku_limpio).values_list("sku", flat=True))
    if sku_limpio not in usados:
        return sku_limpio
    for indice in range(2, 1000):
        sufijo = f"-{indice}"
        candidato = f"{sku_limpio[: 40 - len(sufijo)]}{sufijo}"
        if candidato not in usados:
            return candidato
    raise ValueError("No se pudo generar SKU único para el producto.")


def producto_dict(obj: ProductoModelo) -> dict:
    return {
        "id": obj.id,
        "sku": obj.sku,
        "slug": obj.slug,
        "nombre": obj.nombre,
        "tipo_producto": obj.tipo_producto,
        "categoria_comercial": obj.categoria_comercial,
        "seccion_publica": obj.seccion_publica,
        "descripcion_corta": obj.descripcion_corta,
        "precio_visible": obj.precio_visible,
        "precio_numerico": str(obj.precio_numerico) if obj.precio_numerico is not None else "",
        "imagen_url": obj.imagen_url,
        "beneficio_principal": obj.beneficio_principal,
        "beneficios_secundarios": obj.beneficios_secundarios,
        "formato_comercial": obj.formato_comercial,
        "modo_uso": obj.modo_uso,
        "categoria_visible": obj.categoria_visible,
        "planta_id": obj.planta_id or "",
        "publicado": obj.publicado,
        "orden_publicacion": obj.orden_publicacion,
    }


def listado_productos_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    q = request.GET.get("q", "").strip()
    publicado = request.GET.get("publicado", "").strip().lower()
    queryset = ProductoModelo.objects.all().order_by("nombre")
    if q:
        queryset = queryset.filter(Q(nombre__icontains=q) | Q(sku__icontains=q) | Q(slug__icontains=q))
    if publicado in {"true", "false"}:
        queryset = queryset.filter(publicado=(publicado == "true"))
    if request.GET.get("seccion", ""):
        queryset = queryset.filter(seccion_publica=request.GET["seccion"])
    items = [producto_dict(it) for it in queryset[:120]]
    return JsonResponse(
        {
            "items": items,
            "productos": items,
            "metricas": {"total": queryset.count()},
            "secciones": [{"slug": slug, "etiqueta": etiqueta} for slug, etiqueta in SECCIONES_PRODUCTOS.items()],
        }
    )


def listado_plantas_asociables_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    plantas = PlantaModelo.objects.order_by("nombre").values("id", "nombre")[:500]
    return JsonResponse({"items": list(plantas)})


@csrf_exempt
def guardar_producto_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    try:
        data = json_payload(request)
        existente = ProductoModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        nombre = data.get("nombre", "").strip()
        if not nombre:
            raise ValueError("Producto requiere nombre.")
        seccion = data.get("seccion_publica", "").strip()
        if seccion not in SECCIONES_PRODUCTOS:
            raise ValueError("Sección de producto inválida.")
        sku_base = data.get("sku", "").strip() or f"SKU-{nombre[:16].upper().replace(' ', '-')}"
        sku = _generar_sku_unico(sku_base, existente.id if existente else None)
        slug_base = data.get("slug", "").strip() or nombre
        slug = generar_slug_unico(ProductoModelo, slug_base, existente.id if existente else None)
        tipo_producto = data.get("tipo_producto", "").strip()
        categoria_comercial = data.get("categoria_comercial", "").strip()
        if seccion == "botica-natural":
            tipo_producto = normalizar_tipo_producto_botica(data)
            categoria_comercial = normalizar_categoria_botica(data)

        precio_visible = data.get("precio_visible", "").strip()
        precio_numerico = parsear_precio_numerico(precio_visible)
        planta_id = data.get("planta_id", "").strip()
        publicado = to_bool(data, "publicado")
        beneficio_principal = _a_slug_catalogo(str(data.get("beneficio_principal", "")))
        beneficios_secundarios = _normalizar_lista_slugs(str(data.get("beneficios_secundarios", "")))
        formato_comercial = _a_slug_catalogo(str(data.get("formato_comercial", "")))
        modo_uso = _a_slug_catalogo(str(data.get("modo_uso", "")))
        categoria_visible = _a_slug_catalogo(str(data.get("categoria_visible", "")))

        if seccion == "botica-natural":
            beneficio_principal = _validar_valor_catalogo(str(data.get("beneficio_principal", "")), VALORES_BENEFICIO, "Beneficio principal", "calma")
            beneficios_secundarios = _normalizar_beneficios_secundarios(str(data.get("beneficios_secundarios", "")))
            formato_comercial = _validar_valor_catalogo(str(data.get("formato_comercial", "")), VALORES_FORMATO, "Formato comercial", "hoja-seca")
            modo_uso = _validar_valor_catalogo(str(data.get("modo_uso", "")), VALORES_MODO_USO, "Modo de uso", "infusion")
            categoria_visible = _validar_valor_catalogo(str(data.get("categoria_visible", "")), VALORES_CATEGORIA_VISIBLE, "Categoría visible", "hierbas")

        _validar_publicacion_catalogo(tipo_producto=tipo_producto, categoria_comercial=categoria_comercial, planta_id=planta_id, publicado=publicado)

        defaults = {
            "sku": sku,
            "nombre": nombre,
            "tipo_producto": tipo_producto,
            "categoria_comercial": categoria_comercial,
            "seccion_publica": seccion,
            "descripcion_corta": data.get("descripcion_corta", "").strip(),
            "precio_visible": precio_visible,
            "precio_numerico": precio_numerico,
            "imagen_url": data.get("imagen_url", "").strip(),
            "beneficio_principal": beneficio_principal,
            "beneficios_secundarios": beneficios_secundarios,
            "formato_comercial": formato_comercial,
            "modo_uso": modo_uso,
            "categoria_visible": categoria_visible,
            "planta_id": planta_id or None,
            "publicado": publicado,
            "orden_publicacion": to_int(data, "orden_publicacion", 100),
        }
        if existente:
            for k, v in defaults.items():
                setattr(existente, k, v)
            existente.slug = slug
            existente.save()
            obj = existente
        else:
            obj = ProductoModelo.objects.create(id=generar_id_si_falta(None), slug=slug, **defaults)
        LOGGER.info("backoffice_producto_guardado", extra={"usuario": usuario.username, "producto": obj.id})
        return JsonResponse({"item": producto_dict(obj)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def cambiar_publicacion_producto_backoffice(request: HttpRequest, producto_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    try:
        payload = json_payload(request)
        publicar = to_bool(payload, "publicado")
        producto = ProductoModelo.objects.get(id=producto_id)
        producto.publicado = publicar
        producto.save(update_fields=["publicado"])
        LOGGER.info(
            "backoffice_producto_publicacion",
            extra={"usuario": usuario.username, "producto": producto.id, "publicado": publicar},
        )
        item = producto_dict(producto)
        return JsonResponse({"item": item, "producto": item})
    except ProductoModelo.DoesNotExist:
        return JsonResponse({"detalle": "Producto no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
