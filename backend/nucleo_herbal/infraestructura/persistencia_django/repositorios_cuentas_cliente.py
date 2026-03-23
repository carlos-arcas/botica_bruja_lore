"""Repositorio ORM para la cuenta real de cliente."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from ...aplicacion.puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from ...dominio.cuentas_cliente import ComandoDireccionCuentaCliente, CuentaCliente, CredencialesCuentaCliente, DireccionCuentaCliente
from ...dominio.excepciones import ErrorDominio
from .mapeadores import (
    a_cuenta_cliente,
    a_direccion_cuenta_cliente,
    a_solicitud_recuperacion_password,
    a_solicitud_verificacion_email,
)
from .models import (
    CuentaClienteModelo,
    DireccionCuentaClienteModelo,
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
        modelo = self._obtener_cuenta_modelo_opcional(id_usuario)
        return None if modelo is None else a_cuenta_cliente(modelo)

    def listar_direcciones(self, *, id_usuario: str) -> tuple[DireccionCuentaCliente, ...]:
        return tuple(
            a_direccion_cuenta_cliente(modelo)
            for modelo in self._query_direcciones(id_usuario)
        )

    @transaction.atomic
    def crear_direccion(self, *, id_usuario: str, comando: ComandoDireccionCuentaCliente) -> DireccionCuentaCliente:
        cuenta = self._obtener_cuenta_modelo(id_usuario)
        tiene_direcciones = DireccionCuentaClienteModelo.objects.filter(cuenta=cuenta).exists()
        if not tiene_direcciones:
            self._desmarcar_predeterminadas(cuenta=cuenta)
        modelo = DireccionCuentaClienteModelo.objects.create(
            cuenta=cuenta,
            alias=comando.alias.strip(),
            nombre_destinatario=comando.nombre_destinatario.strip(),
            telefono_contacto=comando.telefono_contacto.strip(),
            linea_1=comando.linea_1.strip(),
            linea_2=comando.linea_2.strip(),
            codigo_postal=comando.codigo_postal.strip(),
            ciudad=comando.ciudad.strip(),
            provincia=comando.provincia.strip(),
            pais_iso=comando.pais_iso.strip().upper(),
            predeterminada=not tiene_direcciones,
        )
        return a_direccion_cuenta_cliente(modelo)

    @transaction.atomic
    def actualizar_direccion(self, *, id_usuario: str, id_direccion: str, comando: ComandoDireccionCuentaCliente) -> DireccionCuentaCliente | None:
        modelo = self._obtener_direccion_modelo(id_usuario=id_usuario, id_direccion=id_direccion)
        if modelo is None:
            return None
        for campo, valor in self._datos_direccion(comando).items():
            setattr(modelo, campo, valor)
        modelo.save()
        return a_direccion_cuenta_cliente(modelo)

    @transaction.atomic
    def eliminar_direccion(self, *, id_usuario: str, id_direccion: str) -> bool:
        modelo = self._obtener_direccion_modelo(id_usuario=id_usuario, id_direccion=id_direccion)
        if modelo is None:
            return False
        cuenta = modelo.cuenta
        era_predeterminada = modelo.predeterminada
        modelo.delete()
        if era_predeterminada:
            self._reasignar_predeterminada_si_aplica(cuenta=cuenta)
        return True

    @transaction.atomic
    def marcar_direccion_predeterminada(self, *, id_usuario: str, id_direccion: str) -> DireccionCuentaCliente | None:
        modelo = self._obtener_direccion_modelo(id_usuario=id_usuario, id_direccion=id_direccion)
        if modelo is None:
            return None
        self._desmarcar_predeterminadas(cuenta=modelo.cuenta)
        modelo.predeterminada = True
        modelo.save(update_fields=["predeterminada", "fecha_actualizacion"])
        return a_direccion_cuenta_cliente(modelo)

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

    def _obtener_direccion_modelo(self, *, id_usuario: str, id_direccion: str) -> DireccionCuentaClienteModelo | None:
        return (
            DireccionCuentaClienteModelo.objects.select_related("cuenta", "cuenta__usuario")
            .filter(id=id_direccion.strip(), cuenta__usuario_id=id_usuario.strip())
            .first()
        )

    def _query_direcciones(self, id_usuario: str):
        return DireccionCuentaClienteModelo.objects.select_related("cuenta", "cuenta__usuario").filter(
            cuenta__usuario_id=id_usuario.strip()
        ).order_by("-predeterminada", "id")

    def _desmarcar_predeterminadas(self, *, cuenta: CuentaClienteModelo) -> None:
        DireccionCuentaClienteModelo.objects.filter(cuenta=cuenta, predeterminada=True).update(predeterminada=False)

    def _reasignar_predeterminada_si_aplica(self, *, cuenta: CuentaClienteModelo) -> None:
        siguiente = DireccionCuentaClienteModelo.objects.filter(cuenta=cuenta).order_by("id").first()
        if siguiente is None:
            return
        if siguiente.predeterminada:
            return
        siguiente.predeterminada = True
        siguiente.save(update_fields=["predeterminada", "fecha_actualizacion"])

    def _datos_direccion(self, comando: ComandoDireccionCuentaCliente) -> dict[str, str]:
        return {
            "alias": comando.alias.strip(),
            "nombre_destinatario": comando.nombre_destinatario.strip(),
            "telefono_contacto": comando.telefono_contacto.strip(),
            "linea_1": comando.linea_1.strip(),
            "linea_2": comando.linea_2.strip(),
            "codigo_postal": comando.codigo_postal.strip(),
            "ciudad": comando.ciudad.strip(),
            "provincia": comando.provincia.strip(),
            "pais_iso": comando.pais_iso.strip().upper(),
        }
