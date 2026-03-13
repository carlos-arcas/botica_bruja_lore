from __future__ import annotations

import logging

from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.lectores import leer_tabla
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import procesar_importacion
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ImportacionFilaModelo, ImportacionLoteModelo

from .auth import usuario_staff
from .shared import json_no_autorizado, json_payload

LOGGER = logging.getLogger(__name__)


@csrf_exempt
def crear_lote_importacion_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    archivo = request.FILES.get("archivo")
    if archivo is None:
        return JsonResponse({"detalle": "Archivo requerido."}, status=400)
    entidad = (request.POST.get("entidad") or "").strip()
    modo = (request.POST.get("modo") or "crear_actualizar").strip()
    columnas, filas = leer_tabla(archivo)
    lote = ImportacionLoteModelo.objects.create(
        entidad=entidad,
        modo=modo,
        nombre_archivo=archivo.name,
        columnas_detectadas=columnas,
        total_filas=len(filas),
        usuario=usuario,
    )
    for indice, row in enumerate(filas, start=2):
        evaluacion = procesar_importacion([row], columnas, entidad, "solo_validar", {}, usuario)
        errores = [e.motivo for e in evaluacion.errores]
        warnings = ["Fila existente, en solo crear será ignorada."] if evaluacion.ignoradas else []
        estado = resolver_estado_fila(errores, warnings)
        ImportacionFilaModelo.objects.create(
            lote=lote,
            numero_fila_original=indice,
            datos=row,
            errores=errores,
            warnings=warnings,
            estado=estado,
            seleccionado=estado != ImportacionFilaModelo.ESTADO_INVALIDA,
            imagen=row.get("imagen_url", ""),
        )
    LOGGER.info("backoffice_importacion_lote_creado", extra={"usuario": usuario.username, "lote": lote.id})
    return JsonResponse({"lote_id": lote.id})


def resolver_estado_fila(errores: list[str], warnings: list[str]) -> str:
    if errores:
        return ImportacionFilaModelo.ESTADO_INVALIDA
    if warnings:
        return ImportacionFilaModelo.ESTADO_WARNING
    return ImportacionFilaModelo.ESTADO_VALIDA


def detalle_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    filas = [
        {
            "id": fila.id,
            "numero": fila.numero_fila_original,
            "datos": fila.datos,
            "errores": fila.errores,
            "warnings": fila.warnings,
            "estado": fila.estado,
            "seleccionado": fila.seleccionado,
        }
        for fila in lote.filas.all()
    ]
    return JsonResponse({"lote": {"id": lote.id, "entidad": lote.entidad, "modo": lote.modo, "archivo": lote.nombre_archivo}, "filas": filas})


@csrf_exempt
def confirmar_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    payload = json_payload(request)
    ids = set(payload.get("filas_ids") or [])
    filas = lote.filas.exclude(estado=ImportacionFilaModelo.ESTADO_CONFIRMADA)
    if ids:
        filas = filas.filter(id__in=ids)
    confirmadas = 0
    for fila in filas:
        confirmadas += confirmar_fila_importacion(lote, fila, usuario)
    LOGGER.info(
        "backoffice_importacion_confirmada",
        extra={"usuario": usuario.username, "lote": lote.id, "confirmadas": confirmadas},
    )
    return JsonResponse({"confirmadas": confirmadas})


def confirmar_fila_importacion(lote: ImportacionLoteModelo, fila: ImportacionFilaModelo, usuario) -> int:
    row = dict(fila.datos)
    if fila.imagen:
        row["imagen_url"] = fila.imagen
    resultado = procesar_importacion([row], lote.columnas_detectadas, lote.entidad, lote.modo, {}, usuario)
    if resultado.fallidas:
        fila.estado = ImportacionFilaModelo.ESTADO_INVALIDA
        fila.resultado_confirmacion = resultado.errores[0].motivo
        fila.save(update_fields=["estado", "resultado_confirmacion"])
        return 0
    fila.estado = ImportacionFilaModelo.ESTADO_CONFIRMADA
    fila.resultado_confirmacion = f"ok c={resultado.creadas} a={resultado.actualizadas} i={resultado.ignoradas}"
    fila.save(update_fields=["estado", "resultado_confirmacion"])
    return 1
