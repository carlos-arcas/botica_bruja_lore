from __future__ import annotations

import logging

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo

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
        "imagen_url": obj.imagen_url,
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
    return JsonResponse(
        {
            "items": [producto_dict(it) for it in queryset[:120]],
            "metricas": {"total": queryset.count()},
            "secciones": [{"slug": slug, "etiqueta": etiqueta} for slug, etiqueta in SECCIONES_PRODUCTOS.items()],
        }
    )


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
        defaults = {
            "sku": sku,
            "nombre": nombre,
            "tipo_producto": data.get("tipo_producto", "").strip(),
            "categoria_comercial": data.get("categoria_comercial", "").strip(),
            "seccion_publica": seccion,
            "descripcion_corta": data.get("descripcion_corta", "").strip(),
            "precio_visible": data.get("precio_visible", "").strip(),
            "imagen_url": data.get("imagen_url", "").strip(),
            "publicado": to_bool(data, "publicado"),
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
        return JsonResponse({"item": producto_dict(producto)})
    except ProductoModelo.DoesNotExist:
        return JsonResponse({"detalle": "Producto no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
