"""Rutas públicas del checkout real v1."""

from django.urls import path

from . import views_pago_pedidos, views_pedidos

urlpatterns = [
    path("envio-estandar/", views_pedidos.detalle_envio_estandar, name="publico-detalle-envio-estandar"),
    path("", views_pedidos.crear_pedido, name="publico-crear-pedido"),
    path("webhooks/stripe/", views_pago_pedidos.webhook_pago_stripe, name="publico-webhook-pago-stripe"),
    path("retorno/<str:id_pedido>/success/", views_pago_pedidos.retorno_pago_success, name="publico-retorno-pago-success"),
    path("retorno/<str:id_pedido>/cancel/", views_pago_pedidos.retorno_pago_cancel, name="publico-retorno-pago-cancel"),
    path("<str:id_pedido>/", views_pedidos.detalle_pedido, name="publico-detalle-pedido"),
    path("<str:id_pedido>/documento/", views_pedidos.documento_pedido_descargable, name="publico-documento-pedido"),
    path("<str:id_pedido>/iniciar-pago/", views_pago_pedidos.iniciar_pago_pedido, name="publico-iniciar-pago-pedido"),
    path("<str:id_pedido>/confirmar-pago-simulado/", views_pago_pedidos.confirmar_pago_simulado_pedido, name="publico-confirmar-pago-simulado"),
]
