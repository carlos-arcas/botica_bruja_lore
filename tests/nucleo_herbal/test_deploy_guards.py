import os
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase

ROOT_DIR = Path(__file__).resolve().parents[2]
PYTHON = sys.executable
SETTINGS_MODULE = "backend.configuracion_django.settings"
EXPECTED_DB_ERROR = "DATABASE_URL es obligatoria en Railway/producción."
EXPECTED_SECRET_ERROR = (
    "SECRET_KEY es obligatoria cuando DEBUG=false o en Railway/producción."
)
EXPECTED_PUBLIC_URL_ERROR = "PUBLIC_SITE_URL es obligatoria cuando DEBUG=false."
EXPECTED_PAYMENT_SUCCESS_ERROR = "PAYMENT_SUCCESS_URL es obligatoria cuando DEBUG=false."
EXPECTED_PAYMENT_CANCEL_ERROR = "PAYMENT_CANCEL_URL es obligatoria cuando DEBUG=false."
EXPECTED_DEFAULT_FROM_EMAIL_ERROR = "DEFAULT_FROM_EMAIL es obligatoria cuando DEBUG=false."
EXPECTED_DEFAULT_FROM_EMAIL_LOCAL_ERROR = (
    "DEFAULT_FROM_EMAIL no puede usar dominio .local cuando DEBUG=false."
)
EXPECTED_EMAIL_BACKEND_ERROR = (
    "EMAIL_BACKEND de desarrollo no permitida cuando DEBUG=false. Configura backend SMTP real."
)
EXPECTED_PAYMENT_PROVIDER_ERROR = "BOTICA_PAYMENT_PROVIDER debe ser simulado_local o stripe."
EXPECTED_STRIPE_SECRET_ERROR = (
    "STRIPE_SECRET_KEY es obligatoria cuando BOTICA_PAYMENT_PROVIDER=stripe."
)


