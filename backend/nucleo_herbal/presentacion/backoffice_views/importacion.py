from __future__ import annotations

import logging

from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import (
    ErrorImagenWebP,
    estado_imagen_staging,
    guardar_imagen_fila,
)
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


def _serializar_fila(fila: ImportacionFilaModelo) -> dict:
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
    }


def detalle_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    filas = [_serializar_fila(fila) for fila in lote.filas.all()]
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
    LOGGER.info("backoffice_importacion_confirmada", extra={"usuario": usuario.username, "lote": lote.id, "confirmadas": confirmadas})
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


@csrf_exempt
def revalidar_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    for fila in lote.filas.exclude(estado=ImportacionFilaModelo.ESTADO_CONFIRMADA):
        row = dict(fila.datos)
        if fila.imagen:
            row["imagen_url"] = fila.imagen
        evaluacion = procesar_importacion([row], lote.columnas_detectadas, lote.entidad, "solo_validar", {}, usuario)
        errores = [e.motivo for e in evaluacion.errores]
        warnings = ["Fila existente, en solo crear será ignorada."] if evaluacion.ignoradas else []
        fila.errores = errores
        fila.warnings = warnings
        fila.estado = resolver_estado_fila(errores, warnings)
        fila.save(update_fields=["errores", "warnings", "estado"])
    return JsonResponse({"revalidado": True})


@csrf_exempt
def actualizar_seleccion_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    fila = _fila_por_usuario(request, lote_id, fila_id)
    if isinstance(fila, JsonResponse):
        return fila
    payload = json_payload(request)
    fila.seleccionado = bool(payload.get("seleccionado"))
    fila.save(update_fields=["seleccionado"])
    return JsonResponse({"fila": _serializar_fila(fila)})


@csrf_exempt
def descartar_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    fila = _fila_por_usuario(request, lote_id, fila_id)
    if isinstance(fila, JsonResponse):
        return fila
    fila.estado = ImportacionFilaModelo.ESTADO_DESCARTADA
    fila.seleccionado = False
    fila.save(update_fields=["estado", "seleccionado"])
    return JsonResponse({"fila": _serializar_fila(fila)})


@csrf_exempt
def adjuntar_imagen_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    fila = _fila_por_usuario(request, lote_id, fila_id)
    if isinstance(fila, JsonResponse):
        return fila
    archivo = request.FILES.get("imagen")
    if archivo is None:
        return JsonResponse({"detalle": "Imagen requerida."}, status=400)
    try:
        fila.imagen = guardar_imagen_fila(archivo, fila.id)
    except ErrorImagenWebP as error:
        return JsonResponse({"detalle": str(error)}, status=422)
    fila.save(update_fields=["imagen"])
    return JsonResponse({"fila": _serializar_fila(fila)})


@csrf_exempt
def eliminar_imagen_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    fila = _fila_por_usuario(request, lote_id, fila_id)
    if isinstance(fila, JsonResponse):
        return fila
    fila.imagen = ""
    fila.save(update_fields=["imagen"])
    return JsonResponse({"fila": _serializar_fila(fila)})


def _fila_por_usuario(request: HttpRequest, lote_id: int, fila_id: int) -> ImportacionFilaModelo | JsonResponse:
    usuario = usuario_staff(request)
    if usuario is None:
        return json_no_autorizado()
    fila = ImportacionFilaModelo.objects.filter(id=fila_id, lote_id=lote_id, lote__usuario=usuario).first()
    if fila is None:
        return JsonResponse({"detalle": "Fila no encontrada."}, status=404)
    if fila.estado == ImportacionFilaModelo.ESTADO_CONFIRMADA:
        return JsonResponse({"detalle": "La fila ya fue confirmada."}, status=409)
    return fila
