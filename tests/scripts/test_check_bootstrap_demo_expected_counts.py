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

CONTEOS_CANONICOS_VIGENTES = {
    "intenciones_publicas": 4,
    "plantas_publicadas": 4,
    "productos_publicados": 14,
    "rituales_publicados": 5,
}


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
        conteos_stub = {
            "intenciones_publicas": 1,
            "plantas_publicadas": 1,
            "productos_publicados": 1,
            "rituales_publicados": 1,
        }
        output = io.StringIO()

        with patch.object(self.module, "_bootstrap_django"):
            with patch.object(
                self.module, "_calcular_conteos_esperados", return_value=conteos_stub
            ):
                with patch.object(
                    self.module, "_calcular_conteos_reales", return_value=conteos_stub
                ):
                    with redirect_stdout(output):
                        code = self.module.main()

        self.assertEqual(code, 0)
        self.assertIn("Resultado: OK", output.getvalue())

    def test_main_falla_con_mismatch_de_productos(self) -> None:
        conteos_stub = {
            "intenciones_publicas": 1,
            "plantas_publicadas": 1,
            "productos_publicados": 3,
            "rituales_publicados": 1,
        }
        reales = dict(conteos_stub)
        reales["productos_publicados"] = 5
        output = io.StringIO()

        with patch.object(self.module, "_bootstrap_django"):
            with patch.object(
                self.module, "_calcular_conteos_esperados", return_value=conteos_stub
            ):
                with patch.object(self.module, "_calcular_conteos_reales", return_value=reales):
                    with redirect_stdout(output):
                        code = self.module.main()

        self.assertEqual(code, 1)
        texto = output.getvalue()
        self.assertIn("Resultado: ERROR", texto)
        self.assertIn("productos_publicados: esperado=3 real=5", texto)

    def test_calcular_conteos_esperados_desde_seed_canonico_expandido(self) -> None:
        with patch.dict(os.environ, {"SECRET_KEY": "tests-secret"}, clear=False):
            self.module._bootstrap_django()
            conteos = self.module._calcular_conteos_esperados()

        self.assertEqual(conteos, CONTEOS_CANONICOS_VIGENTES)


if __name__ == "__main__":
    unittest.main()
