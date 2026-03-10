"""Rutas raíz para administración, APIs públicas y healthcheck."""

from django.contrib import admin
from django.db import connections
from django.db.utils import DatabaseError
from django.http import JsonResponse
from django.urls import include, path


def healthcheck(_request):
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        return JsonResponse({"status": "error", "database": "unavailable"}, status=503)
    return JsonResponse({"status": "ok", "database": "available"})


urlpatterns = [
    path("healthz", healthcheck, name="healthcheck"),
    path("admin/", admin.site.urls),
    path("api/v1/herbal/", include("backend.nucleo_herbal.presentacion.publica.urls")),
    path(
        "api/v1/rituales/",
        include("backend.nucleo_herbal.presentacion.publica.urls_rituales"),
    ),
    path(
        "api/v1/pedidos-demo/",
        include("backend.nucleo_herbal.presentacion.publica.urls_pedidos_demo"),
    ),
]
