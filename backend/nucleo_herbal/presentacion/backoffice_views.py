from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime

from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.lectores import leer_tabla
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import procesar_importacion
from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    ArticuloEditorialModelo,
    ImportacionFilaModelo,
    ImportacionLoteModelo,
    ProductoModelo,
    RitualModelo,
    SeccionPublicaModelo,
)
from backend.nucleo_herbal.presentacion.backoffice_auth import resolver_usuario_backoffice

LOGGER = logging.getLogger(__name__)


def _json_no_autorizado() -> JsonResponse:
    return JsonResponse({"autorizado": False, "detalle": "Acceso restringido a staff."}, status=403)


def _usuario_staff(request: HttpRequest):
    usuario = resolver_usuario_backoffice(request)
    return usuario if usuario and usuario.is_staff and usuario.is_active else None


def _json_payload(request: HttpRequest) -> dict:
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("Payload JSON inválido.") from exc


def estado_backoffice(request: HttpRequest) -> JsonResponse:
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    return JsonResponse({"autorizado": True, "usuario": {"username": usuario.username, "is_staff": True, "is_superuser": bool(usuario.is_superuser)}})


def _to_bool(data: dict, campo: str, default: bool = False) -> bool:
    valor = data.get(campo, default)
    if isinstance(valor, bool):
        return valor
    raise ValueError(f"El campo '{campo}' debe ser booleano.")


def _to_int(data: dict, campo: str, default: int = 0) -> int:
    try:
        return int(data.get(campo, default))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"El campo '{campo}' debe ser numérico.") from exc


def _producto_dict(obj: ProductoModelo) -> dict:
    return {
        "id": obj.id,
        "sku": obj.sku,
        "slug": obj.slug,
        "nombre": obj.nombre,
        "tipo_producto": obj.tipo_producto,
        "categoria_comercial": obj.categoria_comercial,
        "seccion_publica": obj.seccion_publica,
        "descripcion_corta": obj.descripcion_corta,
        "precio_visible": obj.precio_visible,
        "imagen_url": obj.imagen_url,
        "publicado": obj.publicado,
        "orden_publicacion": obj.orden_publicacion,
    }


def listado_productos_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    q = request.GET.get("q", "").strip()
    publicado = request.GET.get("publicado", "").strip().lower()
    queryset = ProductoModelo.objects.all().order_by("nombre")
    if q:
        queryset = queryset.filter(Q(nombre__icontains=q) | Q(sku__icontains=q) | Q(slug__icontains=q))
    if publicado in {"true", "false"}:
        queryset = queryset.filter(publicado=(publicado == "true"))
    if request.GET.get("seccion", ""):
        queryset = queryset.filter(seccion_publica=request.GET["seccion"])
    if request.GET.get("tipo", ""):
        queryset = queryset.filter(tipo_producto=request.GET["tipo"])
    return JsonResponse({"items": [_producto_dict(it) for it in queryset[:120]], "metricas": {"total": queryset.count()}})


