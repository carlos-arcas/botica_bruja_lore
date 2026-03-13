"""Vista custom de Django Admin para importación masiva con staging."""

import csv
from io import BytesIO, StringIO
import logging
import zipfile

from django.contrib import admin, messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.utils.html import escape

from backend.nucleo_herbal.infraestructura.persistencia_django.forms import ImportacionMasivaForm
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.esquemas import ESQUEMAS_IMPORTACION
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import (
    guardar_imagen_fila,
    guardar_imagenes_adjuntas,
)
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.lectores import leer_tabla
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.presentacion import (
    construir_fila_presentacion,
    construir_resumen,
)
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import procesar_importacion
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ImportacionFilaModelo, ImportacionLoteModelo

LOGGER = logging.getLogger(__name__)

@staff_member_required
def importacion_masiva_view(request):
    form = ImportacionMasivaForm(request.POST or None, request.FILES or None)
    lote = None

    if request.method == "POST" and request.POST.get("accion") == "adjuntar_imagen":
        fila = get_object_or_404(ImportacionFilaModelo, id=request.POST.get("fila_id"))
        if "imagen_fila" in request.FILES:
            fila.imagen = guardar_imagen_fila(request.FILES["imagen_fila"], fila.id)
            fila.save(update_fields=["imagen"])
            messages.success(request, f"Imagen actualizada para fila {fila.numero_fila_original}.")
        lote = fila.lote
    elif request.method == "POST" and request.POST.get("accion") == "quitar_imagen":
        fila = get_object_or_404(ImportacionFilaModelo, id=request.POST.get("fila_id"))
        fila.imagen = ""
        fila.save(update_fields=["imagen"])
        messages.info(request, f"Imagen eliminada para fila {fila.numero_fila_original}.")
        lote = fila.lote
    elif request.method == "POST" and request.POST.get("accion") in {
        "confirmar_seleccionadas",
        "confirmar_validas",
        "descartar_filas",
        "revalidar_lote",
        "cancelar_importacion",
    }:
        lote = get_object_or_404(ImportacionLoteModelo, id=request.POST.get("lote_id"), usuario=request.user)
        _ejecutar_accion_lote(request, lote)
        if request.POST.get("accion") == "cancelar_importacion":
            lote = None
        else:
            lote = ImportacionLoteModelo.objects.filter(id=lote.id, usuario=request.user).first()
    elif request.method == "POST" and form.is_valid():
        columnas, filas = leer_tabla(form.cleaned_data["archivo"])
        imagenes = guardar_imagenes_adjuntas(request.FILES.getlist("imagenes"))
        lote = _crear_lote_staging(
            usuario=request.user,
            entidad=form.cleaned_data["entidad"],
            modo=form.cleaned_data["modo"],
            nombre_archivo=form.cleaned_data["archivo"].name,
            columnas=columnas,
            filas=filas,
            imagenes=imagenes,
        )
        messages.info(request, "Validación completada. Revisa filas pendientes antes de confirmar.")
    elif request.method == "POST":
        messages.error(request, "Corrige el formulario y vuelve a intentar.")

    lote_id = request.GET.get("lote")
    if not lote and lote_id:
        lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=request.user).first()

    filas = list(lote.filas.all()) if lote else []
    context = {
        **admin.site.each_context(request),
        "title": "Importación masiva",
        "form": form,
        "lote": lote,
        "filas": filas,
        "filas_presentacion": [construir_fila_presentacion(fila) for fila in filas],
        "resumen": construir_resumen(filas),
        "esquemas": ESQUEMAS_IMPORTACION,
    }
    return render(request, "admin/persistencia_django/importacion_masiva.html", context)

def _crear_lote_staging(usuario, entidad, modo, nombre_archivo, columnas, filas, imagenes):
    lote = ImportacionLoteModelo.objects.create(
        entidad=entidad or "",
        modo=modo,
        nombre_archivo=nombre_archivo,
        columnas_detectadas=columnas,
        total_filas=len(filas),
        usuario=usuario,
    )
    for indice, row in enumerate(filas, start=2):
        evaluacion = procesar_importacion(
            filas=[row],
            columnas=columnas,
            entidad_solicitada=entidad,
            modo="solo_validar",
            imagenes_por_referencia=imagenes,
            usuario=usuario,
        )
        errores = [e.motivo for e in evaluacion.errores]
        warnings = []
        estado = ImportacionFilaModelo.ESTADO_INVALIDA if errores else ImportacionFilaModelo.ESTADO_VALIDA
        if evaluacion.ignoradas:
            warnings.append("Fila ya existente: en modo solo crear será ignorada.")
            estado = ImportacionFilaModelo.ESTADO_WARNING
        imagen = row.get("imagen_url", "")
        if row.get("imagen_ref", ""):
            imagen = imagenes.get(row.get("imagen_ref", ""), imagen)
        ImportacionFilaModelo.objects.create(
            lote=lote,
            numero_fila_original=indice,
            datos=row,
            errores=errores,
            warnings=warnings,
            estado=estado,
            imagen=imagen,
            seleccionado=estado != ImportacionFilaModelo.ESTADO_INVALIDA,
        )
    return lote

