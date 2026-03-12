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

    def test_railway_sin_database_url_falla_con_error_canonico(self) -> None:
        env = self._base_env()
        env["RAILWAY_PUBLIC_DOMAIN"] = "botica-demo.up.railway.app"
        env["SECRET_KEY"] = "test-secret"
        env.pop("DATABASE_URL", None)

        code = f"import {SETTINGS_MODULE}"
        result = self._run([PYTHON, "-c", code], env)

        self._assert_failed_with(result, EXPECTED_DB_ERROR)

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
