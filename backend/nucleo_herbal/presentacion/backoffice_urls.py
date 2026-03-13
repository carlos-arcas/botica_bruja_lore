"""Rutas API del backoffice seguro para Next.js."""

from django.urls import path

from .backoffice_views import (
    cambiar_publicacion_producto_backoffice,
    estado_backoffice,
    listado_productos_backoffice,
)

urlpatterns = [
    path("estado/", estado_backoffice, name="backoffice-estado"),
    path("productos/", listado_productos_backoffice, name="backoffice-productos"),
    path(
        "productos/<str:producto_id>/publicacion/",
        cambiar_publicacion_producto_backoffice,
        name="backoffice-producto-publicacion",
    ),
]
