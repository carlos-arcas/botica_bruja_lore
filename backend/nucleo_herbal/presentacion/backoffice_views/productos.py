from __future__ import annotations

import logging
from uuid import uuid4

from django.db import transaction
from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import PlantaModelo, ProductoModelo

from .auth import usuario_staff
from .identificadores import generar_id_si_falta, generar_slug_unico
from .productos_contrato import CAMPOS_CONTRATO_ENTRADA, ErrorValidacionProducto, normalizar_payload_producto
from .shared import json_no_autorizado, json_payload, to_bool

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
    raise ErrorValidacionProducto("No se pudo generar SKU único para el producto.", errores={"sku": "No fue posible reservar un SKU único."})


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


def _contexto_log(
    *,
    request: HttpRequest,
    usuario: object,
    data: dict,
    modo: str,
    normalizado: dict | None = None,
    errores: dict | None = None,
    campos_desconocidos: tuple[str, ...] | None = None,
    operation_id: str | None = None,
) -> dict:
    return {
        "operation_id": operation_id or request.headers.get("X-Request-ID", str(uuid4())),
        "modo": modo,
        "producto_id": str(data.get("id", "")),
        "sku": str((normalizado or {}).get("sku") or data.get("sku", "")),
        "slug": str((normalizado or {}).get("slug") or data.get("slug", "")),
        "nombre": str((normalizado or {}).get("nombre") or data.get("nombre", "")),
        "usuario": getattr(usuario, "username", ""),
        "campos_recibidos": sorted(data.keys()),
        "campos_normalizados": sorted((normalizado or {}).keys()),
        "campos_desconocidos": list(campos_desconocidos or tuple(sorted(set(data.keys()) - CAMPOS_CONTRATO_ENTRADA))),
        "errores_validacion": errores or {},
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
    return JsonResponse({"items": items, "productos": items, "metricas": {"total": queryset.count()}, "secciones": [{"slug": slug, "etiqueta": etiqueta} for slug, etiqueta in SECCIONES_PRODUCTOS.items()]})


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
    data = json_payload(request)
    modo = "editar" if data.get("id") else "crear"
    operation_id = request.headers.get("X-Request-ID", str(uuid4()))
    contexto = _contexto_log(request=request, usuario=usuario, data=data, modo=modo, operation_id=operation_id)
    LOGGER.info("backoffice_producto_guardar_inicio", extra=contexto)
    LOGGER.info("backoffice_producto_payload_recibido", extra=contexto)
    try:
        normalizado = normalizar_payload_producto(data)
        existente = ProductoModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        sku_base = str(data.get("sku", "")).strip() or f"SKU-{normalizado.campos_normalizados['nombre'][:16].upper().replace(' ', '-')}"
        sku = _generar_sku_unico(sku_base, existente.id if existente else None)
        slug_base = str(data.get("slug", "")).strip() or str(normalizado.campos_normalizados["nombre"])
        slug = generar_slug_unico(ProductoModelo, slug_base, existente.id if existente else None)
        campos_persistencia = {**normalizado.campos_normalizados, "sku": sku, "slug": slug}
        contexto = _contexto_log(
            request=request,
            usuario=usuario,
            data=data,
            modo=normalizado.modo,
            normalizado=campos_persistencia,
            campos_desconocidos=normalizado.campos_desconocidos,
            operation_id=operation_id,
        )
        LOGGER.info("backoffice_producto_payload_normalizado", extra=contexto)
        with transaction.atomic():
            if existente:
                for clave, valor in campos_persistencia.items():
                    if clave == "slug":
                        continue
                    setattr(existente, clave, valor)
                existente.slug = slug
                existente.save()
                obj = existente
            else:
                obj = ProductoModelo.objects.create(id=generar_id_si_falta(None), **campos_persistencia)
            contexto["producto_id"] = obj.id
            contexto["slug"] = obj.slug
            LOGGER.info("backoffice_producto_persistencia_ok", extra=contexto)
            try:
                if data.get("__forzar_error_respuesta__"):
                    raise RuntimeError("Error forzado de serialización de respuesta.")
                item = producto_dict(obj)
            except Exception as exc:
                LOGGER.error("backoffice_producto_respuesta_fallida", extra={**contexto, "exception_class": exc.__class__.__name__, "exception_message": str(exc)})
                raise
        return JsonResponse({"item": item, "operation_id": contexto["operation_id"]})
    except ErrorValidacionProducto as exc:
        LOGGER.warning("backoffice_producto_validacion_fallida", extra={**contexto, "errores_validacion": exc.errores, "exception_class": exc.__class__.__name__, "exception_message": exc.detalle})
        return JsonResponse({"detalle": exc.detalle, "errores": exc.errores, "operation_id": contexto["operation_id"]}, status=400)
    except Exception as exc:
        LOGGER.error("backoffice_producto_guardar_error", extra={**contexto, "exception_class": exc.__class__.__name__, "exception_message": str(exc)})
        return JsonResponse({"detalle": "No se pudo completar el guardado del producto.", "operation_id": contexto["operation_id"]}, status=500)


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
        LOGGER.info("backoffice_producto_publicacion", extra={"usuario": usuario.username, "producto": producto.id, "publicado": publicar})
        item = producto_dict(producto)
        return JsonResponse({"item": item, "producto": item})
    except ProductoModelo.DoesNotExist:
        return JsonResponse({"detalle": "Producto no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
