import unittest

from backend.nucleo_herbal.dominio.cuentas_demo import CuentaDemo, CredencialCuentaDemo, PerfilCuentaDemo
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class TestEntidadesCuentaDemo(unittest.TestCase):
    def test_cuenta_demo_valida(self) -> None:
        cuenta = CuentaDemo(
            id_usuario="USR-1",
            email="lore@test.dev",
            perfil=PerfilCuentaDemo(nombre_visible="Lore"),
            credencial=CredencialCuentaDemo(clave_acceso_demo="clave-demo"),
        )

        self.assertEqual(cuenta.email, "lore@test.dev")

    def test_perfil_requiere_nombre_visible(self) -> None:
        with self.assertRaises(ErrorDominio):
            PerfilCuentaDemo(nombre_visible="")

    def test_credencial_requiere_longitud_minima(self) -> None:
        with self.assertRaises(ErrorDominio):
            CredencialCuentaDemo(clave_acceso_demo="abc")

    def test_cuenta_rechaza_email_invalido(self) -> None:
        with self.assertRaises(ErrorDominio):
            CuentaDemo(
                id_usuario="USR-1",
                email="sin-arroba",
                perfil=PerfilCuentaDemo(nombre_visible="Lore"),
                credencial=CredencialCuentaDemo(clave_acceso_demo="clave-demo"),
            )


if __name__ == "__main__":
    unittest.main()
