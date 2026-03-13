from __future__ import annotations

import logging
import uuid

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo

from .auth import usuario_staff
from .shared import json_no_autorizado, json_payload, to_bool, to_int

LOGGER = logging.getLogger(__name__)


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
    if request.GET.get("tipo", ""):
        queryset = queryset.filter(tipo_producto=request.GET["tipo"])
    return JsonResponse({"items": [producto_dict(it) for it in queryset[:120]], "metricas": {"total": queryset.count()}})


@csrf_exempt
def guardar_producto_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    try:
        data = json_payload(request)
        slug = data.get("slug", "").strip()
        sku = data.get("sku", "").strip()
        if not slug or not sku:
            raise ValueError("Producto requiere slug y sku.")
        existente = ProductoModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        defaults = {
            "sku": sku,
            "nombre": data.get("nombre", "").strip(),
            "tipo_producto": data.get("tipo_producto", "").strip(),
            "categoria_comercial": data.get("categoria_comercial", "").strip(),
            "seccion_publica": data.get("seccion_publica", "").strip(),
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
            obj = ProductoModelo.objects.create(id=str(uuid.uuid4()), slug=slug, **defaults)
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
