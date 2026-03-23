"""Repositorio ORM para la cuenta real de cliente."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from ...aplicacion.puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from ...dominio.cuentas_cliente import CuentaCliente, CredencialesCuentaCliente
from ...dominio.excepciones import ErrorDominio
from .mapeadores import (
    a_cuenta_cliente,
    a_solicitud_recuperacion_password,
    a_solicitud_verificacion_email,
)
from .models import (
    CuentaClienteModelo,
    RecuperacionPasswordCuentaClienteModelo,
    VerificacionEmailCuentaClienteModelo,
)

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

    @transaction.atomic
    def crear_solicitud_verificacion(self, *, id_usuario: str, token_hash: str, expira_en):
        cuenta = self._obtener_cuenta_modelo(id_usuario)
        solicitud, _ = VerificacionEmailCuentaClienteModelo.objects.update_or_create(
            cuenta=cuenta,
            defaults={"token_hash": token_hash, "expira_en": expira_en, "fecha_confirmacion": None},
        )
        return a_solicitud_verificacion_email(solicitud)

    def obtener_solicitud_por_token_hash(self, token_hash: str):
        modelo = (
            VerificacionEmailCuentaClienteModelo.objects.select_related("cuenta", "cuenta__usuario")
            .filter(token_hash=token_hash)
            .first()
        )
        return None if modelo is None else a_solicitud_verificacion_email(modelo)

    def obtener_solicitud_activa_por_usuario(self, id_usuario: str):
        modelo = (
            VerificacionEmailCuentaClienteModelo.objects.select_related("cuenta", "cuenta__usuario")
            .filter(cuenta__usuario_id=id_usuario.strip())
            .first()
        )
        return None if modelo is None else a_solicitud_verificacion_email(modelo)

    @transaction.atomic
    def marcar_email_verificado(self, *, id_usuario: str, token_hash: str) -> CuentaCliente | None:
        cuenta = self._obtener_cuenta_modelo_opcional(id_usuario)
        if cuenta is None:
            return None
        solicitud = (
            VerificacionEmailCuentaClienteModelo.objects.select_related("cuenta")
            .filter(cuenta=cuenta, token_hash=token_hash)
            .first()
        )
        if solicitud is None:
            return None
        cuenta.email_verificado = True
        cuenta.save(update_fields=["email_verificado", "fecha_actualizacion"])
        solicitud.fecha_confirmacion = timezone.now()
        solicitud.save(update_fields=["fecha_confirmacion", "fecha_envio"])
        return a_cuenta_cliente(cuenta)

    @transaction.atomic
    def crear_solicitud_recuperacion_password(self, *, id_usuario: str, token_hash: str, expira_en):
        cuenta = self._obtener_cuenta_modelo(id_usuario)
        RecuperacionPasswordCuentaClienteModelo.objects.filter(cuenta=cuenta, fecha_uso__isnull=True).delete()
        solicitud = RecuperacionPasswordCuentaClienteModelo.objects.create(
            cuenta=cuenta,
            token_hash=token_hash,
            expira_en=expira_en,
        )
        return a_solicitud_recuperacion_password(solicitud)

    def obtener_solicitud_recuperacion_por_token_hash(self, token_hash: str):
        modelo = (
            RecuperacionPasswordCuentaClienteModelo.objects.select_related("cuenta", "cuenta__usuario")
            .filter(token_hash=token_hash)
            .first()
        )
        return None if modelo is None else a_solicitud_recuperacion_password(modelo)

    @transaction.atomic
    def actualizar_password(self, *, id_usuario: str, password_plano: str, token_hash: str) -> CuentaCliente | None:
        cuenta = self._obtener_cuenta_modelo_opcional(id_usuario)
        if cuenta is None:
            return None
        solicitud = (
            RecuperacionPasswordCuentaClienteModelo.objects.select_related("cuenta", "cuenta__usuario")
            .filter(cuenta=cuenta, token_hash=token_hash)
            .first()
        )
        if solicitud is None or solicitud.fecha_uso is not None:
            return None
        cuenta.usuario.set_password(password_plano)
        cuenta.usuario.save(update_fields=["password"])
        solicitud.fecha_uso = timezone.now()
        solicitud.save(update_fields=["fecha_uso", "fecha_envio"])
        return a_cuenta_cliente(cuenta)

    def _obtener_modelo_por_email(self, email: str) -> CuentaClienteModelo | None:
        email_normalizado = email.strip().lower()
        return (
            CuentaClienteModelo.objects.select_related("usuario")
            .filter(Q(email__iexact=email_normalizado) | Q(usuario__email__iexact=email_normalizado))
            .first()
        )

    def _obtener_cuenta_modelo(self, id_usuario: str) -> CuentaClienteModelo:
        cuenta = self._obtener_cuenta_modelo_opcional(id_usuario)
        if cuenta is None:
            raise ErrorDominio("No se puede operar sobre una cuenta inexistente.")
        return cuenta

    def _obtener_cuenta_modelo_opcional(self, id_usuario: str) -> CuentaClienteModelo | None:
        return (
            CuentaClienteModelo.objects.select_related("usuario")
            .filter(usuario_id=id_usuario.strip())
            .first()
        )
