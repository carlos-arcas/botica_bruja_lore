from __future__ import annotations

import importlib.util
import io
import os
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "bootstrap_demo_release.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("bootstrap_demo_release_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class BootstrapDemoReleaseTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_preparar_sqlite_crea_directorio_padre_en_ci_simulado(self) -> None:
        ruta = self.module.ROOT_DIR / "var" / "tests" / "bootstrap_ci" / "nested" / "demo.sqlite3"
        if ruta.parent.exists():
            import shutil

            shutil.rmtree(self.module.ROOT_DIR / "var" / "tests" / "bootstrap_ci")

        with patch.dict(
            os.environ,
            {
                "DATABASE_URL": "sqlite:///var/tests/bootstrap_ci/nested/demo.sqlite3",
                "SECRET_KEY": "ci-bootstrap-secret",
            },
            clear=False,
        ):
            self.module._preparar_sqlite_para_bootstrap()

        self.assertTrue(ruta.parent.exists())

    def test_main_ok_en_ci_simulado(self) -> None:
        ok = self.module.StepResult(name="x", ok=True)
        with patch.object(self.module, "parse_args") as fake_args:
            fake_args.return_value = type("Args", (), {"skip_second_seed": False})()
            with patch.object(self.module, "_run_step", return_value=ok):
                with patch.object(self.module, "_data_snapshot_step", return_value=ok):
                    output = io.StringIO()
                    with patch.dict(
                        os.environ,
                        {
                            "DATABASE_URL": "sqlite:///var/tests/bootstrap_ci/nested/demo.sqlite3",
                            "SECRET_KEY": "ci-bootstrap-secret",
                        },
                        clear=False,
                    ):
                        with redirect_stdout(output):
                            code = self.module.main()

        self.assertEqual(code, 0)
        self.assertIn("VEREDICTO: OK", output.getvalue())


if __name__ == "__main__":
    unittest.main()
