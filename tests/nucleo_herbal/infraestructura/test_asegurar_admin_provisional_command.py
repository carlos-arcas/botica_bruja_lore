import io
import unittest
from unittest.mock import patch

try:
    from django.contrib.auth import get_user_model
    from django.core.management import CommandError, call_command
    from django.test import TestCase as DjangoTestCase

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestAsegurarAdminProvisionalCommand(DjangoTestCase):
    def test_crea_admin_provisional_si_no_existe(self) -> None:
        with patch.dict(
            "os.environ",
            {
                "ADMIN_USUARIO_PROVISIONAL": "karkas",
                "ADMIN_PASSWORD_PROVISIONAL": "clave-segura-demo",
            },
            clear=False,
        ):
            call_command("asegurar_admin_provisional")

        UserModel = get_user_model()
        usuario = UserModel.objects.get(username="karkas")
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertTrue(usuario.check_password("clave-segura-demo"))

    def test_actualiza_privilegios_si_usuario_existe_sin_permisos(self) -> None:
        UserModel = get_user_model()
        UserModel.objects.create_user(
            username="karkas",
            password="temporal",
            is_staff=False,
            is_superuser=False,
        )

        with patch.dict(
            "os.environ",
            {
                "ADMIN_USUARIO_PROVISIONAL": "karkas",
                "ADMIN_PASSWORD_PROVISIONAL": "nueva-clave-segura",
            },
            clear=False,
        ):
            call_command("asegurar_admin_provisional")

        usuario = UserModel.objects.get(username="karkas")
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertTrue(usuario.check_password("nueva-clave-segura"))

    def test_falla_controlado_si_faltan_variables(self) -> None:
        with patch.dict(
            "os.environ",
            {
                "ADMIN_USUARIO_PROVISIONAL": "",
                "ADMIN_PASSWORD_PROVISIONAL": "",
            },
            clear=False,
        ):
            with self.assertRaises(CommandError):
                call_command("asegurar_admin_provisional")

    def test_comando_es_idempotente(self) -> None:
        with patch.dict(
            "os.environ",
            {
                "ADMIN_USUARIO_PROVISIONAL": "karkas",
                "ADMIN_PASSWORD_PROVISIONAL": "clave-repetible",
            },
            clear=False,
        ):
            call_command("asegurar_admin_provisional")
            call_command("asegurar_admin_provisional")

        UserModel = get_user_model()
        self.assertEqual(UserModel.objects.filter(username="karkas").count(), 1)

    def test_no_imprime_password_en_salida(self) -> None:
        salida = io.StringIO()
        password = "ultra-secreto-no-log"

        with patch.dict(
            "os.environ",
            {
                "ADMIN_USUARIO_PROVISIONAL": "karkas",
                "ADMIN_PASSWORD_PROVISIONAL": password,
            },
            clear=False,
        ):
            call_command("asegurar_admin_provisional", stdout=salida)

        self.assertNotIn(password, salida.getvalue())
