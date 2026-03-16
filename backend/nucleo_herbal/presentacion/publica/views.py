"""Views HTTP mínimas para exposición pública del núcleo herbal."""

from datetime import date

from django.http import HttpRequest, JsonResponse
import logging

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...infraestructura.persistencia_django.mapeadores import a_producto
from ...infraestructura.persistencia_django.models import ArticuloEditorialModelo
from .dependencias import (
    construir_servicios_publicos_calendario_ritual,
    construir_servicios_publicos_herbales,
    construir_servicios_publicos_rituales,
)
from .respuestas_json import json_no_encontrado, json_validacion
from .serializadores import (
    serializar_consulta_calendario_ritual,
    serializar_planta_detalle,
    serializar_planta_resumen,
    serializar_producto_resumen,
    serializar_relacion_intencion,
    serializar_relacion_intencion_ritual,
    serializar_ritual_detalle,
    serializar_ritual_resumen,
)


logger = logging.getLogger(__name__)


def listado_herbal(request: HttpRequest) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    plantas = servicios.listado_herbal.ejecutar()
    return JsonResponse({"plantas": [serializar_planta_resumen(item) for item in plantas]})


def detalle_planta(request: HttpRequest, slug_planta: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        planta = servicios.detalle_planta.ejecutar(slug_planta)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse({"planta": serializar_planta_detalle(planta)})


def productos_por_planta(request: HttpRequest, slug_planta: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        productos = servicios.resolucion_comercial.ejecutar(slug_planta)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(
        {
            "planta_slug": slug_planta,
            "productos": [serializar_producto_resumen(item) for item in productos],
        }
    )




def listado_productos_por_seccion(request: HttpRequest, slug_seccion: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    filtros = {
        "beneficio": request.GET.get("beneficio", "").strip(),
        "formato": request.GET.get("formato", "").strip(),
        "modo_uso": request.GET.get("modo_uso", "").strip(),
        "precio_min": request.GET.get("precio_min", "").strip(),
        "precio_max": request.GET.get("precio_max", "").strip(),
    }
    productos = servicios.listado_productos_por_seccion.ejecutar(slug_seccion, filtros=filtros)
    logger.info(
        "listado_productos_por_seccion generado",
        extra={"seccion_slug": slug_seccion, "total_productos": len(productos), "filtros": filtros},
    )
    return JsonResponse(
        {
            "seccion_slug": slug_seccion,
            "filtros": filtros,
            "productos": [serializar_producto_resumen(item) for item in productos],
        }
    )

def detalle_producto_publico(request: HttpRequest, slug_producto: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        producto = servicios.detalle_producto.ejecutar(slug_producto)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse({"producto": serializar_producto_resumen(producto)})

def relaciones_por_intencion(request: HttpRequest, slug_intencion: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        relaciones = servicios.relaciones_por_intencion.ejecutar(slug_intencion)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(serializar_relacion_intencion(relaciones))


def rituales_por_planta(request: HttpRequest, slug_planta: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        rituales = servicios.rituales_por_planta.ejecutar(slug_planta)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(
        {
            "planta_slug": slug_planta,
            "rituales": [serializar_ritual_resumen(item) for item in rituales],
        }
    )


def listado_rituales(request: HttpRequest) -> JsonResponse:
    servicios = construir_servicios_publicos_rituales()
    rituales = servicios.listado_ritual.ejecutar()
    return JsonResponse({"rituales": [serializar_ritual_resumen(item) for item in rituales]})


def detalle_ritual(request: HttpRequest, slug_ritual: str) -> JsonResponse:
    servicios = construir_servicios_publicos_rituales()
    try:
        ritual = servicios.detalle_ritual.ejecutar(slug_ritual)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse({"ritual": serializar_ritual_detalle(ritual)})


def plantas_por_ritual(request: HttpRequest, slug_ritual: str) -> JsonResponse:
    servicios = construir_servicios_publicos_rituales()
    try:
        plantas = servicios.plantas_por_ritual.ejecutar(slug_ritual)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(
        {
            "ritual_slug": slug_ritual,
            "plantas": [serializar_planta_resumen(item) for item in plantas],
        }
    )


def productos_por_ritual(request: HttpRequest, slug_ritual: str) -> JsonResponse:
    servicios = construir_servicios_publicos_rituales()
    try:
        productos = servicios.productos_por_ritual.ejecutar(slug_ritual)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(
        {
            "ritual_slug": slug_ritual,
            "productos": [serializar_producto_resumen(item) for item in productos],
        }
    )


def rituales_por_intencion(request: HttpRequest, slug_intencion: str) -> JsonResponse:
    servicios = construir_servicios_publicos_rituales()
    try:
        relacion = servicios.rituales_por_intencion.ejecutar(slug_intencion)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(serializar_relacion_intencion_ritual(relacion))


def calendario_ritual_por_fecha(request: HttpRequest) -> JsonResponse:
    fecha_raw = request.GET.get("fecha", "").strip()
    if not fecha_raw:
        return json_validacion("El parámetro 'fecha' es obligatorio (YYYY-MM-DD).")
    try:
        fecha_consulta = date.fromisoformat(fecha_raw)
    except ValueError:
        return json_validacion("Formato de fecha inválido. Usa YYYY-MM-DD.")

    servicios = construir_servicios_publicos_calendario_ritual()
    try:
        consulta = servicios.consultar_por_fecha.ejecutar(fecha_consulta)
    except ErrorAplicacionLookup as error:
        return json_no_encontrado(str(error))
    return JsonResponse(serializar_consulta_calendario_ritual(consulta))


def listado_editorial_publico(request: HttpRequest) -> JsonResponse:
    articulos = ArticuloEditorialModelo.objects.filter(publicado=True).order_by("-fecha_publicacion", "-id")[:80]
    return JsonResponse({"articulos": [_serializar_articulo_publico(it) for it in articulos]})


def detalle_editorial_publico(request: HttpRequest, slug_articulo: str) -> JsonResponse:
    articulo = ArticuloEditorialModelo.objects.filter(slug=slug_articulo, publicado=True).first()
    if articulo is None:
        return json_no_encontrado("Artículo editorial no encontrado.")
    return JsonResponse({"articulo": _serializar_articulo_publico(articulo)})


def _serializar_articulo_publico(articulo: ArticuloEditorialModelo) -> dict:
    productos = [serializar_producto_resumen(a_producto(it)) for it in articulo.productos_relacionados.filter(publicado=True)]
    return {
        "slug": articulo.slug,
        "titulo": articulo.titulo,
        "resumen": articulo.resumen,
        "contenido": articulo.contenido,
        "tema": articulo.tema,
        "hub": articulo.hub,
        "subhub": articulo.subhub,
        "indexable": articulo.indexable,
        "fecha_publicacion": articulo.fecha_publicacion.isoformat() if articulo.fecha_publicacion else None,
        "productos_relacionados": productos,
    }
