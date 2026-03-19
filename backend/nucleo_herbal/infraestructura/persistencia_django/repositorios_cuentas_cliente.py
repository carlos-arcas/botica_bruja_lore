"""Repositorio ORM para la cuenta real de cliente."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q

from ...aplicacion.puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from ...dominio.cuentas_cliente import CuentaCliente, CredencialesCuentaCliente
from ...dominio.excepciones import ErrorDominio
from .mapeadores import a_cuenta_cliente
from .models import CuentaClienteModelo

User = get_user_model()


class RepositorioCuentasClienteORM(RepositorioCuentasCliente):
    @transaction.atomic
    def registrar(self, *, email: str, nombre_visible: str, password_plano: str) -> CuentaCliente:
        email_normalizado = email.strip().lower()
        if CuentaClienteModelo.objects.filter(email__iexact=email_normalizado).exists():
            raise ErrorDominio("Ya existe una cuenta real para ese email.")
        usuario = User.objects.create_user(
            username=email_normalizado,
            email=email_normalizado,
            password=password_plano,
            is_active=True,
        )
        modelo = CuentaClienteModelo.objects.create(
            usuario=usuario,
            email=email_normalizado,
            nombre_visible=nombre_visible.strip(),
        )
        return a_cuenta_cliente(modelo)

    def autenticar(self, credenciales: CredencialesCuentaCliente) -> CuentaCliente | None:
        modelo = self._obtener_modelo_por_email(credenciales.email)
        if modelo is None or not modelo.usuario.check_password(credenciales.password_plano):
            return None
        if not modelo.usuario.is_active:
            return None
        return a_cuenta_cliente(modelo)

    def obtener_por_email(self, email: str) -> CuentaCliente | None:
        modelo = self._obtener_modelo_por_email(email)
        return None if modelo is None else a_cuenta_cliente(modelo)

    def obtener_por_id_usuario(self, id_usuario: str) -> CuentaCliente | None:
        modelo = (
            CuentaClienteModelo.objects.select_related("usuario")
            .filter(usuario_id=id_usuario.strip())
            .first()
        )
        return None if modelo is None else a_cuenta_cliente(modelo)

    def _obtener_modelo_por_email(self, email: str) -> CuentaClienteModelo | None:
        email_normalizado = email.strip().lower()
        return (
            CuentaClienteModelo.objects.select_related("usuario")
            .filter(Q(email__iexact=email_normalizado) | Q(usuario__email__iexact=email_normalizado))
            .first()
        )
