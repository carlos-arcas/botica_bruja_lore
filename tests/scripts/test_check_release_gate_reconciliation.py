from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_release_gate.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_release_gate_tested_reconciliation", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckReleaseGateReconciliationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_reconciliation_block_es_bloqueante_y_usa_fail_on_blocker(self) -> None:
        expected = self.module.BlockResult(name="ok", status="OK", blocking=True)
        with patch.object(self.module, "_run_block", return_value=expected) as mocked:
            resultado = self.module._operational_reconciliation_block()

        mocked.assert_called_once_with(
            "H) Conciliación operativa (BLOCKER/WARNING/INFO, solo lectura)",
            [self.module.PYTHON, "scripts/check_operational_reconciliation.py", "--fail-on", "blocker"],
            blocking=True,
        )
        self.assertIs(resultado, expected)


if __name__ == "__main__":
    unittest.main()