def _ejecutar_accion_lote(request, lote):
    accion = request.POST.get("accion")
    filas = lote.filas.all()
    _sincronizar_seleccion(filas, request.POST.getlist("fila_ids"))

    if accion == "cancelar_importacion":
        LOGGER.info("importacion_masiva_cancelada", extra={"lote_id": lote.id, "usuario_id": request.user.id})
        lote.delete()
        messages.warning(request, "Importación cancelada y lote eliminado.")
        return

    if accion == "revalidar_lote":
        _revalidar_filas_lote(request, lote)
        messages.info(request, "Revalidación completada.")
        return

    if accion == "descartar_filas":
        ids = request.POST.getlist("fila_ids")
        filas.filter(id__in=ids).update(estado=ImportacionFilaModelo.ESTADO_DESCARTADA, seleccionado=False)
        messages.warning(request, f"Filas descartadas: {len(ids)}")
        return

    if accion == "confirmar_seleccionadas":
        filas_objetivo = filas.filter(seleccionado=True).exclude(estado=ImportacionFilaModelo.ESTADO_DESCARTADA)
    else:
        filas_objetivo = filas.filter(estado__in=[ImportacionFilaModelo.ESTADO_VALIDA, ImportacionFilaModelo.ESTADO_WARNING])

    for fila in filas_objetivo:
        row = dict(fila.datos)
        if fila.imagen:
            row["imagen_url"] = fila.imagen
        resultado = procesar_importacion(
            filas=[row],
            columnas=lote.columnas_detectadas,
            entidad_solicitada=lote.entidad,
            modo=lote.modo,
            imagenes_por_referencia={},
            usuario=request.user,
        )
        if resultado.fallidas:
            fila.estado = ImportacionFilaModelo.ESTADO_INVALIDA
            fila.resultado_confirmacion = resultado.errores[0].motivo
        else:
            fila.estado = ImportacionFilaModelo.ESTADO_CONFIRMADA
            fila.resultado_confirmacion = f"ok c={resultado.creadas} a={resultado.actualizadas} i={resultado.ignoradas}"
        fila.save(update_fields=["estado", "resultado_confirmacion"])
    messages.success(request, "Confirmación ejecutada por filas.")

def _sincronizar_seleccion(filas, ids_seleccionados: list[str]):
    filas.update(seleccionado=False)
    if ids_seleccionados:
        filas.filter(id__in=ids_seleccionados).update(seleccionado=True)

def _revalidar_filas_lote(request, lote):
    for fila in lote.filas.exclude(estado=ImportacionFilaModelo.ESTADO_CONFIRMADA):
        evaluacion = procesar_importacion(
            filas=[fila.datos],
            columnas=lote.columnas_detectadas,
            entidad_solicitada=lote.entidad,
            modo="solo_validar",
            imagenes_por_referencia={},
            usuario=request.user,
        )
        errores = [e.motivo for e in evaluacion.errores]
        warnings = []
        estado = ImportacionFilaModelo.ESTADO_INVALIDA if errores else ImportacionFilaModelo.ESTADO_VALIDA
        if evaluacion.ignoradas:
            warnings.append("Fila ya existente: en modo solo crear será ignorada.")
            estado = ImportacionFilaModelo.ESTADO_WARNING
        fila.errores = errores
        fila.warnings = warnings
        fila.estado = estado
        fila.save(update_fields=["errores", "warnings", "estado"])

@staff_member_required
def descargar_plantilla_view(_request, entidad: str, formato: str):
    esquema = ESQUEMAS_IMPORTACION[entidad]
    columnas = list(esquema.todas_columnas)
    if formato == "csv":
        stream = StringIO()
        writer = csv.DictWriter(stream, fieldnames=columnas)
        writer.writeheader()
        writer.writerow({k: v for k, v in esquema.ejemplo.items() if k in columnas})
        respuesta = HttpResponse(stream.getvalue(), content_type="text/csv; charset=utf-8")
        respuesta["Content-Disposition"] = f'attachment; filename="{entidad}.csv"'
        return respuesta

    response = HttpResponse(
        _generar_xlsx(columnas, [esquema.ejemplo.get(c, "") for c in columnas]),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = f'attachment; filename="{entidad}.xlsx"'
    return response

def _generar_xlsx(columnas: list[str], muestra: list[str]) -> bytes:
    mem = BytesIO()
    with zipfile.ZipFile(mem, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", _content_types())
        zf.writestr("_rels/.rels", _rels())
        zf.writestr("xl/workbook.xml", _workbook())
        zf.writestr("xl/_rels/workbook.xml.rels", _workbook_rels())
        zf.writestr("xl/worksheets/sheet1.xml", _sheet_xml([columnas, muestra]))
    return mem.getvalue()

def _sheet_xml(rows: list[list[str]]) -> str:
    filas_xml = []
    for idx, row in enumerate(rows, start=1):
        cells = []
        for cidx, value in enumerate(row):
            col = chr(ord("A") + cidx)
            cells.append(
                f'<c r="{col}{idx}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'
            )
        filas_xml.append(f"<row r=\"{idx}\">{''.join(cells)}</row>")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
        + "".join(filas_xml)
        + "</sheetData></worksheet>"
    )

def _content_types() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '</Types>'
    )

def _rels() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
        'Target="xl/workbook.xml"/></Relationships>'
    )

def _workbook() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheets><sheet name="plantilla" sheetId="1" r:id="rId1"/></sheets></workbook>'
    )

def _workbook_rels() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
        'Target="worksheets/sheet1.xml"/></Relationships>'
    )
