from __future__ import annotations

import csv
import io
import zipfile
from xml.sax.saxutils import escape

from django.http import HttpRequest, HttpResponse, HttpResponseNotAllowed, JsonResponse

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.esquemas import ESQUEMAS_IMPORTACION
from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    ArticuloEditorialModelo,
    ProductoModelo,
    RitualModelo,
    SeccionPublicaModelo,
)

from .auth import usuario_staff
from .shared import json_no_autorizado

MODULO_ENTIDAD = {
    "productos": "productos",
    "rituales": "rituales",
    "editorial": "articulos_editoriales",
    "secciones": "secciones_publicas",
}

COLUMNAS_PRODUCTOS_POR_SECCION = {
    "botica-natural": ["formato_peso", "uso", "planta_intencion", "notas_preparacion"],
    "velas-e-incienso": ["tipo", "aroma", "duracion_intensidad", "uso_ritual"],
    "minerales-y-energia": ["mineral", "tamano", "acabado", "uso_energia"],
    "herramientas-esotericas": ["tipo_herramienta", "material", "uso_ritual", "compatibilidades"],
}


def exportar_backoffice(request: HttpRequest, modulo: str) -> HttpResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)
    if modulo not in MODULO_ENTIDAD:
        return JsonResponse({"detalle": "Módulo inválido."}, status=404)

    tipo = request.GET.get("tipo", "inventario")
    formato = request.GET.get("formato", "csv")
    seccion = request.GET.get("seccion", "").strip()
    columnas = _columnas_modulo(modulo, seccion)
    filas = _filas_modulo(modulo, tipo, seccion)
    if formato == "csv":
        return _respuesta_csv(f"{modulo}-{tipo}.csv", columnas, filas)
    if formato == "xlsx":
        return _respuesta_xlsx(f"{modulo}-{tipo}.xlsx", columnas, filas)
    return JsonResponse({"detalle": "Formato inválido."}, status=400)


def _columnas_modulo(modulo: str, seccion: str) -> list[str]:
    entidad = MODULO_ENTIDAD[modulo]
    esquema = ESQUEMAS_IMPORTACION[entidad]
    columnas = list(esquema.todas_columnas)
    if modulo == "productos" and seccion in COLUMNAS_PRODUCTOS_POR_SECCION:
        columnas.extend(COLUMNAS_PRODUCTOS_POR_SECCION[seccion])
    return columnas


def _filas_modulo(modulo: str, tipo: str, seccion: str) -> list[dict[str, str]]:
    if tipo == "plantilla":
        return []
    if modulo == "productos":
        query = ProductoModelo.objects.all().order_by("nombre")
        if seccion:
            query = query.filter(seccion_publica=seccion)
        return [_fila_producto(item, seccion) for item in query[:300]]
    if modulo == "rituales":
        return [
            {
                "slug": item.slug,
                "nombre": item.nombre,
                "contexto_breve": item.contexto_breve,
                "contenido": item.contenido,
                "publicado": str(item.publicado).lower(),
                "imagen_url": item.imagen_url,
                "intenciones_relacionadas": ",".join(item.intenciones.values_list("slug", flat=True)),
            }
            for item in RitualModelo.objects.all().order_by("nombre")[:300]
        ]
    if modulo == "editorial":
        return [
            {
                "slug": item.slug,
                "titulo": item.titulo,
                "resumen": item.resumen,
                "contenido": item.contenido,
                "publicado": str(item.publicado).lower(),
                "indexable": str(item.indexable).lower(),
                "tema": item.tema,
                "hub": item.hub,
                "subhub": item.subhub,
                "seccion_publica": item.seccion_publica.slug if item.seccion_publica else "",
                "imagen_url": item.imagen_url,
            }
            for item in ArticuloEditorialModelo.objects.all().order_by("-fecha_actualizacion")[:300]
        ]
    return [
        {
            "slug": item.slug,
            "nombre": item.nombre,
            "publicada": str(item.publicada).lower(),
            "descripcion": item.descripcion,
            "orden": str(item.orden),
        }
        for item in SeccionPublicaModelo.objects.all().order_by("orden", "nombre")[:300]
    ]