class TestDeployGuards(SimpleTestCase):
    def _base_env(self) -> dict[str, str]:
        env = os.environ.copy()
        env["PYTHONPATH"] = str(ROOT_DIR)
        env.setdefault("LC_ALL", "C.UTF-8")
        env.setdefault("LANG", "C.UTF-8")
        return env

    def _run(self, cmd: list[str], env: dict[str, str]) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            cmd,
            cwd=ROOT_DIR,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )

    def _assert_failed_with(self, result: subprocess.CompletedProcess[str], expected: str) -> None:
        output = f"{result.stdout}\n{result.stderr}"
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(expected, output)

    def test_local_sin_database_url_usa_sqlite_local(self) -> None:
        env = self._base_env()
        for key in (
            "DATABASE_URL",
            "RAILWAY_PUBLIC_DOMAIN",
            "RAILWAY_ENVIRONMENT_ID",
            "RAILWAY_PROJECT_ID",
            "DEBUG",
            "SECRET_KEY",
        ):
            env.pop(key, None)

        code = (
            f"import {SETTINGS_MODULE} as settings;"
            "print(settings.DATABASES['default']['ENGINE']);"
            "print(settings.DATABASES['default']['NAME'])"
        )
        result = self._run([PYTHON, "-c", code], env)

        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertIn("django.db.backends.sqlite3", result.stdout)
        db_name = result.stdout.strip().splitlines()[-1]
        db_path = Path(db_name)
        self.assertEqual(db_path.parts[-2:], ("var", "dev.sqlite3"))


    def test_database_url_sqlite_relativa_se_resuelve_bajo_repo(self) -> None:
        env = self._base_env()
        env["DATABASE_URL"] = "sqlite:///bootstrap_demo_ci.sqlite3"
        env["SECRET_KEY"] = "ci-bootstrap-secret"
        env["DEBUG"] = "true"
        for key in ("RAILWAY_PUBLIC_DOMAIN", "RAILWAY_ENVIRONMENT_ID", "RAILWAY_PROJECT_ID"):
            env.pop(key, None)

        code = (
            f"import {SETTINGS_MODULE} as settings;"
            "print(settings.DATABASES['default']['NAME'])"
        )
        result = self._run([PYTHON, "-c", code], env)

        self.assertEqual(result.returncode, 0, msg=result.stderr)
        db_path = Path(result.stdout.strip().splitlines()[-1]).resolve()
        self.assertEqual(db_path, (ROOT_DIR / "bootstrap_demo_ci.sqlite3").resolve())

    def test_database_url_sqlite_crea_directorio_padre_si_no_existe(self) -> None:
        env = self._base_env()
        ruta_relativa = "var/tests/sqlite_bootstrap/subdir/ci.sqlite3"
        env["DATABASE_URL"] = f"sqlite:///{ruta_relativa}"
        env["SECRET_KEY"] = "ci-bootstrap-secret"
        env["DEBUG"] = "true"
        for key in ("RAILWAY_PUBLIC_DOMAIN", "RAILWAY_ENVIRONMENT_ID", "RAILWAY_PROJECT_ID"):
            env.pop(key, None)

        directorio_objetivo = ROOT_DIR / "var" / "tests" / "sqlite_bootstrap" / "subdir"
        if directorio_objetivo.exists():
            import shutil

            shutil.rmtree(ROOT_DIR / "var" / "tests" / "sqlite_bootstrap")

        code = (
            f"import {SETTINGS_MODULE} as settings;"
            "print(settings.DATABASES['default']['NAME'])"
        )
        result = self._run([PYTHON, "-c", code], env)

        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(directorio_objetivo.exists())

    def test_railway_sin_database_url_falla_con_error_canonico(self) -> None:
        env = self._base_env()
        env["RAILWAY_PUBLIC_DOMAIN"] = "botica-demo.up.railway.app"
        env["SECRET_KEY"] = "test-secret"
        env.pop("DATABASE_URL", None)

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_DB_ERROR)


    def test_railway_con_database_url_sqlite_falla_por_guardrail(self) -> None:
        env = self._base_env()
        env["RAILWAY_PUBLIC_DOMAIN"] = "botica-demo.up.railway.app"
        env["SECRET_KEY"] = "test-secret"
        env["DATABASE_URL"] = "sqlite:///var/dev.sqlite3"

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(
            result,
            "SQLite no está permitida en Railway/producción. Configura PostgreSQL en DATABASE_URL.",
        )

    def test_produccion_sin_secret_key_falla_con_error_canonico(self) -> None:
        env = self._base_env()
        env["DEBUG"] = "false"
        env["DATABASE_URL"] = "sqlite:///var/dev.sqlite3"
        for key in (
            "SECRET_KEY",
            "RAILWAY_PUBLIC_DOMAIN",
            "RAILWAY_ENVIRONMENT_ID",
            "RAILWAY_PROJECT_ID",
        ):
            env.pop(key, None)

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_SECRET_ERROR)

    def test_produccion_requiere_public_site_url(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "false",
            "SECRET_KEY": "prod-secret",
            "DATABASE_URL": "sqlite:///var/dev.sqlite3",
            "PAYMENT_SUCCESS_URL": "https://frontend.example.com/pedido/{CHECKOUT_SESSION_ID}",
            "PAYMENT_CANCEL_URL": "https://frontend.example.com/checkout?estado_pago=cancelado",
            "DEFAULT_FROM_EMAIL": "ops@example.com",
            "EMAIL_BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        })
        env.pop("PUBLIC_SITE_URL", None)

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_PUBLIC_URL_ERROR)

    def test_produccion_requiere_payment_success_url(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "false",
            "SECRET_KEY": "prod-secret",
            "DATABASE_URL": "sqlite:///var/dev.sqlite3",
            "PUBLIC_SITE_URL": "https://frontend.example.com",
            "PAYMENT_CANCEL_URL": "https://frontend.example.com/checkout?estado_pago=cancelado",
            "DEFAULT_FROM_EMAIL": "ops@example.com",
            "EMAIL_BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        })
        env.pop("PAYMENT_SUCCESS_URL", None)

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_PAYMENT_SUCCESS_ERROR)

    def test_produccion_requiere_payment_cancel_url(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "false",
            "SECRET_KEY": "prod-secret",
            "DATABASE_URL": "sqlite:///var/dev.sqlite3",
            "PUBLIC_SITE_URL": "https://frontend.example.com",
            "PAYMENT_SUCCESS_URL": "https://frontend.example.com/pedido/{CHECKOUT_SESSION_ID}",
            "DEFAULT_FROM_EMAIL": "ops@example.com",
            "EMAIL_BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        })
        env.pop("PAYMENT_CANCEL_URL", None)

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_PAYMENT_CANCEL_ERROR)

    def test_produccion_requiere_default_from_email(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "false",
            "SECRET_KEY": "prod-secret",
            "DATABASE_URL": "sqlite:///var/dev.sqlite3",
            "PUBLIC_SITE_URL": "https://frontend.example.com",
            "PAYMENT_SUCCESS_URL": "https://frontend.example.com/pedido/{CHECKOUT_SESSION_ID}",
            "PAYMENT_CANCEL_URL": "https://frontend.example.com/checkout?estado_pago=cancelado",
            "DEFAULT_FROM_EMAIL": "",
            "EMAIL_BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        })

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_DEFAULT_FROM_EMAIL_ERROR)

    def test_produccion_rechaza_default_from_email_local(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "false",
            "SECRET_KEY": "prod-secret",
            "DATABASE_URL": "sqlite:///var/dev.sqlite3",
            "PUBLIC_SITE_URL": "https://frontend.example.com",
            "PAYMENT_SUCCESS_URL": "https://frontend.example.com/pedido/{CHECKOUT_SESSION_ID}",
            "PAYMENT_CANCEL_URL": "https://frontend.example.com/checkout?estado_pago=cancelado",
            "DEFAULT_FROM_EMAIL": "ops@example.local",
            "EMAIL_BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        })

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_DEFAULT_FROM_EMAIL_LOCAL_ERROR)

    def test_produccion_rechaza_email_backend_de_desarrollo(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "false",
            "SECRET_KEY": "prod-secret",
            "DATABASE_URL": "sqlite:///var/dev.sqlite3",
            "PUBLIC_SITE_URL": "https://frontend.example.com",
            "PAYMENT_SUCCESS_URL": "https://frontend.example.com/pedido/{CHECKOUT_SESSION_ID}",
            "PAYMENT_CANCEL_URL": "https://frontend.example.com/checkout?estado_pago=cancelado",
            "DEFAULT_FROM_EMAIL": "ops@example.com",
            "EMAIL_BACKEND": "django.core.mail.backends.locmem.EmailBackend",
        })

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_EMAIL_BACKEND_ERROR)

    def test_proveedor_pago_invalido_falla_temprano(self) -> None:
        env = self._base_env()
        env["DEBUG"] = "true"
        env["BOTICA_PAYMENT_PROVIDER"] = "stripe-real"
        for key in ("DATABASE_URL", "RAILWAY_PUBLIC_DOMAIN", "RAILWAY_ENVIRONMENT_ID", "RAILWAY_PROJECT_ID"):
            env.pop(key, None)

        result = self._run([PYTHON, "-c", f"import {SETTINGS_MODULE}"], env)

        self._assert_failed_with(result, EXPECTED_PAYMENT_PROVIDER_ERROR)

    def test_local_simulado_no_exige_claves_stripe(self) -> None:
        env = self._base_env()
        env["DEBUG"] = "true"
        env["BOTICA_PAYMENT_PROVIDER"] = "simulado_local"
        for key in (
            "DATABASE_URL",
            "RAILWAY_PUBLIC_DOMAIN",
            "RAILWAY_ENVIRONMENT_ID",
            "RAILWAY_PROJECT_ID",
            "STRIPE_PUBLIC_KEY",
            "STRIPE_SECRET_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "PAYMENT_SUCCESS_URL",
            "PAYMENT_CANCEL_URL",
        ):
            env.pop(key, None)

        result = self._run(
            [
                PYTHON,
                "-c",
                f"import {SETTINGS_MODULE} as settings; print(settings.BOTICA_PAYMENT_PROVIDER)",
            ],
            env,
        )

        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertIn("simulado_local", result.stdout)

    def test_stripe_seleccionado_sin_claves_falla_sin_filtrar_secretos(self) -> None:
        env = self._base_env()
        env.update({
            "DEBUG": "true",
            "BOTICA_PAYMENT_PROVIDER": "stripe",
            "STRIPE_PUBLIC_KEY": "pk_test_visible",
            "STRIPE_SECRET_KEY": "",
            "STRIPE_WEBHOOK_SECRET": "whsec_no_debe_aparecer",
            "PAYMENT_SUCCESS_URL": "http://127.0.0.1:3000/pedido/{ID_PEDIDO}",
            "PAYMENT_CANCEL_URL": "http://127.0.0.1:3000/pedido/{ID_PEDIDO}/cancel",
        })
        for key in ("DATABASE_URL", "RAILWAY_PUBLIC_DOMAIN", "RAILWAY_ENVIRONMENT_ID", "RAILWAY_PROJECT_ID"):
            env.pop(key, None)

        result = self._run([PYTHON, "-c", f"import {SETTINGS_MODULE}"], env)
        output = f"{result.stdout}\n{result.stderr}"

        self._assert_failed_with(result, EXPECTED_STRIPE_SECRET_ERROR)
        self.assertNotIn("whsec_no_debe_aparecer", output)
        self.assertNotIn("pk_test_visible", output)

    def test_manage_py_fuerza_settings_canonico(self) -> None:
        env = self._base_env()
        env["DJANGO_SETTINGS_MODULE"] = "legacy.settings"
        for key in (
            "DATABASE_URL",
            "RAILWAY_PUBLIC_DOMAIN",
            "RAILWAY_ENVIRONMENT_ID",
            "RAILWAY_PROJECT_ID",
            "DEBUG",
            "SECRET_KEY",
        ):
            env.pop(key, None)

        result = self._run(
            [
                PYTHON,
                "manage.py",
                "shell",
                "-c",
                "import os; print(os.environ['DJANGO_SETTINGS_MODULE'])",
            ],
            env,
        )

        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertIn("backend.configuracion_django.settings", result.stdout)

    def test_wsgi_py_fuerza_settings_canonico(self) -> None:
        env = self._base_env()
        env["DJANGO_SETTINGS_MODULE"] = "legacy.settings"
        for key in (
            "DATABASE_URL",
            "RAILWAY_PUBLIC_DOMAIN",
            "RAILWAY_ENVIRONMENT_ID",
            "RAILWAY_PROJECT_ID",
            "DEBUG",
            "SECRET_KEY",
        ):
            env.pop(key, None)

        code = (
            "import os;"
            "import backend.configuracion_django.wsgi;"
            "print(os.environ['DJANGO_SETTINGS_MODULE'])"
        )
        result = self._run([PYTHON, "-c", code], env)

        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertIn("backend.configuracion_django.settings", result.stdout)
