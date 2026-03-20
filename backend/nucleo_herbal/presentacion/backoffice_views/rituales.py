from __future__ import annotations

import logging

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import IntencionModelo, ProductoModelo, RitualModelo

from .auth import usuario_staff
from .identificadores import generar_id_si_falta, generar_slug_unico
from .shared import json_no_autorizado, json_payload, operation_id, to_bool

LOGGER = logging.getLogger(__name__)


def ritual_dict(obj: RitualModelo) -> dict:
    return {
        "id": obj.id,
        "slug": obj.slug,
        "nombre": obj.nombre,
        "contexto_breve": obj.contexto_breve,
        "contenido": obj.contenido,
        "imagen_url": obj.imagen_url,
        "publicado": obj.publicado,
        "intenciones_relacionadas": [it.slug for it in obj.intenciones.all()],
        "productos_relacionados": [it.id for it in obj.productos_relacionados.all()],
    }


def listado_rituales_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)
    q = request.GET.get("q", "").strip()
    queryset = RitualModelo.objects.all().order_by("nombre")
    if q:
        queryset = queryset.filter(Q(nombre__icontains=q) | Q(slug__icontains=q))
    return JsonResponse({"items": [ritual_dict(it) for it in queryset[:120]]})


@csrf_exempt
def guardar_ritual_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado(request)
    try:
        operation_id_actual = operation_id(request)
        data = json_payload(request)
        existente = RitualModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        nombre = data.get("nombre", "").strip()
        if not nombre:
            raise ValueError("Ritual requiere nombre.")
        obj = existente or RitualModelo(id=generar_id_si_falta(None))
        obj.slug = generar_slug_unico(RitualModelo, data.get("slug", "").strip() or nombre, obj.id)
        obj.nombre = nombre
        obj.contexto_breve = data.get("contexto_breve", "").strip()
        obj.contenido = data.get("contenido", "").strip()
        obj.imagen_url = data.get("imagen_url", "").strip()
        obj.publicado = to_bool(data, "publicado")
        obj.save()
        _actualizar_intenciones(obj, data)
        _actualizar_productos(obj, data)
        LOGGER.info("backoffice_ritual_guardado", extra={"usuario": usuario.username, "ritual": obj.id})
        return JsonResponse({"item": ritual_dict(obj), "operation_id": operation_id_actual})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id_actual}, status=400)


def _actualizar_intenciones(ritual: RitualModelo, data: dict) -> None:
    slugs = data.get("intenciones_relacionadas") or []
    if isinstance(slugs, str):
        slugs = [item.strip() for item in slugs.split(",") if item.strip()]
    if not isinstance(slugs, list):
        raise ValueError("intenciones_relacionadas debe ser lista o csv.")
    if not slugs:
        ritual.intenciones.clear()
        return
    intenciones = list(IntencionModelo.objects.filter(slug__in=slugs))
    if len(intenciones) != len(set(slugs)):
        raise ValueError("Hay intenciones relacionadas inexistentes.")
    ritual.intenciones.set(intenciones)


def _actualizar_productos(ritual: RitualModelo, data: dict) -> None:
    ids = data.get("productos_relacionados") or []
    if isinstance(ids, str):
        ids = [item.strip() for item in ids.split(",") if item.strip()]
    if not isinstance(ids, list):
        raise ValueError("productos_relacionados debe ser lista o csv.")
    if not ids:
        ritual.productos_relacionados.clear()
        return
    productos = list(ProductoModelo.objects.filter(id__in=ids))
    if len(productos) != len(set(ids)):
        raise ValueError("Hay productos relacionados inexistentes.")
    ritual.productos_relacionados.set(productos)


@csrf_exempt
def cambiar_publicacion_ritual_backoffice(request: HttpRequest, ritual_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)
    try:
        operation_id_actual = operation_id(request)
        payload = json_payload(request)
        ritual = RitualModelo.objects.get(id=ritual_id)
        ritual.publicado = to_bool(payload, "publicado")
        ritual.save(update_fields=["publicado"])
        return JsonResponse({"item": ritual_dict(ritual), "operation_id": operation_id_actual})
    except RitualModelo.DoesNotExist:
        return JsonResponse({"detalle": "Ritual no encontrado.", "operation_id": operation_id_actual}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id_actual}, status=400)
