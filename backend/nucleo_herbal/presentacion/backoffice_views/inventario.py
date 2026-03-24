from __future__ import annotations

import json

from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_inventario import AjustarInventarioProducto, ListarInventarioOperativo, ObtenerInventarioProducto, ObtenerMovimientosInventarioProducto
from ...dominio.excepciones import ErrorDominio
from ...infraestructura.persistencia_django.models_inventario import InventarioProductoModelo
from ...infraestructura.persistencia_django.repositorios_inventario import RepositorioInventarioORM, RepositorioMovimientosInventarioORM
from .auth import usuario_staff
from .shared import json_no_autorizado, operation_id, to_int


def listado_inventario_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)

    solo_bajo_stock = request.GET.get("solo_bajo_stock", "").strip().lower() == "true"
    query = request.GET.get("q", "").strip().lower()

    caso = ListarInventarioOperativo(repositorio_inventario=RepositorioInventarioORM())
    items = [_serializar_item_listado(item) for item in caso.ejecutar(solo_bajo_stock=solo_bajo_stock)]
    if query:
        items = [item for item in items if query in str(item["producto_nombre"]).lower()]
    return JsonResponse({"items": items, "metricas": {"total": len(items)}})


def detalle_inventario_backoffice(request: HttpRequest, producto_id: str) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)

    try:
        detalle = ObtenerInventarioProducto(repositorio_inventario=RepositorioInventarioORM()).ejecutar(producto_id)
        movimientos = ObtenerMovimientosInventarioProducto(
            repositorio_inventario=RepositorioInventarioORM(),
            repositorio_movimientos=RepositorioMovimientosInventarioORM(),
        ).ejecutar(id_producto=producto_id, limite=10)
    except ErrorAplicacionLookup as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id(request)}, status=404)

    return JsonResponse(
        {
            "item": _serializar_item_detalle(detalle),
            "movimientos": [_serializar_movimiento(movimiento) for movimiento in movimientos],
            "operation_id": operation_id(request),
        }
    )


@csrf_exempt
def ajustar_inventario_backoffice(request: HttpRequest, producto_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if usuario_staff(request) is None:
        return json_no_autorizado(request)

    payload = _leer_payload(request)
    try:
        delta = to_int(payload, "delta")
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id(request)}, status=400)

    try:
        item = AjustarInventarioProducto(
            repositorio_inventario=RepositorioInventarioORM(),
            repositorio_movimientos=RepositorioMovimientosInventarioORM(),
        ).ejecutar(id_producto=producto_id, delta=delta, operation_id=operation_id(request))
        movimientos = ObtenerMovimientosInventarioProducto(
            repositorio_inventario=RepositorioInventarioORM(),
            repositorio_movimientos=RepositorioMovimientosInventarioORM(),
        ).ejecutar(id_producto=producto_id, limite=10)
    except ErrorAplicacionLookup as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id(request)}, status=404)
    except ErrorDominio as exc:
        return JsonResponse({"detalle": str(exc), "operation_id": operation_id(request)}, status=400)

    return JsonResponse(
        {
            "item": _serializar_item_detalle(item),
            "movimientos": [_serializar_movimiento(movimiento) for movimiento in movimientos],
            "operation_id": operation_id(request),
        }
    )


def _resolver_producto_nombre(id_producto: str) -> str:
    inventario = InventarioProductoModelo.objects.select_related("producto").filter(producto_id=id_producto).only("producto__nombre").first()
    return inventario.producto.nombre if inventario else id_producto


def _serializar_item_listado(item) -> dict[str, object]:
    return {
        "id_producto": item.id_producto,
        "producto_nombre": _resolver_producto_nombre(item.id_producto),
        "unidad_base": item.unidad_base,
        "cantidad_disponible": item.cantidad_disponible,
        "umbral_bajo_stock": item.umbral_bajo_stock,
        "bajo_stock": item.bajo_stock,
        "fecha_actualizacion": item.fecha_actualizacion.isoformat() if item.fecha_actualizacion else None,
    }


def _serializar_item_detalle(item) -> dict[str, object]:
    payload = _serializar_item_listado(item)
    payload["fecha_creacion"] = item.fecha_creacion.isoformat() if item.fecha_creacion else None
    return payload


def _serializar_movimiento(movimiento) -> dict[str, object]:
    return {
        "tipo_movimiento": movimiento.tipo_movimiento,
        "cantidad": movimiento.cantidad,
        "unidad_base": movimiento.unidad_base,
        "fecha_creacion": movimiento.fecha_creacion.isoformat() if movimiento.fecha_creacion else None,
    }


def _leer_payload(request: HttpRequest) -> dict[str, object]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}
