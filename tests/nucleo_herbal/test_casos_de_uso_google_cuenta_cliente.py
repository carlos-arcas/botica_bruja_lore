from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timezone
from unittest import TestCase
from unittest.mock import Mock

from backend.nucleo_herbal.aplicacion.casos_de_uso_google_cuenta_cliente import AutenticarCuentaClienteGoogle
from backend.nucleo_herbal.aplicacion.puertos.verificador_google_identity import IdentidadGoogleVerificada
from backend.nucleo_herbal.dominio.cuentas_cliente import CuentaCliente
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class RepositorioGoogleCuentaClienteStub:
    def __init__(self) -> None:
        self._ahora = datetime.now(timezone.utc)
        self._secuencia = 1
        self.cuentas_por_id: dict[str, CuentaCliente] = {}
        self.ids_por_email: dict[str, str] = {}
        self.ids_por_google_sub: dict[str, str] = {}
        self.registros: list[dict[str, str]] = []
        self.vinculaciones: list[dict[str, object]] = []

    def agregar_cuenta(
        self,
        *,
        email: str,
        nombre_visible: str = "Lore",
        email_verificado: bool = False,
        id_usuario: str | None = None,
    ) -> CuentaCliente:
        cuenta = CuentaCliente(
            id_usuario=id_usuario or f"usr-{self._secuencia}",
            email=email,
            nombre_visible=nombre_visible,
            hash_password="hash",
            activo=True,
            email_verificado=email_verificado,
            fecha_creacion=self._ahora,
            fecha_actualizacion=self._ahora,
        )
        self._secuencia += 1
        self.cuentas_por_id[cuenta.id_usuario] = cuenta
        self.ids_por_email[cuenta.email] = cuenta.id_usuario
        return cuenta

    def obtener_por_google_sub(self, google_sub: str):
        id_usuario = self.ids_por_google_sub.get(google_sub)
        return self.cuentas_por_id.get(id_usuario) if id_usuario else None

    def obtener_por_email(self, email: str):
        id_usuario = self.ids_por_email.get(email)
        return self.cuentas_por_id.get(id_usuario) if id_usuario else None

    def registrar(self, *, email: str, nombre_visible: str, password_plano: str):
        self.registros.append(
            {
                "email": email,
                "nombre_visible": nombre_visible,
                "password_plano": password_plano,
            }
        )
        return self.agregar_cuenta(email=email, nombre_visible=nombre_visible, email_verificado=False)

    def vincular_google(self, *, id_usuario: str, google_sub: str, email_verificado: bool):
        cuenta = self.cuentas_por_id.get(id_usuario)
        if cuenta is None:
            return None
        self.ids_por_google_sub[google_sub] = id_usuario
        self.vinculaciones.append(
            {
                "id_usuario": id_usuario,
                "google_sub": google_sub,
                "email_verificado": email_verificado,
            }
        )
        actualizada = replace(
            cuenta,
            email_verificado=email_verificado or cuenta.email_verificado,
            fecha_actualizacion=datetime.now(timezone.utc),
        )
        self.cuentas_por_id[id_usuario] = actualizada
        return actualizada


class CasosUsoGoogleCuentaClienteTests(TestCase):
    def test_devuelve_cuenta_existente_si_google_sub_ya_esta_vinculado(self) -> None:
        repo = RepositorioGoogleCuentaClienteStub()
        existente = repo.agregar_cuenta(email="cliente@test.dev", email_verificado=True)
        repo.ids_por_google_sub["google-sub-1"] = existente.id_usuario
        verificador = Mock()
        verificador.verificar.return_value = IdentidadGoogleVerificada(
            google_sub="google-sub-1",
            email="cliente@test.dev",
            nombre_visible="Lore Google",
            email_verificado=True,
        )

        resultado = AutenticarCuentaClienteGoogle(repo, verificador).ejecutar(credential="cred-1")

        self.assertFalse(resultado.es_nueva_cuenta)
        self.assertEqual(resultado.cuenta.id_usuario, existente.id_usuario)
        self.assertEqual(repo.registros, [])
        self.assertEqual(repo.vinculaciones, [])

    def test_vincula_por_email_si_la_cuenta_ya_existia(self) -> None:
        repo = RepositorioGoogleCuentaClienteStub()
        existente = repo.agregar_cuenta(email="cliente@test.dev", email_verificado=False)
        verificador = Mock()
        verificador.verificar.return_value = IdentidadGoogleVerificada(
            google_sub="google-sub-2",
            email="cliente@test.dev",
            nombre_visible="Lore Google",
            email_verificado=True,
        )

        resultado = AutenticarCuentaClienteGoogle(repo, verificador).ejecutar(credential="cred-2")

        self.assertFalse(resultado.es_nueva_cuenta)
        self.assertEqual(resultado.cuenta.id_usuario, existente.id_usuario)
        self.assertEqual(repo.registros, [])
        self.assertEqual(repo.vinculaciones[0]["google_sub"], "google-sub-2")
        self.assertTrue(resultado.cuenta.email_verificado)

    def test_crea_cuenta_nueva_y_usa_fallback_de_nombre_visible(self) -> None:
        repo = RepositorioGoogleCuentaClienteStub()
        verificador = Mock()
        verificador.verificar.return_value = IdentidadGoogleVerificada(
            google_sub="google-sub-3",
            email="nueva-bruja@test.dev",
            nombre_visible="  ",
            email_verificado=True,
        )

        resultado = AutenticarCuentaClienteGoogle(repo, verificador).ejecutar(credential="cred-3")

        self.assertTrue(resultado.es_nueva_cuenta)
        self.assertEqual(resultado.cuenta.email, "nueva-bruja@test.dev")
        self.assertEqual(repo.registros[0]["nombre_visible"], "nueva-bruja")
        self.assertGreaterEqual(len(repo.registros[0]["password_plano"]), 10)
        self.assertEqual(repo.vinculaciones[0]["id_usuario"], resultado.cuenta.id_usuario)
        self.assertTrue(resultado.cuenta.email_verificado)

    def test_rechaza_identidad_google_sin_email_verificado(self) -> None:
        repo = RepositorioGoogleCuentaClienteStub()
        verificador = Mock()
        verificador.verificar.return_value = IdentidadGoogleVerificada(
            google_sub="google-sub-4",
            email="sin-verificar@test.dev",
            nombre_visible="Lore",
            email_verificado=False,
        )

        with self.assertRaisesRegex(ErrorDominio, "Google no confirm"):
            AutenticarCuentaClienteGoogle(repo, verificador).ejecutar(credential="cred-4")