def _fila_producto(item: ProductoModelo, seccion: str) -> dict[str, str]:
    fila = {
        "sku": item.sku,
        "slug": item.slug,
        "nombre": item.nombre,
        "tipo_producto": item.tipo_producto,
        "categoria_comercial": item.categoria_comercial,
        "seccion_publica": item.seccion_publica,
        "descripcion_corta": item.descripcion_corta,
        "precio_visible": item.precio_visible,
        "publicado": str(item.publicado).lower(),
        "imagen_url": item.imagen_url,
        "orden_publicacion": str(item.orden_publicacion),
    }
    if seccion and seccion == item.seccion_publica:
        fila.update(_detalles_producto_desde_tipo(item, seccion))
    return fila


def _detalles_producto_desde_tipo(item: ProductoModelo, seccion: str) -> dict[str, str]:
    if seccion == "botica-natural":
        return {"formato_peso": item.tipo_producto, "uso": item.categoria_comercial, "planta_intencion": "", "notas_preparacion": ""}
    if seccion == "velas-e-incienso":
        return {"tipo": item.tipo_producto, "aroma": item.categoria_comercial, "duracion_intensidad": "", "uso_ritual": ""}
    if seccion == "minerales-y-energia":
        return {"mineral": item.tipo_producto, "tamano": item.categoria_comercial, "acabado": "", "uso_energia": ""}
    if seccion == "herramientas-esotericas":
        return {"tipo_herramienta": item.tipo_producto, "material": item.categoria_comercial, "uso_ritual": "", "compatibilidades": ""}
    return {}


def _respuesta_csv(nombre: str, columnas: list[str], filas: list[dict[str, str]]) -> HttpResponse:
    salida = io.StringIO()
    writer = csv.DictWriter(salida, fieldnames=columnas)
    writer.writeheader()
    for fila in filas:
        writer.writerow({col: fila.get(col, "") for col in columnas})
    response = HttpResponse(salida.getvalue(), content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{nombre}"'
    return response


def _respuesta_xlsx(nombre: str, columnas: list[str], filas: list[dict[str, str]]) -> HttpResponse:
    contenido = _generar_xlsx(columnas, filas)
    response = HttpResponse(contenido, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response["Content-Disposition"] = f'attachment; filename="{nombre}"'
    return response


def _generar_xlsx(columnas: list[str], filas: list[dict[str, str]]) -> bytes:
    shared: list[str] = []
    idx_por_valor: dict[str, int] = {}

    def _idx(valor: str) -> int:
        if valor not in idx_por_valor:
            idx_por_valor[valor] = len(shared)
            shared.append(valor)
        return idx_por_valor[valor]

    filas_tabla = [columnas] + [[fila.get(c, "") for c in columnas] for fila in filas]
    row_nodes = []
    for row_num, row in enumerate(filas_tabla, start=1):
        cells = []
        for col_num, value in enumerate(row, start=1):
            col = chr(64 + col_num)
            cells.append(f'<c r="{col}{row_num}" t="s"><v>{_idx(str(value))}</v></c>')
        row_nodes.append(f'<row r="{row_num}">{"".join(cells)}</row>')

    sheet = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<sheetData>{"".join(row_nodes)}</sheetData></worksheet>'
    )
    sst_nodes = "".join(f"<si><t>{escape(s)}</t></si>" for s in shared)
    shared_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(shared)}" uniqueCount="{len(shared)}">{sst_nodes}</sst>'
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '</Types>'
    )
    workbook = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'
    )
    rels = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
        '</Relationships>'
    )
    data = io.BytesIO()
    with zipfile.ZipFile(data, "w") as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("xl/workbook.xml", workbook)
        zf.writestr("xl/_rels/workbook.xml.rels", rels)
        zf.writestr("xl/sharedStrings.xml", shared_xml)
        zf.writestr("xl/worksheets/sheet1.xml", sheet)
    return data.getvalue()
