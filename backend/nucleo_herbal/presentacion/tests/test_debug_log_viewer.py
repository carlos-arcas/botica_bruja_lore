from __future__ import annotations

import json
from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import Client, TestCase, override_settings

from backend.nucleo_herbal.presentacion.debug_logs.servicio_logs import limpiar_logs


class DebugLogViewerTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.temp_dir = TemporaryDirectory()
        base = Path(self.temp_dir.name)
        self.app_log = str(base / "app.log")
        self.error_log = str(base / "error.log")

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def _settings(self) -> dict[str, object]:
        return {
            "DEBUG_LOG_VIEWER_ENABLED": True,
            "DEBUG_LOG_VIEWER_KEY": "clave-debug",
            "DEBUG_LOG_APP_FILE": self.app_log,
            "DEBUG_LOG_ERROR_FILE": self.error_log,
        }

    def test_control_acceso_por_clave(self):
        with override_settings(**self._settings()):
            sin_clave = self.client.get("/api/debug/logs")
            self.assertEqual(sin_clave.status_code, 403)

            con_clave = self.client.get("/api/debug/logs", HTTP_X_DEBUG_LOG_KEY="clave-debug")
            self.assertEqual(con_clave.status_code, 200)


    def test_clave_en_query_param_no_autoriza_acceso(self):
        with override_settings(**self._settings()):
            respuesta = self.client.get("/api/debug/logs?debug_key=clave-debug")

        self.assertEqual(respuesta.status_code, 403)

    def test_lectura_logs_y_redaccion_sensible(self):
        Path(self.app_log).write_text(
            "INFO token=abcd1234 authorization=Bearer abc cookie=sessionid=xyz password=secreto", encoding="utf-8"
        )
        with override_settings(**self._settings()):
            respuesta = self.client.get("/api/debug/logs?source=app", HTTP_X_DEBUG_LOG_KEY="clave-debug")

        self.assertEqual(respuesta.status_code, 200)
        item = respuesta.json()["items"][0]
        self.assertIn("[REDACTED]", item["sanitized"])
        self.assertNotIn("abcd1234", item["sanitized"])
        self.assertNotIn("secreto", item["sanitized"])

    def test_limpieza_logs_trunca_archivo(self):
        Path(self.error_log).write_text("ERROR fallo inicial", encoding="utf-8")
        with override_settings(**self._settings()):
            respuesta = self.client.post(
                "/api/debug/logs/clear",
                data=json.dumps({"source": "error"}),
                content_type="application/json",
                HTTP_X_DEBUG_LOG_KEY="clave-debug",
            )

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(Path(self.error_log).read_text(encoding="utf-8"), "")

    def test_estado_vacio_si_log_no_existe(self):
        with override_settings(**self._settings()):
            limpiar_logs(source="app")
            Path(self.app_log).unlink(missing_ok=True)
            respuesta = self.client.get("/api/debug/logs?source=app", HTTP_X_DEBUG_LOG_KEY="clave-debug")

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()["items"], [])

    def test_configuracion_logs_efimeros_por_arranque(self):
        from django.conf import settings

        self.assertEqual(settings.LOGGING["handlers"]["app_file"]["mode"], "w")
        self.assertEqual(settings.LOGGING["handlers"]["error_file"]["mode"], "w")
