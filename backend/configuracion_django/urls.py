"""Rutas raíz para administración y exposición pública del núcleo herbal."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/herbal/", include("backend.nucleo_herbal.presentacion.publica.urls")),
    path(
        "api/v1/rituales/",
        include("backend.nucleo_herbal.presentacion.publica.urls_rituales"),
    ),
]
