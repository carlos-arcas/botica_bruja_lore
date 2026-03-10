"""Rutas públicas mínimas para cuenta demo (Ciclo 4 / Prompt 3)."""

from django.urls import path

from . import views_cuentas_demo

urlpatterns = [
    path("registro/", views_cuentas_demo.registrar_cuenta_demo, name="publico-registro-cuenta-demo"),
    path("autenticacion/", views_cuentas_demo.autenticar_cuenta_demo, name="publico-autenticar-cuenta-demo"),
    path("<str:id_usuario>/perfil/", views_cuentas_demo.perfil_cuenta_demo, name="publico-perfil-cuenta-demo"),
    path("<str:id_usuario>/pedidos-demo/", views_cuentas_demo.historial_cuenta_demo, name="publico-historial-cuenta-demo"),
]