@csrf_exempt
def guardar_producto_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    try:
        data = _json_payload(request)
        slug = data.get("slug", "").strip()
        sku = data.get("sku", "").strip()
        if not slug or not sku:
            raise ValueError("Producto requiere slug y sku.")
        existente = ProductoModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        defaults = {
            "sku": sku,
            "nombre": data.get("nombre", "").strip(),
            "tipo_producto": data.get("tipo_producto", "").strip(),
            "categoria_comercial": data.get("categoria_comercial", "").strip(),
            "seccion_publica": data.get("seccion_publica", "").strip(),
            "descripcion_corta": data.get("descripcion_corta", "").strip(),
            "precio_visible": data.get("precio_visible", "").strip(),
            "imagen_url": data.get("imagen_url", "").strip(),
            "publicado": _to_bool(data, "publicado"),
            "orden_publicacion": _to_int(data, "orden_publicacion", 100),
        }
        if existente:
            for k, v in defaults.items():
                setattr(existente, k, v)
            existente.slug = slug
            existente.save()
            obj = existente
        else:
            obj = ProductoModelo.objects.create(id=str(uuid.uuid4()), slug=slug, **defaults)
        LOGGER.info("backoffice_producto_guardado", extra={"usuario": usuario.username, "producto": obj.id})
        return JsonResponse({"item": _producto_dict(obj)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def cambiar_publicacion_producto_backoffice(request: HttpRequest, producto_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    try:
        payload = _json_payload(request)
        publicar = _to_bool(payload, "publicado")
        producto = ProductoModelo.objects.get(id=producto_id)
        producto.publicado = publicar
        producto.save(update_fields=["publicado"])
        LOGGER.info("backoffice_producto_publicacion", extra={"usuario": usuario.username, "producto": producto.id, "publicado": publicar})
        return JsonResponse({"item": _producto_dict(producto)})
    except ProductoModelo.DoesNotExist:
        return JsonResponse({"detalle": "Producto no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


def _ritual_dict(obj: RitualModelo) -> dict:
    return {
        "id": obj.id,
        "slug": obj.slug,
        "nombre": obj.nombre,
        "contexto_breve": obj.contexto_breve,
        "contenido": obj.contenido,
        "imagen_url": obj.imagen_url,
        "publicado": obj.publicado,
    }


def listado_rituales_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    q = request.GET.get("q", "").strip()
    queryset = RitualModelo.objects.all().order_by("nombre")
    if q:
        queryset = queryset.filter(Q(nombre__icontains=q) | Q(slug__icontains=q))
    return JsonResponse({"items": [_ritual_dict(it) for it in queryset[:120]]})


@csrf_exempt
def guardar_ritual_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    try:
        data = _json_payload(request)
        slug = data.get("slug", "").strip()
        if not slug:
            raise ValueError("Ritual requiere slug.")
        existente = RitualModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        defaults = {
            "nombre": data.get("nombre", "").strip(),
            "contexto_breve": data.get("contexto_breve", "").strip(),
            "contenido": data.get("contenido", "").strip(),
            "imagen_url": data.get("imagen_url", "").strip(),
            "publicado": _to_bool(data, "publicado"),
        }
        obj = existente or RitualModelo(id=str(uuid.uuid4()))
        obj.slug = slug
        for k, v in defaults.items():
            setattr(obj, k, v)
        obj.save()
        LOGGER.info("backoffice_ritual_guardado", extra={"usuario": usuario.username, "ritual": obj.id})
        return JsonResponse({"item": _ritual_dict(obj)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def cambiar_publicacion_ritual_backoffice(request: HttpRequest, ritual_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    try:
        payload = _json_payload(request)
        ritual = RitualModelo.objects.get(id=ritual_id)
        ritual.publicado = _to_bool(payload, "publicado")
        ritual.save(update_fields=["publicado"])
        return JsonResponse({"item": _ritual_dict(ritual)})
    except RitualModelo.DoesNotExist:
        return JsonResponse({"detalle": "Ritual no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


def _articulo_dict(obj: ArticuloEditorialModelo) -> dict:
    return {
        "id": obj.id,
        "slug": obj.slug,
        "titulo": obj.titulo,
        "resumen": obj.resumen,
        "contenido": obj.contenido,
        "tema": obj.tema,
        "hub": obj.hub,
        "subhub": obj.subhub,
        "imagen_url": obj.imagen_url,
        "indexable": obj.indexable,
        "publicado": obj.publicado,
        "seccion_publica": obj.seccion_publica.slug if obj.seccion_publica else "",
    }


def listado_editorial_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    q = request.GET.get("q", "").strip()
    queryset = ArticuloEditorialModelo.objects.all().order_by("-fecha_actualizacion")
    if q:
        queryset = queryset.filter(Q(titulo__icontains=q) | Q(slug__icontains=q))
    return JsonResponse({"items": [_articulo_dict(it) for it in queryset[:120]]})


@csrf_exempt
def guardar_editorial_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    try:
        data = _json_payload(request)
        slug = data.get("slug", "").strip()
        if not slug:
            raise ValueError("Editorial requiere slug.")
        seccion = None
        if data.get("seccion_publica"):
            seccion = SeccionPublicaModelo.objects.filter(slug=data["seccion_publica"]).first()
            if not seccion:
                raise ValueError("Sección pública no encontrada.")
        existente = ArticuloEditorialModelo.objects.filter(id=data.get("id")).first() if data.get("id") else None
        obj = existente or ArticuloEditorialModelo()
        obj.slug = slug
        obj.titulo = data.get("titulo", "").strip()
        obj.resumen = data.get("resumen", "").strip()
        obj.contenido = data.get("contenido", "").strip()
        obj.tema = data.get("tema", "").strip()
        obj.hub = data.get("hub", "").strip()
        obj.subhub = data.get("subhub", "").strip()
        obj.imagen_url = data.get("imagen_url", "").strip()
        obj.indexable = _to_bool(data, "indexable", True)
        obj.publicado = _to_bool(data, "publicado")
        obj.seccion_publica = seccion
        if obj.publicado and not obj.fecha_publicacion:
            obj.fecha_publicacion = timezone.now()
        obj.save()
        LOGGER.info("backoffice_editorial_guardado", extra={"usuario": usuario.username, "articulo": obj.id})
        return JsonResponse({"item": _articulo_dict(obj)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def cambiar_publicacion_editorial_backoffice(request: HttpRequest, articulo_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    try:
        payload = _json_payload(request)
        articulo = ArticuloEditorialModelo.objects.get(id=articulo_id)
        articulo.publicado = _to_bool(payload, "publicado")
        articulo.fecha_publicacion = timezone.now() if articulo.publicado else None
        articulo.save(update_fields=["publicado", "fecha_publicacion"])
        return JsonResponse({"item": _articulo_dict(articulo)})
    except ArticuloEditorialModelo.DoesNotExist:
        return JsonResponse({"detalle": "Artículo no encontrado."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


def _seccion_dict(obj: SeccionPublicaModelo) -> dict:
    return {"id": obj.id, "slug": obj.slug, "nombre": obj.nombre, "descripcion": obj.descripcion, "orden": obj.orden, "publicada": obj.publicada}


def listado_secciones_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    q = request.GET.get("q", "").strip()
    queryset = SeccionPublicaModelo.objects.all().order_by("orden", "nombre")
    if q:
        queryset = queryset.filter(Q(nombre__icontains=q) | Q(slug__icontains=q))
    return JsonResponse({"items": [_seccion_dict(it) for it in queryset[:120]]})


@csrf_exempt
def guardar_seccion_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    try:
        data = _json_payload(request)
        slug = data.get("slug", "").strip()
        if not slug:
            raise ValueError("Sección requiere slug.")
        seccion = SeccionPublicaModelo.objects.filter(id=data.get("id")).first() if data.get("id") else SeccionPublicaModelo()
        seccion.slug = slug
        seccion.nombre = data.get("nombre", "").strip()
        seccion.descripcion = data.get("descripcion", "").strip()
        seccion.orden = _to_int(data, "orden", 100)
        seccion.publicada = _to_bool(data, "publicada")
        seccion.save()
        LOGGER.info("backoffice_seccion_guardada", extra={"usuario": usuario.username, "seccion": seccion.id})
        return JsonResponse({"item": _seccion_dict(seccion)})
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def cambiar_publicacion_seccion_backoffice(request: HttpRequest, seccion_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    if _usuario_staff(request) is None:
        return _json_no_autorizado()
    try:
        payload = _json_payload(request)
        seccion = SeccionPublicaModelo.objects.get(id=seccion_id)
        seccion.publicada = _to_bool(payload, "publicado")
        seccion.save(update_fields=["publicada"])
        return JsonResponse({"item": _seccion_dict(seccion)})
    except SeccionPublicaModelo.DoesNotExist:
        return JsonResponse({"detalle": "Sección no encontrada."}, status=404)
    except ValueError as exc:
        return JsonResponse({"detalle": str(exc)}, status=400)


@csrf_exempt
def crear_lote_importacion_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    archivo = request.FILES.get("archivo")
    if archivo is None:
        return JsonResponse({"detalle": "Archivo requerido."}, status=400)
    entidad = (request.POST.get("entidad") or "").strip()
    modo = (request.POST.get("modo") or "crear_actualizar").strip()
    columnas, filas = leer_tabla(archivo)
    lote = ImportacionLoteModelo.objects.create(entidad=entidad, modo=modo, nombre_archivo=archivo.name, columnas_detectadas=columnas, total_filas=len(filas), usuario=usuario)
    for indice, row in enumerate(filas, start=2):
        eval = procesar_importacion([row], columnas, entidad, "solo_validar", {}, usuario)
        errores = [e.motivo for e in eval.errores]
        warnings = ["Fila existente, en solo crear será ignorada."] if eval.ignoradas else []
        estado = ImportacionFilaModelo.ESTADO_INVALIDA if errores else (ImportacionFilaModelo.ESTADO_WARNING if warnings else ImportacionFilaModelo.ESTADO_VALIDA)
        ImportacionFilaModelo.objects.create(lote=lote, numero_fila_original=indice, datos=row, errores=errores, warnings=warnings, estado=estado, seleccionado=estado != ImportacionFilaModelo.ESTADO_INVALIDA, imagen=row.get("imagen_url", ""))
    LOGGER.info("backoffice_importacion_lote_creado", extra={"usuario": usuario.username, "lote": lote.id})
    return JsonResponse({"lote_id": lote.id})


def detalle_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    filas = []
    for fila in lote.filas.all():
        filas.append({"id": fila.id, "numero": fila.numero_fila_original, "datos": fila.datos, "errores": fila.errores, "warnings": fila.warnings, "estado": fila.estado, "seleccionado": fila.seleccionado})
    return JsonResponse({"lote": {"id": lote.id, "entidad": lote.entidad, "modo": lote.modo, "archivo": lote.nombre_archivo}, "filas": filas})


@csrf_exempt
def confirmar_lote_importacion_backoffice(request: HttpRequest, lote_id: int) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    usuario = _usuario_staff(request)
    if usuario is None:
        return _json_no_autorizado()
    lote = ImportacionLoteModelo.objects.filter(id=lote_id, usuario=usuario).first()
    if lote is None:
        return JsonResponse({"detalle": "Lote no encontrado."}, status=404)
    payload = _json_payload(request)
    ids = set(payload.get("filas_ids") or [])
    filas = lote.filas.exclude(estado=ImportacionFilaModelo.ESTADO_CONFIRMADA)
    if ids:
        filas = filas.filter(id__in=ids)
    confirmadas = 0
    for fila in filas:
        row = dict(fila.datos)
        if fila.imagen:
            row["imagen_url"] = fila.imagen
        resultado = procesar_importacion([row], lote.columnas_detectadas, lote.entidad, lote.modo, {}, usuario)
        if resultado.fallidas:
            fila.estado = ImportacionFilaModelo.ESTADO_INVALIDA
            fila.resultado_confirmacion = resultado.errores[0].motivo
        else:
            fila.estado = ImportacionFilaModelo.ESTADO_CONFIRMADA
            fila.resultado_confirmacion = f"ok c={resultado.creadas} a={resultado.actualizadas} i={resultado.ignoradas}"
            confirmadas += 1
        fila.save(update_fields=["estado", "resultado_confirmacion"])
    LOGGER.info("backoffice_importacion_confirmada", extra={"usuario": usuario.username, "lote": lote.id, "confirmadas": confirmadas})
    return JsonResponse({"confirmadas": confirmadas})
