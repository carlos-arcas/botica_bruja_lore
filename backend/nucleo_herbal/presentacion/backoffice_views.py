"""Endpoints HTTP del backoffice Next.js con control de acceso en backend."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass

from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo


@dataclass(frozen=True)
class ProductoAdminDTO:
    id: str
    sku: str
    slug: str
    nombre: str
    tipo_producto: str
    categoria_comercial: str
    seccion_publica: str
    precio_visible: str
    publicado: bool


def _es_staff(usuario) -> bool:
    return bool(usuario.is_authenticated and (usuario.is_staff or usuario.is_superuser))


def _json_no_autorizado() -> JsonResponse:
    return JsonResponse({"autorizado": False, "detalle": "Acceso restringido a staff."}, status=403)


def _serializar_producto_admin(producto: ProductoModelo) -> dict[str, object]:
    return asdict(
        ProductoAdminDTO(
            id=producto.id,
            sku=producto.sku,
            slug=producto.slug,
            nombre=producto.nombre,
            tipo_producto=producto.tipo_producto,
            categoria_comercial=producto.categoria_comercial,
            seccion_publica=producto.seccion_publica,
            precio_visible=producto.precio_visible,
            publicado=producto.publicado,
        )
    )


def _construir_queryset_productos(request: HttpRequest):
    queryset = ProductoModelo.objects.all().order_by("nombre")
    busqueda = request.GET.get("q", "").strip()
    publicado = request.GET.get("publicado", "").strip().lower()
    seccion = request.GET.get("seccion", "").strip()
    tipo = request.GET.get("tipo", "").strip()

    if busqueda:
        queryset = queryset.filter(nombre__icontains=busqueda)
    if publicado in {"true", "false"}:
        queryset = queryset.filter(publicado=(publicado == "true"))
    if seccion:
        queryset = queryset.filter(seccion_publica=seccion)
    if tipo:
        queryset = queryset.filter(tipo_producto=tipo)

    return queryset, busqueda, publicado, seccion, tipo


@login_required
@user_passes_test(_es_staff, login_url="/admin/login/")
def estado_backoffice(request: HttpRequest) -> JsonResponse:
    usuario = request.user
    return JsonResponse(
        {
            "autorizado": True,
            "usuario": {
                "username": usuario.get_username(),
                "is_staff": bool(usuario.is_staff),
                "is_superuser": bool(usuario.is_superuser),
            },
        }
    )


@login_required
@user_passes_test(_es_staff, login_url="/admin/login/")
def listado_productos_backoffice(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    queryset, busqueda, publicado, seccion, tipo = _construir_queryset_productos(request)
    productos = [_serializar_producto_admin(item) for item in queryset[:120]]

    return JsonResponse(
        {
            "productos": productos,
            "filtros": {
                "q": busqueda,
                "publicado": publicado,
                "seccion": seccion,
                "tipo": tipo,
            },
            "metricas": {
                "total": queryset.count(),
                "publicados": queryset.filter(publicado=True).count(),
                "borrador": queryset.filter(publicado=False).count(),
            },
        }
    )


@csrf_exempt
@login_required
@user_passes_test(_es_staff, login_url="/admin/login/")
def cambiar_publicacion_producto_backoffice(request: HttpRequest, producto_id: str) -> JsonResponse:
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detalle": "Payload JSON inválido."}, status=400)

    publicar = payload.get("publicado")
    if not isinstance(publicar, bool):
        return JsonResponse({"detalle": "El campo 'publicado' debe ser booleano."}, status=400)

    try:
        producto = ProductoModelo.objects.get(id=producto_id)
    except ProductoModelo.DoesNotExist:
        return JsonResponse({"detalle": "Producto no encontrado."}, status=404)

    producto.publicado = publicar
    producto.save(update_fields=["publicado"])

    return JsonResponse({"producto": _serializar_producto_admin(producto)})
