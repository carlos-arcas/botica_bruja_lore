"""Rutas raíz para administración, APIs públicas y healthcheck."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def healthcheck(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("healthz", healthcheck, name="healthcheck"),
    path("admin/", admin.site.urls),
    path("api/v1/herbal/", include("backend.nucleo_herbal.presentacion.publica.urls")),
    path(
        "api/v1/rituales/",
        include("backend.nucleo_herbal.presentacion.publica.urls_rituales"),
    ),
]
