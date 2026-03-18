from __future__ import annotations

from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import (
    ErrorImagenWebP,
    ErrorValidacionImagen,
    estado_imagen_staging,
    guardar_imagen_fila,
)
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.lectores import leer_tabla
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import procesar_importacion
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ImportacionFilaModelo, ImportacionLoteModelo

from .auth import usuario_staff
from .importacion_helpers import fila_por_usuario, log_importacion, lote_por_usuario, operation_id, serializar_detalle_lote, serializar_fila
from .shared import json_no_autorizado, json_payload


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
    columnas, filas = leer_tabla(archivo)
    lote = ImportacionLoteModelo.objects.create(
        entidad=(request.POST.get("entidad") or "").strip(),
        modo=(request.POST.get("modo") or "crear_actualizar").strip(),
        nombre_archivo=archivo.name,
        columnas_detectadas=columnas,
        total_filas=len(filas),
        usuario=usuario,
    )
    for indice, row in enumerate(filas, start=2):
        crear_fila_staging(lote, indice, row, columnas, usuario)
    log_importacion("inicio_lote", usuario, lote, filas_afectadas=len(filas), resultado="ok")
    return JsonResponse({"lote_id": lote.id, "operation_id": operation_id(request)})


def detalle_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    lote = lote_por_usuario(request, lote_id)
    if isinstance(lote, JsonResponse):
        return lote
    return JsonResponse(serializar_detalle_lote(lote))


@csrf_exempt
def confirmar_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    return confirmar_lote(request, lote_id, "seleccionadas")


@csrf_exempt
def confirmar_validas_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    return confirmar_lote(request, lote_id, "validas")


@csrf_exempt
def revalidar_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    lote = lote_por_usuario(request, lote_id)
    if isinstance(lote, JsonResponse):
        return lote
    filas = list(lote.filas.exclude(estado=ImportacionFilaModelo.ESTADO_CONFIRMADA))
    for fila in filas:
        revalidar_fila(lote, fila, lote.usuario)
    log_importacion("revalidacion", lote.usuario, lote, filas_afectadas=len(filas), resultado="ok")
    return JsonResponse({"revalidado": True, "detalle": serializar_detalle_lote(lote)})


@csrf_exempt
def cancelar_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    lote = lote_por_usuario(request, lote_id)
    if isinstance(lote, JsonResponse):
        return lote
    filas = lote.filas.count()
    usuario = lote.usuario
    lote.delete()
    log_importacion("cancelacion", usuario, lote, filas_afectadas=filas, resultado="ok")
    return JsonResponse({"cancelado": True, "lote_id": lote_id})


@csrf_exempt
def descartar_filas_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    lote = lote_por_usuario(request, lote_id)
    if isinstance(lote, JsonResponse):
        return lote
    ids = json_payload(request).get("filas_ids") or []
    lote.filas.filter(id__in=ids).exclude(estado=ImportacionFilaModelo.ESTADO_CONFIRMADA).update(
        estado=ImportacionFilaModelo.ESTADO_DESCARTADA,
        seleccionado=False,
    )
    log_importacion("descarte_lote", lote.usuario, lote, filas_afectadas=len(ids), resultado="ok")
    return JsonResponse({"detalle": serializar_detalle_lote(lote)})


@csrf_exempt
def actualizar_seleccion_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    return operar_fila(request, lote_id, fila_id, accion="seleccion")


@csrf_exempt
def descartar_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    return operar_fila(request, lote_id, fila_id, accion="descartar")


@csrf_exempt
def adjuntar_imagen_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    return operar_fila(request, lote_id, fila_id, accion="adjuntar_imagen")


@csrf_exempt
def eliminar_imagen_fila_importacion_backoffice(request: HttpRequest, lote_id: int, fila_id: int) -> JsonResponse:
    return operar_fila(request, lote_id, fila_id, accion="eliminar_imagen")


