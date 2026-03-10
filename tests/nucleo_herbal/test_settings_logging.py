import os
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase

from backend.configuracion_django import settings

ROOT_DIR = Path(__file__).resolve().parents[2]


class TestSettingsLogging(SimpleTestCase):
    def test_log_level_por_defecto_info(self) -> None:
        self.assertEqual(settings._normalizar_log_level(None), "INFO")

    def test_log_level_invalido_hace_fallback_info(self) -> None:
        self.assertEqual(settings._normalizar_log_level("nivel-raro"), "INFO")

    def test_log_level_valido_se_respeta(self) -> None:
        self.assertEqual(settings._normalizar_log_level("warning"), "WARNING")


class TestImportSettingsConYsinLogLevel(SimpleTestCase):
    def _run_import(self, log_level: str | None) -> subprocess.CompletedProcess[str]:
        env = os.environ.copy()
        env["PYTHONPATH"] = str(ROOT_DIR)
        env["DATABASE_URL"] = "sqlite:///var/test_logging.sqlite3"
        env["SECRET_KEY"] = "test-secret"
        env["DEBUG"] = "false"
        env.pop("RAILWAY_PUBLIC_DOMAIN", None)
        env.pop("RAILWAY_ENVIRONMENT_ID", None)
        env.pop("RAILWAY_PROJECT_ID", None)
        if log_level is None:
            env.pop("LOG_LEVEL", None)
        else:
            env["LOG_LEVEL"] = log_level

        return subprocess.run(
            [sys.executable, "-c", "import backend.configuracion_django.settings"],
            cwd=ROOT_DIR,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )

    def test_import_settings_sin_log_level(self) -> None:
        result = self._run_import(None)
        self.assertEqual(result.returncode, 0, msg=f"stderr: {result.stderr}")

    def test_import_settings_con_log_level(self) -> None:
        result = self._run_import("DEBUG")
        self.assertEqual(result.returncode, 0, msg=f"stderr: {result.stderr}")
