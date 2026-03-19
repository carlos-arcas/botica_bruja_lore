"""Rutas públicas de cuenta real de cliente."""

from django.urls import path

from . import views_cuentas_cliente

urlpatterns = [
    path("registro/", views_cuentas_cliente.registrar_cuenta_cliente, name="publico-registro-cuenta-cliente"),
    path("login/", views_cuentas_cliente.login_cuenta_cliente, name="publico-login-cuenta-cliente"),
    path("logout/", views_cuentas_cliente.logout_cuenta_cliente, name="publico-logout-cuenta-cliente"),
    path("sesion/", views_cuentas_cliente.sesion_actual_cuenta_cliente, name="publico-sesion-cuenta-cliente"),
    path("pedidos/", views_cuentas_cliente.pedidos_cuenta_cliente, name="publico-pedidos-cuenta-cliente"),
    path("pedidos/<str:id_pedido>/", views_cuentas_cliente.detalle_pedido_cuenta_cliente, name="publico-detalle-pedido-cuenta-cliente"),
]
