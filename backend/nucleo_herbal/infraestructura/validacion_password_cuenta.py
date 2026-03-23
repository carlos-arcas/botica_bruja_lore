"""Adaptador Django para validación de contraseña de cuenta cliente."""

from __future__ import annotations

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from ..aplicacion.puertos.validador_password_cuenta_cliente import ValidadorPasswordCuentaCliente
from ..dominio.excepciones import ErrorDominio


class ValidadorPasswordCuentaClienteDjango(ValidadorPasswordCuentaCliente):
    def validar(self, *, password_plano: str, email: str, nombre_visible: str) -> None:
        if len(password_plano.strip()) < 8:
            raise ErrorDominio("La contraseña requiere al menos 8 caracteres.")
        try:
            validate_password(password_plano)
        except ValidationError as exc:
            raise ErrorDominio(" ".join(exc.messages)) from exc
        if email.strip().lower() in password_plano.strip().lower():
            raise ErrorDominio("La contraseña no puede incluir el email completo.")
        if nombre_visible.strip() and nombre_visible.strip().lower() in password_plano.strip().lower():
            raise ErrorDominio("La contraseña no puede incluir el nombre visible completo.")
