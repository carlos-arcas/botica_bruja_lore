"""Rutas públicas mínimas del flujo demo de pedido."""

from django.urls import path

from . import views_pedidos_demo

urlpatterns = [
    path("", views_pedidos_demo.crear_pedido_demo, name="publico-crear-pedido-demo"),
    path("<str:id_pedido>/", views_pedidos_demo.detalle_pedido_demo, name="publico-detalle-pedido-demo"),
]
