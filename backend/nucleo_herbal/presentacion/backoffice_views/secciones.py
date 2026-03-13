from __future__ import annotations

import logging

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import SeccionPublicaModelo

from .auth import usuario_staff
from .identificadores import generar_slug_unico
from .shared import json_no_autorizado, json_payload, to_bool, to_int

LOGGER = logging.getLogger(__name__)


def seccion_dict(obj: SeccionPublicaModelo) -> dict:
    return {
        "id": obj.id,
        "slug": obj.slug,
        "nombre": obj.nombre,
        "descripcion": obj.descripcion,
        "orden": obj.orden,
        "publicada": obj.publicada,
    }


def listado_secciones_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    q = request.GET.get("q", "").strip()
    queryset = SeccionPublicaModelo.objects.all().order_by("orden", "nombre")
    if q:
        queryset = queryset.filter(Q(nombre__icontains=q) | Q(slug__icontains=q))
    return JsonResponse({"items": [seccion_dict(it) for it in queryset[:120]]})


@csrf_exempt
def guardar_seccion_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    try:
        data = json_payload(request)
        seccion = SeccionPublicaModelo.objects.filter(id=data.get("id")).first() if data.get("id") else SeccionPublicaModelo()
        nombre = data.get("nombre", "").strip()
        if not nombre:
            raise ValueError("Sección requiere nombre.")
        seccion.slug = generar_slug_unico(SeccionPublicaModelo, data.get("slug", "").strip() or nombre, seccion.id)
        seccion.nombre = nombre
        seccion.descripcion = data.get("descripcion", "").strip()
        seccion.orden = to_int(data, "orden", 100)
        seccion.publicada = to_bool(data, "publicada")
        seccion.save()
        LOGGER.info("backoffice_seccion_guardada", extra={"usuario": usuario.username, "seccion": seccion.id})
        return JsonResponse({"item": seccion_dict(seccion)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def cambiar_publicacion_seccion_backoffice(request: HttpRequest, seccion_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    try:
        payload = json_payload(request)
        seccion = SeccionPublicaModelo.objects.get(id=seccion_id)
        seccion.publicada = to_bool(payload, "publicado")
        seccion.save(update_fields=["publicada"])
        return JsonResponse({"item": seccion_dict(seccion)})
    except SeccionPublicaModelo.DoesNotExist:
        return JsonResponse({"detalle": "Sección no encontrada."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
