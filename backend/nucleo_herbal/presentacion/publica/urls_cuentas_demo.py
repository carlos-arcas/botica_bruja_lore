"""Rutas públicas mínimas de API para cuenta demo."""

from django.urls import path

from . import views_cuentas_demo

urlpatterns = [
    path("registro/", views_cuentas_demo.registrar_cuenta_demo, name="publico-registro-cuenta-demo"),
    path(
        "autenticacion/",
        views_cuentas_demo.autenticar_cuenta_demo,
        name="publico-autenticacion-cuenta-demo",
    ),
    path("<str:id_usuario>/perfil/", views_cuentas_demo.perfil_cuenta_demo, name="publico-perfil-cuenta-demo"),
    path(
        "<str:id_usuario>/historial-pedidos/",
        views_cuentas_demo.historial_pedidos_demo_cuenta,
        name="publico-historial-cuenta-demo",
    ),
]
