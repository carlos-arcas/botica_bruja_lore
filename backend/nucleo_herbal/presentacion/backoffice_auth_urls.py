"""Rutas de autenticación backoffice para clientes BFF."""

from django.urls import path

from .backoffice_auth_views import login_backoffice, logout_backoffice, sesion_backoffice

urlpatterns = [
    path("login/", login_backoffice, name="backoffice-auth-login"),
    path("session/", sesion_backoffice, name="backoffice-auth-session"),
    path("logout/", logout_backoffice, name="backoffice-auth-logout"),
]
