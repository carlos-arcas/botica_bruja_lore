"""Views HTTP mínimas para exposición pública del núcleo herbal."""

from django.http import HttpRequest, JsonResponse

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from .dependencias import construir_servicios_publicos_herbales
from .serializadores import (
    serializar_planta_detalle,
    serializar_planta_resumen,
    serializar_producto_resumen,
    serializar_relacion_intencion,
)


def listado_herbal(request: HttpRequest) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    plantas = servicios.listado_herbal.ejecutar()
    return JsonResponse({"plantas": [serializar_planta_resumen(item) for item in plantas]})


def detalle_planta(request: HttpRequest, slug_planta: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        planta = servicios.detalle_planta.ejecutar(slug_planta)
    except ErrorAplicacionLookup as error:
        return _json_no_encontrado(str(error))
    return JsonResponse({"planta": serializar_planta_detalle(planta)})


def productos_por_planta(request: HttpRequest, slug_planta: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        productos = servicios.resolucion_comercial.ejecutar(slug_planta)
    except ErrorAplicacionLookup as error:
        return _json_no_encontrado(str(error))
    return JsonResponse(
        {
            "planta_slug": slug_planta,
            "productos": [serializar_producto_resumen(item) for item in productos],
        }
    )


def relaciones_por_intencion(request: HttpRequest, slug_intencion: str) -> JsonResponse:
    servicios = construir_servicios_publicos_herbales()
    try:
        relaciones = servicios.relaciones_por_intencion.ejecutar(slug_intencion)
    except ErrorAplicacionLookup as error:
        return _json_no_encontrado(str(error))
    return JsonResponse(serializar_relacion_intencion(relaciones))


def _json_no_encontrado(detalle: str) -> JsonResponse:
    return JsonResponse({"detalle": detalle}, status=404)