def confirmar_lote(request: HttpRequest, lote_id: int, alcance: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    lote = lote_por_usuario(request, lote_id)
    if isinstance(lote, JsonResponse):
        return lote
    ids = set(json_payload(request).get("filas_ids") or [])
    filas = filas_objetivo_confirmacion(lote, alcance, ids)
    confirmadas = sum(confirmar_fila(lote, fila, lote.usuario) for fila in filas)
    log_importacion(f"confirmacion_{alcance}", lote.usuario, lote, filas_afectadas=len(filas), resultado="ok")
    return JsonResponse({"confirmadas": confirmadas, "detalle": serializar_detalle_lote(lote)})


def operar_fila(request: HttpRequest, lote_id: int, fila_id: int, accion: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    fila = fila_por_usuario(request, lote_id, fila_id)
    if isinstance(fila, JsonResponse):
        return fila
    if accion == "seleccion":
        fila.seleccionado = bool(json_payload(request).get("seleccionado"))
        fila.save(update_fields=["seleccionado"])
    elif accion == "descartar":
        fila.estado = ImportacionFilaModelo.ESTADO_DESCARTADA
        fila.seleccionado = False
        fila.save(update_fields=["estado", "seleccionado"])
    elif accion == "eliminar_imagen":
        fila.imagen = ""
        fila.resultado_confirmacion = estado_imagen_staging(fila.datos, fila.imagen)
        fila.save(update_fields=["imagen", "resultado_confirmacion"])
    else:
        archivo = request.FILES.get("imagen")
        if archivo is None:
            return JsonResponse({"detalle": "Imagen requerida."}, status=400)
        try:
            fila.imagen = guardar_imagen_fila(archivo, fila.id)
        except (ErrorImagenWebP, ErrorValidacionImagen) as error:
            log_importacion("imagen_adjuntar", fila.lote.usuario, fila.lote, filas_afectadas=1, resultado="error", error=str(error))
            return JsonResponse({"detalle": str(error)}, status=422)
        fila.resultado_confirmacion = estado_imagen_staging(fila.datos, fila.imagen)
        fila.save(update_fields=["imagen", "resultado_confirmacion"])
    log_importacion(accion, fila.lote.usuario, fila.lote, filas_afectadas=1, resultado="ok")
    return JsonResponse({"fila": serializar_fila(fila)})


def filas_objetivo_confirmacion(lote: ImportacionLoteModelo, alcance: str, ids: set[int]) -> list[ImportacionFilaModelo]:
    filas = lote.filas.exclude(estado__in=[ImportacionFilaModelo.ESTADO_CONFIRMADA, ImportacionFilaModelo.ESTADO_DESCARTADA])
    if alcance == "validas":
        return list(filas.filter(estado__in=[ImportacionFilaModelo.ESTADO_VALIDA, ImportacionFilaModelo.ESTADO_WARNING]))
    if ids:
        return list(filas.filter(id__in=ids))
    return list(filas.filter(seleccionado=True))


def confirmar_fila(lote: ImportacionLoteModelo, fila: ImportacionFilaModelo, usuario) -> int:
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


def revalidar_fila(lote: ImportacionLoteModelo, fila: ImportacionFilaModelo, usuario) -> None:
    row = dict(fila.datos)
    if fila.imagen:
        row["imagen_url"] = fila.imagen
    evaluacion = procesar_importacion([row], lote.columnas_detectadas, lote.entidad, "solo_validar", {}, usuario)
    errores = [error.motivo for error in evaluacion.errores]
    warnings = ["Fila existente, en solo crear será ignorada."] if evaluacion.ignoradas else []
    fila.errores = errores
    fila.warnings = warnings
    fila.estado = resolver_estado_fila(errores, warnings)
    fila.resultado_confirmacion = estado_imagen_staging(fila.datos, fila.imagen)
    fila.save(update_fields=["errores", "warnings", "estado", "resultado_confirmacion"])


def crear_fila_staging(lote: ImportacionLoteModelo, indice: int, row: dict[str, str], columnas: list[str], usuario) -> None:
    evaluacion = procesar_importacion([row], columnas, lote.entidad, "solo_validar", {}, usuario)
    errores = [error.motivo for error in evaluacion.errores]
    warnings = ["Fila existente, en solo crear será ignorada."] if evaluacion.ignoradas else []
    estado = resolver_estado_fila(errores, warnings)
    imagen = row.get("imagen_url", "")
    ImportacionFilaModelo.objects.create(
        lote=lote,
        numero_fila_original=indice,
        datos=row,
        errores=errores,
        warnings=warnings,
        estado=estado,
        seleccionado=estado != ImportacionFilaModelo.ESTADO_INVALIDA,
        imagen=imagen,
        resultado_confirmacion=estado_imagen_staging(row, imagen),
    )


def resolver_estado_fila(errores: list[str], warnings: list[str]) -> str:
    if errores:
        return ImportacionFilaModelo.ESTADO_INVALIDA
    if warnings:
        return ImportacionFilaModelo.ESTADO_WARNING
    return ImportacionFilaModelo.ESTADO_VALIDA
