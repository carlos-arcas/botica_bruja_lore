from __future__ import annotations

import logging
import uuid

from django.http import HttpRequest, JsonResponse

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import estado_imagen_staging
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.presentacion import construir_fila_presentacion, construir_resumen
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ImportacionFilaModelo, ImportacionLoteModelo

from .auth import usuario_staff
from .shared import json_no_autorizado

LOGGER = logging.getLogger(__name__)


def serializar_detalle_lote(lote: ImportacionLoteModelo) -> dict:
    filas = list(lote.filas.all())
    resumen = construir_resumen(filas)
    return {
        "lote": {"id": lote.id, "entidad": lote.entidad, "modo": lote.modo, "archivo": lote.nombre_archivo, "total_filas": lote.total_filas},
        "resumen": resumen.__dict__,
        "filas": [serializar_fila(fila) for fila in filas],
    }


def serializar_fila(fila: ImportacionFilaModelo) -> dict:
    presentacion = construir_fila_presentacion(fila)
    return {
        "id": fila.id,
        "numero": fila.numero_fila_original,
        "datos": fila.datos,
        "errores": fila.errores,
        "warnings": fila.warnings,
        "estado": fila.estado,
        "seleccionado": fila.seleccionado,
        "imagen": fila.imagen,
        "estado_imagen": estado_imagen_staging(fila.datos, fila.imagen),
        "resultado_confirmacion": fila.resultado_confirmacion,
        "identificador": presentacion["identificador"],
        "titulo": presentacion["titulo"],
        "tipo": presentacion["tipo"],
        "resumen_datos": presentacion["resumen_datos"],
    }


def lote_por_usuario(request: HttpRequest, lote_id: int) -> ImportacionLoteModelo | JsonResponse:
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    return lote


def fila_por_usuario(request: HttpRequest, lote_id: int, fila_id: int) -> ImportacionFilaModelo | JsonResponse:
    lote = lote_por_usuario(request, lote_id)
    if isinstance(lote, JsonResponse):
        return lote
    fila = ImportacionFilaModelo.objects.filter(id=fila_id, lote=lote).first()
    if fila is None:
        return JsonResponse({"detalle": "Fila no encontrada."}, status=404)
    if fila.estado == ImportacionFilaModelo.ESTADO_CONFIRMADA:
        return JsonResponse({"detalle": "La fila ya fue confirmada."}, status=409)
    return fila


def log_importacion(accion: str, usuario, lote: ImportacionLoteModelo, filas_afectadas: int, resultado: str, error: str = "") -> None:
    LOGGER.info(
        "backoffice_importacion_operacion",
        extra={
            "operation_id": str(uuid.uuid4()),
            "usuario": getattr(usuario, "username", "anonimo"),
            "lote_id": lote.id,
            "entidad": lote.entidad,
            "modo": lote.modo,
            "accion": accion,
            "filas_afectadas": filas_afectadas,
            "resultado": resultado,
            "error": error,
        },
    )


def operation_id(request: HttpRequest) -> str:
    return request.headers.get("X-Request-ID", str(uuid.uuid4()))
