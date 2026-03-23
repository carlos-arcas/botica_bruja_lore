from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timedelta, timezone
from unittest import TestCase
from unittest.mock import Mock

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_cuentas_cliente import (
    ConfirmarRecuperacionPasswordCuentaCliente,
    SolicitarRecuperacionPasswordCuentaCliente,
)
from backend.nucleo_herbal.dominio.cuentas_cliente import CuentaCliente, SolicitudRecuperacionPassword
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
        self.solicitud: SolicitudRecuperacionPassword | None = None
        self.hash_esperado: str | None = None
        self.password_actualizado: str | None = None

    def obtener_por_email(self, email: str):
        return self.cuenta if email == self.cuenta.email else None

    def obtener_por_id_usuario(self, id_usuario: str):
        return self.cuenta if id_usuario == self.cuenta.id_usuario else None

    def crear_solicitud_recuperacion_password(self, *, id_usuario: str, token_hash: str, expira_en):
        self.hash_esperado = token_hash
        self.solicitud = SolicitudRecuperacionPassword(
            id_solicitud="rec-1",
            id_usuario=id_usuario,
            email=self.cuenta.email,
            token_hash=token_hash,
            expira_en=expira_en,
            fecha_creacion=datetime.now(timezone.utc),
            fecha_envio=datetime.now(timezone.utc),
        )
        return self.solicitud

    def obtener_solicitud_recuperacion_por_token_hash(self, token_hash: str):
        if self.solicitud and self.solicitud.token_hash == token_hash:
            return self.solicitud
        return None

    def actualizar_password(self, *, id_usuario: str, password_plano: str, token_hash: str):
        if id_usuario != self.cuenta.id_usuario or token_hash != self.hash_esperado:
            return None
        self.password_actualizado = password_plano
        self.solicitud = replace(self.solicitud, fecha_uso=datetime.now(timezone.utc))
        self.cuenta = replace(self.cuenta, hash_password="nuevo-hash", fecha_actualizacion=datetime.now(timezone.utc))
        return self.cuenta


class CasosUsoRecuperacionPasswordCuentaClienteTests(TestCase):
    def test_solicitud_existente_envia_email(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()

        resultado = SolicitarRecuperacionPasswordCuentaCliente(repo, notificador).ejecutar(
            email="cliente@test.dev",
            operation_id="op-1",
        )

        self.assertTrue(resultado.solicitud_generada)
        notificador.enviar_recuperacion.assert_called_once()

    def test_solicitud_inexistente_responde_generica(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()

        resultado = SolicitarRecuperacionPasswordCuentaCliente(repo, notificador).ejecutar(
            email="no-existe@test.dev",
            operation_id="op-2",
        )

        self.assertFalse(resultado.solicitud_generada)
        notificador.enviar_recuperacion.assert_not_called()

    def test_confirma_token_valido_y_actualiza_password(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()
        validador = Mock()
        SolicitarRecuperacionPasswordCuentaCliente(repo, notificador).ejecutar(email="cliente@test.dev", operation_id="op-3")
        token = notificador.enviar_recuperacion.call_args.kwargs["token_plano"]

        cuenta = ConfirmarRecuperacionPasswordCuentaCliente(repo, validador).ejecutar(
            token=token,
            password_nuevo="ClaveNueva123$",
        )

        self.assertEqual(repo.password_actualizado, "ClaveNueva123$")
        self.assertEqual(cuenta.id_usuario, "usr-1")
        validador.validar.assert_called_once()

    def test_rechaza_token_invalido_expirado_y_reutilizado(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()
        validador = Mock()
        SolicitarRecuperacionPasswordCuentaCliente(repo, notificador).ejecutar(email="cliente@test.dev", operation_id="op-4")
        token = notificador.enviar_recuperacion.call_args.kwargs["token_plano"]

        with self.assertRaisesRegex(ErrorDominio, "no es válido"):
            ConfirmarRecuperacionPasswordCuentaCliente(repo, validador).ejecutar(token="invalido", password_nuevo="ClaveNueva123$")

        repo.solicitud = replace(repo.solicitud, expira_en=datetime.now(timezone.utc) - timedelta(minutes=1))
        with self.assertRaisesRegex(ErrorDominio, "ha expirado"):
            ConfirmarRecuperacionPasswordCuentaCliente(repo, validador).ejecutar(token=token, password_nuevo="ClaveNueva123$")

        repo.solicitud = replace(repo.solicitud, expira_en=datetime.now(timezone.utc) + timedelta(minutes=1), fecha_uso=datetime.now(timezone.utc))
        with self.assertRaisesRegex(ErrorDominio, "ya fue utilizado"):
            ConfirmarRecuperacionPasswordCuentaCliente(repo, validador).ejecutar(token=token, password_nuevo="ClaveNueva123$")

    def test_falla_si_cuenta_ya_no_existe(self) -> None:
        repo = RepositorioStub()
        notificador = Mock()
        validador = Mock()
        SolicitarRecuperacionPasswordCuentaCliente(repo, notificador).ejecutar(email="cliente@test.dev", operation_id="op-5")
        token = notificador.enviar_recuperacion.call_args.kwargs["token_plano"]
        repo.solicitud = replace(repo.solicitud, id_usuario="usr-missing")

        with self.assertRaises(ErrorAplicacionLookup):
            ConfirmarRecuperacionPasswordCuentaCliente(repo, validador).ejecutar(token=token, password_nuevo="ClaveNueva123$")
