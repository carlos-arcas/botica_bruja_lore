from __future__ import annotations

import logging
import uuid

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import IntencionModelo, RitualModelo

from .auth import usuario_staff
from .shared import json_no_autorizado, json_payload, to_bool

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
    }


def listado_rituales_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
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
        return json_no_autorizado()
    try:
        data = json_payload(request)
        slug = data.get("slug", "").strip()
        if not slug:
            raise ValueError("Ritual requiere slug.")
        existente = RitualModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        defaults = {
            "nombre": data.get("nombre", "").strip(),
            "contexto_breve": data.get("contexto_breve", "").strip(),
            "contenido": data.get("contenido", "").strip(),
            "imagen_url": data.get("imagen_url", "").strip(),
            "publicado": to_bool(data, "publicado"),
        }
        obj = existente or RitualModelo(id=str(uuid.uuid4()))
        obj.slug = slug
        for k, v in defaults.items():
            setattr(obj, k, v)
        obj.save()
        _actualizar_intenciones(obj, data)
        LOGGER.info("backoffice_ritual_guardado", extra={"usuario": usuario.username, "ritual": obj.id})
        return JsonResponse({"item": ritual_dict(obj)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


def _actualizar_intenciones(ritual: RitualModelo, data: dict) -> None:
    slugs = data.get("intenciones_relacionadas") or []
    if isinstance(slugs, str):
        slugs = [item.strip() for item in slugs.split(",") if item.strip()]
    if not isinstance(slugs, list):
        raise ValueError("intenciones_relacionadas debe ser lista o csv.")
    if not slugs:
        return
    intenciones = list(IntencionModelo.objects.filter(slug__in=slugs))
    if len(intenciones) != len(set(slugs)):
        raise ValueError("Hay intenciones relacionadas inexistentes.")
    ritual.intenciones.set(intenciones)


@csrf_exempt
def cambiar_publicacion_ritual_backoffice(request: HttpRequest, ritual_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if usuario_staff(request) is None:
        return json_no_autorizado()
    try:
        payload = json_payload(request)
        ritual = RitualModelo.objects.get(id=ritual_id)
        ritual.publicado = to_bool(payload, "publicado")
        ritual.save(update_fields=["publicado"])
        return JsonResponse({"item": ritual_dict(ritual)})
    except RitualModelo.DoesNotExist:
        return JsonResponse({"detalle": "Ritual no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)
