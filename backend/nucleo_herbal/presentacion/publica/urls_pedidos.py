"""Rutas públicas del checkout real v1."""

from django.urls import path

from . import views_pedidos

urlpatterns = [
    path("", views_pedidos.crear_pedido, name="publico-crear-pedido"),
    path("<str:id_pedido>/", views_pedidos.detalle_pedido, name="publico-detalle-pedido"),
]
