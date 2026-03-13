from __future__ import annotations

import logging

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ArticuloEditorialModelo, SeccionPublicaModelo

from .auth import usuario_staff
from .identificadores import generar_slug_unico
from .shared import json_no_autorizado, json_payload, to_bool

LOGGER = logging.getLogger(__name__)


def articulo_dict(obj: ArticuloEditorialModelo) -> dict:
    return {
        "id": obj.id,
        "slug": obj.slug,
        "titulo": obj.titulo,
        "resumen": obj.resumen,
        "contenido": obj.contenido,
        "tema": obj.tema,
        "hub": obj.hub,
        "subhub": obj.subhub,
        "imagen_url": obj.imagen_url,
        "indexable": obj.indexable,
        "publicado": obj.publicado,
        "seccion_publica": obj.seccion_publica.slug if obj.seccion_publica else "",
    }


def listado_editorial_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    q = request.GET.get("q", "").strip()
    queryset = ArticuloEditorialModelo.objects.all().order_by("-fecha_actualizacion")
    if q:
        queryset = queryset.filter(Q(titulo__icontains=q) | Q(slug__icontains=q))
    return JsonResponse({"items": [articulo_dict(it) for it in queryset[:120]]})


@csrf_exempt
def guardar_editorial_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    try:
        data = json_payload(request)
        seccion = _resolver_seccion_publica(data)
        existente = ArticuloEditorialModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        titulo = data.get("titulo", "").strip()
        if not titulo:
            raise ValueError("Editorial requiere título.")
        obj = existente or ArticuloEditorialModelo()
        obj.slug = generar_slug_unico(ArticuloEditorialModelo, data.get("slug", "").strip() or titulo, obj.id)
        obj.titulo = titulo
        obj.resumen = data.get("resumen", "").strip()
        obj.contenido = data.get("contenido", "").strip()
        obj.tema = data.get("tema", "").strip()
        obj.hub = data.get("hub", "").strip()
        obj.subhub = data.get("subhub", "").strip()
        obj.imagen_url = data.get("imagen_url", "").strip()
        obj.indexable = to_bool(data, "indexable", True)
        obj.publicado = to_bool(data, "publicado")
        obj.seccion_publica = seccion
        if obj.publicado and not obj.fecha_publicacion:
            obj.fecha_publicacion = timezone.now()
        obj.save()
        LOGGER.info("backoffice_editorial_guardado", extra={"usuario": usuario.username, "articulo": obj.id})
        return JsonResponse({"item": articulo_dict(obj)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


def _resolver_seccion_publica(data: dict) -> SeccionPublicaModelo | None:
    if not data.get("seccion_publica"):
        return None
    seccion = SeccionPublicaModelo.objects.filter(slug=data["seccion_publica"]).first()
    if not seccion:
        raise ValueError("Sección pública no encontrada.")
    return seccion


@csrf_exempt
def cambiar_publicacion_editorial_backoffice(request: HttpRequest, articulo_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    try:
        payload = json_payload(request)
        articulo = ArticuloEditorialModelo.objects.get(id=articulo_id)
        articulo.publicado = to_bool(payload, "publicado")
        articulo.fecha_publicacion = timezone.now() if articulo.publicado else None
        articulo.save(update_fields=["publicado", "fecha_publicacion"])
        return JsonResponse({"item": articulo_dict(articulo)})
    except ArticuloEditorialModelo.DoesNotExist:
        return JsonResponse({"detalle": "Artículo no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
