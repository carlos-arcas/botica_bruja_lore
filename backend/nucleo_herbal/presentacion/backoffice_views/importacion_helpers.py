from __future__ import annotations

import logging
import uuid

from django.http import HttpRequest, JsonResponse

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import estado_imagen_staging
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.presentacion import construir_fila_presentacion, construir_resumen
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ImportacionFilaModelo, ImportacionLoteModelo

from .auth import usuario_staff
from .shared import json_no_autorizado, operation_id

LOGGER = logging.getLogger(__name__)


def serializar_detalle_lote(lote: ImportacionLoteModelo, operation_id_actual: str | None = None) -> dict:
    filas = list(lote.filas.all())
    resumen = construir_resumen(filas)
    return {
        "lote": {"id": lote.id, "entidad": lote.entidad, "modo": lote.modo, "archivo": lote.nombre_archivo, "total_filas": lote.total_filas},
        "resumen": resumen.__dict__,
        "filas": [serializar_fila(fila) for fila in filas],
        "operation_id": operation_id_actual,
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


def json_importacion(detalle: str, status: int, request: HttpRequest, operation_id_actual: str | None = None, **extra) -> JsonResponse:
    operation_id_resuelto = operation_id_actual or operation_id(request)
    return JsonResponse({"detalle": detalle, "operation_id": operation_id_resuelto, **extra}, status=status)


def lote_por_usuario(request: HttpRequest, lote_id: int, operation_id_actual: str | None = None) -> ImportacionLoteModelo | JsonResponse:
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado(request)
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return json_importacion("Lote no encontrado.", 404, request, operation_id_actual=operation_id_actual)
    return lote


def fila_por_usuario(request: HttpRequest, lote_id: int, fila_id: int, operation_id_actual: str | None = None) -> ImportacionFilaModelo | JsonResponse:
    lote = lote_por_usuario(request, lote_id, operation_id_actual=operation_id_actual)
    if isinstance(lote, JsonResponse):
        return lote
    fila = ImportacionFilaModelo.objects.filter(id=fila_id, lote=lote).first()
    if fila is None:
        return json_importacion("Fila no encontrada.", 404, request, operation_id_actual=operation_id_actual)
    if fila.estado == ImportacionFilaModelo.ESTADO_CONFIRMADA:
        return json_importacion("La fila ya fue confirmada.", 409, request, operation_id_actual=operation_id_actual)
    return fila


def log_importacion(accion: str, usuario, lote: ImportacionLoteModelo, filas_afectadas: int, resultado: str, operation_id_actual: str, error: str = "") -> None:
    LOGGER.info(
        "backoffice_importacion_operacion",
        extra={
            "operation_id": operation_id_actual,
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
