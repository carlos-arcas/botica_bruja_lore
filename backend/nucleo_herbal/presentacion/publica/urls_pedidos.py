"""Rutas públicas del checkout real v1."""

from django.urls import path

from . import views_pago_pedidos, views_pedidos

urlpatterns = [
    path("", views_pedidos.crear_pedido, name="publico-crear-pedido"),
    path("webhooks/stripe/", views_pago_pedidos.webhook_pago_stripe, name="publico-webhook-pago-stripe"),
    path("<str:id_pedido>/", views_pedidos.detalle_pedido, name="publico-detalle-pedido"),
    path("<str:id_pedido>/iniciar-pago/", views_pago_pedidos.iniciar_pago_pedido, name="publico-iniciar-pago-pedido"),
]
