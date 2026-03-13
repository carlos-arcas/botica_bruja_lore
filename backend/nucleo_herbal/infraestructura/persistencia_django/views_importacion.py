"""Vista custom de Django Admin para importación masiva."""

import csv
from io import BytesIO, StringIO
import zipfile

from django.contrib import admin, messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse
from django.shortcuts import render
from django.utils.html import escape

from backend.nucleo_herbal.infraestructura.persistencia_django.forms import ImportacionMasivaForm
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.esquemas import ESQUEMAS_IMPORTACION
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import guardar_imagenes_adjuntas
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.lectores import leer_tabla
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import procesar_importacion


@staff_member_required
def importacion_masiva_view(request):
    form = ImportacionMasivaForm(request.POST or None, request.FILES or None)
    resultado = None

    if request.method == "POST" and form.is_valid():
        accion = request.POST.get("accion", "validar")
        try:
            columnas, filas = leer_tabla(form.cleaned_data["archivo"])
            imagenes = guardar_imagenes_adjuntas(request.FILES.getlist("imagenes"))
            modo = "solo_validar" if accion == "validar" else form.cleaned_data["modo"]
            resultado = procesar_importacion(
                filas=filas,
                columnas=columnas,
                entidad_solicitada=form.cleaned_data["entidad"],
                modo=modo,
                imagenes_por_referencia=imagenes,
                usuario=request.user,
            )
            if accion == "importar" and resultado.fallidas == 0 and not resultado.columnas_faltantes:
                messages.success(request, "Importación ejecutada correctamente.")
            elif accion == "validar":
                messages.info(request, "Validación completada. Revisa el preview antes de importar.")
        except ValueError as exc:
            messages.error(request, str(exc))

    context = {
        **admin.site.each_context(request),
        "title": "Importación masiva",
        "form": form,
        "resultado": resultado,
        "esquemas": ESQUEMAS_IMPORTACION,
    }
    return render(request, "admin/persistencia_django/importacion_masiva.html", context)


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
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
        'Target="worksheets/sheet1.xml"/></Relationships>'
    )
