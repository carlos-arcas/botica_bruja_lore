"""Rutas públicas mínimas del núcleo herbal (Ciclo 1)."""

from django.urls import path

from . import views

urlpatterns = [
    path("plantas/", views.listado_herbal, name="publico-listado-herbal"),
    path("plantas/<slug:slug_planta>/", views.detalle_planta, name="publico-detalle-planta"),
    path(
        "plantas/<slug:slug_planta>/productos/",
        views.productos_por_planta,
        name="publico-productos-por-planta",
    ),
    path(
        "plantas/<slug:slug_planta>/rituales/",
        views.rituales_por_planta,
        name="publico-rituales-por-planta",
    ),
    path(
        "intenciones/<slug:slug_intencion>/plantas/",
        views.relaciones_por_intencion,
        name="publico-relaciones-por-intencion",
    ),
    path(
        "secciones/<slug:slug_seccion>/productos/",
        views.listado_productos_por_seccion,
        name="publico-listado-productos-por-seccion",
    ),
    path(
        "editorial/",
        views.listado_editorial_publico,
        name="publico-listado-editorial",
    ),
    path(
        "editorial/<slug:slug_articulo>/",
        views.detalle_editorial_publico,
        name="publico-detalle-editorial",
    ),
]
