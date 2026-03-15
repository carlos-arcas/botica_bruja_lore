from __future__ import annotations

import logging

from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import (
    ErrorImagenWebP,
    ErrorValidacionImagen,
    guardar_imagen_backoffice,
)

from .auth import usuario_staff

LOGGER = logging.getLogger(__name__)


@csrf_exempt
def subir_imagen_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return JsonResponse({"detalle": "No autorizado."}, status=403)
    archivo = request.FILES.get("imagen")
    prefijo = (request.POST.get("prefijo") or "").strip()
    try:
        imagen_url = guardar_imagen_backoffice(archivo, prefijo or "backoffice/imagenes")
    except (ErrorValidacionImagen, ErrorImagenWebP) as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)

    LOGGER.info("backoffice_imagen_subida", extra={"usuario": usuario.username, "prefijo": prefijo or "backoffice/imagenes"})
    return JsonResponse({"imagen_url": imagen_url})
