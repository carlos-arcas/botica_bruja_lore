"""Rutas raíz mínimas para la exposición pública del núcleo herbal."""

from django.urls import include, path

urlpatterns = [
    path("api/v1/herbal/", include("backend.nucleo_herbal.presentacion.publica.urls")),
]
