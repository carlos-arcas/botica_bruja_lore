from datetime import UTC, datetime
from unittest import TestCase

from backend.nucleo_herbal.dominio.cuentas_cliente import CuentaCliente
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class CuentaClienteEntidadTests(TestCase):
    def test_contrato_real_exige_campos_minimos(self) -> None:
        cuenta = CuentaCliente(
            id_usuario="1",
            email="cliente@test.dev",
            nombre_visible="Lore",
            hash_password="pbkdf2_sha256$abc",
            activo=True,
            email_verificado=False,
            fecha_creacion=datetime.now(tz=UTC),
            fecha_actualizacion=datetime.now(tz=UTC),
        )
        self.assertTrue(cuenta.activo)
        self.assertFalse(cuenta.email_verificado)

    def test_contrato_real_no_acepta_email_invalido(self) -> None:
        with self.assertRaisesRegex(ErrorDominio, "email válido"):
            CuentaCliente(
                id_usuario="1",
                email="sin-formato",
                nombre_visible="Lore",
                hash_password="pbkdf2_sha256$abc",
                activo=True,
                email_verificado=False,
                fecha_creacion=datetime.now(tz=UTC),
                fecha_actualizacion=datetime.now(tz=UTC),
            )
