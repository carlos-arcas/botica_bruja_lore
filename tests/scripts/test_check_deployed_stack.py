from __future__ import annotations

import importlib.util
import io
import sys
import json
import os
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_deployed_stack.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_deployed_stack_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckDeployedStackTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def _run_main(self, env: dict[str, str], responses: dict[str, tuple[int, str, bytes]] | None = None) -> tuple[int, str]:
        responses = responses or {}

        def fake_http_get(url: str):
            if url not in responses:
                raise AssertionError(f"URL inesperada en test: {url}")
            return responses[url]

        output = io.StringIO()
        with patch.dict(os.environ, env, clear=True):
            with patch.object(self.module, "_http_get", side_effect=fake_http_get):
                with redirect_stdout(output):
                    code = self.module.main()
        return code, output.getvalue()

    def test_missing_required_url_env_returns_config_error(self) -> None:
        code, output = self._run_main(env={"BACKEND_BASE_URL": "https://backend.example.com"})
        self.assertEqual(code, self.module.CONFIG_ERROR_EXIT_CODE)
        self.assertIn("Configuración", output)
        self.assertIn("FRONTEND_BASE_URL", output)

    def test_invalid_url_returns_config_error(self) -> None:
        code, output = self._run_main(
            env={
                "BACKEND_BASE_URL": "backend.example.com",
                "FRONTEND_BASE_URL": "https://frontend.example.com",
            }
        )
        self.assertEqual(code, self.module.CONFIG_ERROR_EXIT_CODE)
        self.assertIn("http/https", output)

    def test_ok_with_valid_json_and_html_and_optional_slugs_omitted(self) -> None:
        backend = "https://backend.example.com"
        frontend = "https://frontend.example.com"
        responses = {
            f"{backend}/healthz": (200, "application/json", json.dumps({"status": "ok"}).encode()),
            f"{backend}/api/v1/herbal/plantas/": (200, "application/json", json.dumps({"plantas": [{"slug": "romero"}]}).encode()),
            f"{backend}/api/v1/rituales/": (200, "application/json", json.dumps({"rituales": [{"slug": "limpieza"}]}).encode()),
            f"{frontend}/": (200, "text/html", b"<!doctype html><html><body>home</body></html>"),
            f"{frontend}/hierbas": (200, "text/html", b"<html><body>hierbas</body></html>"),
            f"{frontend}/rituales": (200, "text/html", b"<html><body>rituales</body></html>"),
        }
        code, output = self._run_main(
            env={
                "BACKEND_BASE_URL": backend,
                "FRONTEND_BASE_URL": frontend,
            },
            responses=responses,
        )
        self.assertEqual(code, 0)
        self.assertIn("[SKIP] D.Detalle opcional :: HERBAL_SLUG", output)
        self.assertIn("[SKIP] D.Detalle opcional :: RITUAL_SLUG", output)

    def test_expect_non_empty_data_fails_when_public_lists_empty(self) -> None:
        backend = "https://backend.example.com"
        frontend = "https://frontend.example.com"
        responses = {
            f"{backend}/healthz": (200, "application/json", json.dumps({"status": "ok"}).encode()),
            f"{backend}/api/v1/herbal/plantas/": (200, "application/json", json.dumps({"plantas": []}).encode()),
            f"{backend}/api/v1/rituales/": (200, "application/json", json.dumps({"rituales": []}).encode()),
            f"{frontend}/": (200, "text/html", b"<html></html>"),
            f"{frontend}/hierbas": (200, "text/html", b"<html></html>"),
            f"{frontend}/rituales": (200, "text/html", b"<html></html>"),
        }
        code, output = self._run_main(
            env={
                "BACKEND_BASE_URL": backend,
                "FRONTEND_BASE_URL": frontend,
                "EXPECT_NON_EMPTY_DATA": "true",
            },
            responses=responses,
        )
        self.assertEqual(code, self.module.BLOCKING_FAILURE_EXIT_CODE)
        self.assertIn("Lista 'plantas' vacía", output)


if __name__ == "__main__":
    unittest.main()
