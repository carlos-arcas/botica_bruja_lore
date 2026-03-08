"""Rutas públicas mínimas de rituales conectados (Ciclo 2)."""

from django.urls import path

from . import views

urlpatterns = [
    path("", views.listado_rituales, name="publico-listado-rituales"),
    path("<slug:slug_ritual>/", views.detalle_ritual, name="publico-detalle-ritual"),
    path(
        "<slug:slug_ritual>/plantas/",
        views.plantas_por_ritual,
        name="publico-plantas-por-ritual",
    ),
    path(
        "<slug:slug_ritual>/productos/",
        views.productos_por_ritual,
        name="publico-productos-por-ritual",
    ),
    path(
        "intenciones/<slug:slug_intencion>/",
        views.rituales_por_intencion,
        name="publico-rituales-por-intencion",
    ),
]
