from __future__ import annotations

import importlib.util
import io
import os
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = (
    Path(__file__).resolve().parents[2] / "scripts" / "check_bootstrap_demo_expected_counts.py"
)


def _load_module():
    spec = importlib.util.spec_from_file_location(
        "check_bootstrap_demo_expected_counts_tested", SCRIPT_PATH
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckBootstrapDemoExpectedCountsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_main_ok_cuando_conteos_coinciden(self) -> None:
        esperados = {
            "intenciones_publicas": 2,
            "plantas_publicadas": 2,
            "productos_publicados": 6,
            "rituales_publicados": 1,
        }
        output = io.StringIO()

        with patch.object(self.module, "_bootstrap_django"):
            with patch.object(
                self.module, "_calcular_conteos_esperados", return_value=esperados
            ):
                with patch.object(
                    self.module, "_calcular_conteos_reales", return_value=esperados
                ):
                    with redirect_stdout(output):
                        code = self.module.main()

        self.assertEqual(code, 0)
        self.assertIn("Resultado: OK", output.getvalue())

    def test_main_falla_con_mismatch_de_productos(self) -> None:
        esperados = {
            "intenciones_publicas": 2,
            "plantas_publicadas": 2,
            "productos_publicados": 6,
            "rituales_publicados": 1,
        }
        reales = dict(esperados)
        reales["productos_publicados"] = 5
        output = io.StringIO()

        with patch.object(self.module, "_bootstrap_django"):
            with patch.object(
                self.module, "_calcular_conteos_esperados", return_value=esperados
            ):
                with patch.object(self.module, "_calcular_conteos_reales", return_value=reales):
                    with redirect_stdout(output):
                        code = self.module.main()

        self.assertEqual(code, 1)
        texto = output.getvalue()
        self.assertIn("Resultado: ERROR", texto)
        self.assertIn("productos_publicados: esperado=6 real=5", texto)

    def test_calcular_conteos_esperados_desde_seed_canonico(self) -> None:
        with patch.dict(os.environ, {"SECRET_KEY": "tests-secret"}, clear=False):
            self.module._bootstrap_django()
            conteos = self.module._calcular_conteos_esperados()

        self.assertEqual(conteos["intenciones_publicas"], 2)
        self.assertEqual(conteos["plantas_publicadas"], 2)
        self.assertEqual(conteos["productos_publicados"], 6)
        self.assertEqual(conteos["rituales_publicados"], 1)


if __name__ == "__main__":
    unittest.main()
