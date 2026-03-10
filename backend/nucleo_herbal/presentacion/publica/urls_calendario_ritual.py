"""Rutas públicas mínimas del calendario ritual (Ciclo 5)."""

from django.urls import path

from . import views

urlpatterns = [
    path("", views.calendario_ritual_por_fecha, name="publico-calendario-ritual-por-fecha"),
]
