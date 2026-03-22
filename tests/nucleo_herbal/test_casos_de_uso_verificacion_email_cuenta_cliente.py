from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timedelta, timezone
from unittest import TestCase
from unittest.mock import Mock

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_cuentas_cliente import (
    ConfirmarVerificacionEmail,
    GenerarSolicitudVerificacionEmail,
    ReenviarVerificacionEmail,
)
from backend.nucleo_herbal.dominio.cuentas_cliente import CuentaCliente, SolicitudVerificacionEmail
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class RepositorioStub:
    def __init__(self) -> None:
        ahora = datetime.now(timezone.utc)
        self.cuenta = CuentaCliente(
            id_usuario="usr-1",
            email="cliente@test.dev",
            nombre_visible="Lore",
            hash_password="hash",
            activo=True,
            email_verificado=False,
            fecha_creacion=ahora,
            fecha_actualizacion=ahora,
        )
        self.solicitud: SolicitudVerificacionEmail | None = None
        self.hash_esperado: str | None = None

    def registrar(self, **_kwargs):  # pragma: no cover - no usado aquí
        return self.cuenta

    def autenticar(self, _credenciales):  # pragma: no cover - no usado aquí
        return self.cuenta

    def obtener_por_email(self, email: str):
        return self.cuenta if email == self.cuenta.email else None

    def obtener_por_id_usuario(self, id_usuario: str):
        return self.cuenta if id_usuario == self.cuenta.id_usuario else None

    def crear_solicitud_verificacion(self, *, id_usuario: str, token_hash: str, expira_en):
        self.hash_esperado = token_hash
        self.solicitud = SolicitudVerificacionEmail(
            id_solicitud="sol-1",
            id_usuario=id_usuario,
            email=self.cuenta.email,
            token_hash=token_hash,
            expira_en=expira_en,
            fecha_creacion=datetime.now(timezone.utc),
            fecha_envio=datetime.now(timezone.utc),
        )
        return self.solicitud

    def obtener_solicitud_por_token_hash(self, token_hash: str):
        if self.solicitud and token_hash == self.solicitud.token_hash:
            return self.solicitud
        return None

    def marcar_email_verificado(self, *, id_usuario: str, token_hash: str):
        if id_usuario != self.cuenta.id_usuario or token_hash != self.hash_esperado:
            return None
        self.cuenta = replace(self.cuenta, email_verificado=True, fecha_actualizacion=datetime.now(timezone.utc))
        if self.solicitud:
            self.solicitud = replace(self.solicitud, fecha_confirmacion=datetime.now(timezone.utc))
        return self.cuenta

    def obtener_solicitud_activa_por_usuario(self, id_usuario: str):
        return self.solicitud if id_usuario == self.cuenta.id_usuario else None


class CasosUsoVerificacionEmailCuentaClienteTests(TestCase):
    def test_generar_verificacion_para_cuenta_valida(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()

        resultado = GenerarSolicitudVerificacionEmail(repo, notificador).ejecutar(
            id_usuario="usr-1",
            operation_id="op-1",
        )

        self.assertEqual(resultado.email, "cliente@test.dev")
        self.assertFalse(resultado.email_verificado)
        self.assertTrue(resultado.reenviada)
        notificador.enviar_verificacion.assert_called_once()

    def test_rechaza_confirmacion_con_token_invalido(self) -> None:
        repo = RepositorioStub()

        with self.assertRaisesRegex(ErrorDominio, "no es válido"):
            ConfirmarVerificacionEmail(repo).ejecutar(token="no-valido")

    def test_rechaza_confirmacion_con_token_expirado(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()
        GenerarSolicitudVerificacionEmail(repo, notificador).ejecutar(id_usuario="usr-1", operation_id="op-exp")
        token = notificador.enviar_verificacion.call_args.kwargs["token_plano"]
        object.__setattr__(repo.solicitud, "expira_en", datetime.now(timezone.utc) - timedelta(minutes=1))

        with self.assertRaisesRegex(ErrorDominio, "ha expirado"):
            ConfirmarVerificacionEmail(repo).ejecutar(token=token)

    def test_confirma_correctamente_token_valido(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()
        GenerarSolicitudVerificacionEmail(repo, notificador).ejecutar(id_usuario="usr-1", operation_id="op-2")
        token = notificador.enviar_verificacion.call_args.kwargs["token_plano"]

        cuenta = ConfirmarVerificacionEmail(repo).ejecutar(token=token)

        self.assertTrue(cuenta.email_verificado)

    def test_reenvia_solo_cuando_procede(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()

        resultado = ReenviarVerificacionEmail(repo, notificador).ejecutar(
            email="cliente@test.dev",
            operation_id="op-3",
        )

        self.assertEqual(resultado.email, "cliente@test.dev")
        notificador.enviar_verificacion.assert_called_once()

    def test_rechaza_reenvio_si_ya_esta_verificada(self) -> None:
        repo = RepositorioStub()
        repo.cuenta = replace(repo.cuenta, email_verificado=True)
        notificador = Mock()

        with self.assertRaisesRegex(ErrorDominio, "ya tiene el email verificado"):
            ReenviarVerificacionEmail(repo, notificador).ejecutar(
                email="cliente@test.dev",
                operation_id="op-4",
            )

    def test_no_confirma_cuenta_inexistente(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()
        GenerarSolicitudVerificacionEmail(repo, notificador).ejecutar(id_usuario="usr-1", operation_id="op-miss")
        token = notificador.enviar_verificacion.call_args.kwargs["token_plano"]
        repo.solicitud = replace(repo.solicitud, id_usuario="usr-inexistente")

        with self.assertRaises(ErrorAplicacionLookup):
            ConfirmarVerificacionEmail(repo).ejecutar(token=token)
