from __future__ import annotations

import importlib.util
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_release_gate.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_release_gate_tested_contract", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckReleaseGateContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_run_block_convierte_skip_stdout_en_skip_no_bloqueante(self) -> None:
        result = subprocess.CompletedProcess(
            args=[self.module.PYTHON, "scripts/check_operational_alerts_v2.py"],
            returncode=0,
            stdout="SKIP: alertas no aplicables en este entorno (tabla ausente)\n",
            stderr="",
        )
        with patch.object(self.module, "_run", return_value=result):
            block = self.module._run_block("J) Alertas", [self.module.PYTHON, "scripts/check_operational_alerts_v2.py"])

        self.assertEqual(block.status, "SKIP")
        self.assertFalse(block.blocking)
        self.assertIn("tabla ausente", block.detail)

    def test_run_block_tolera_streams_none_sin_attribute_error(self) -> None:
        result = subprocess.CompletedProcess(
            args=["npm.cmd", "run", "build"],
            returncode=1,
            stdout=None,
            stderr=None,
        )
        with patch.object(self.module, "_run", return_value=result):
            block = self.module._run_block("G) Frontend - build", ["npm.cmd", "run", "build"])

        self.assertEqual(block.status, "ERROR")
        self.assertEqual(block.detail, "exit=1")

    def test_run_block_no_rebaja_a_skip_por_linea_incidental_en_salida_larga(self) -> None:
        result = subprocess.CompletedProcess(
            args=[self.module.PYTHON, "manage.py", "test", "tests.scripts"],
            returncode=0,
            stdout="Found 53 test(s).\nSKIP: alerta interna de prueba\nOK\n",
            stderr="",
        )
        with patch.object(self.module, "_run", return_value=result):
            block = self.module._run_block("C4) Test scripts operativos críticos", [self.module.PYTHON, "manage.py", "test", "tests.scripts"])

        self.assertEqual(block.status, "OK")
        self.assertTrue(block.blocking)

    def test_release_readiness_block_usa_script_esperado(self) -> None:
        expected = self.module.BlockResult(name="ok", status="OK", blocking=True)
        with patch.object(self.module, "_run_block", return_value=expected) as mocked:
            result = self.module._release_readiness_block()

        mocked.assert_called_once_with(
            "I) Release readiness mínimo (seguridad/privacidad/backups)",
            [self.module.PYTHON, "scripts/check_release_readiness.py"],
            blocking=True,
        )
        self.assertIs(result, expected)

    def test_operational_alerts_block_usa_script_esperado(self) -> None:
        expected = self.module.BlockResult(name="ok", status="OK", blocking=True)
        with patch.object(self.module, "_run_block", return_value=expected) as mocked:
            result = self.module._operational_alerts_block()

        mocked.assert_called_once_with(
            "J) Alertas operativas V2 (solo lectura)",
            [self.module.PYTHON, "scripts/check_operational_alerts_v2.py", "--fail-on", "blocker"],
            blocking=True,
        )
        self.assertIs(result, expected)

    def test_retry_dry_run_block_usa_script_esperado(self) -> None:
        expected = self.module.BlockResult(name="ok", status="OK", blocking=True)
        with patch.object(self.module, "_run_block", return_value=expected) as mocked:
            result = self.module._retry_operational_tasks_dry_run_block()

        mocked.assert_called_once_with(
            "K) Reintentos operativos V2 (dry-run, solo lectura)",
            [self.module.PYTHON, "scripts/retry_operational_tasks_v2.py", "--dry-run", "--json"],
            blocking=True,
        )
        self.assertIs(result, expected)

    def test_main_incluye_bloques_reconciliados(self) -> None:
        ok = self.module.BlockResult(name="ok", status="OK", blocking=True)
        info = self.module.BlockResult(name="info", status="OK", blocking=False)

        with patch.object(self.module, "_run_block", return_value=ok):
            with patch.object(self.module, "_data_snapshot_block", return_value=info):
                with patch.object(self.module, "_frontend_block", return_value=[info]):
                    with patch.object(self.module, "_operational_reconciliation_block", return_value=ok) as reconciliation:
                        with patch.object(self.module, "_release_readiness_block", return_value=ok) as readiness:
                            with patch.object(self.module, "_operational_alerts_block", return_value=ok) as alerts:
                                with patch.object(self.module, "_retry_operational_tasks_dry_run_block", return_value=ok) as retry:
                                    with patch.object(self.module, "_print_summary", return_value=0):
                                        exit_code = self.module.main()

        self.assertEqual(exit_code, 0)
        reconciliation.assert_called_once_with()
        readiness.assert_called_once_with()
        alerts.assert_called_once_with()
        retry.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
