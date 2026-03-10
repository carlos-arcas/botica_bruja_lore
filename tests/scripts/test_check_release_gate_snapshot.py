from __future__ import annotations

import importlib.util
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_release_gate.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_release_gate_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckReleaseGateSnapshotTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_snapshot_expected_db_issue_is_clean_skip(self) -> None:
        result = subprocess.CompletedProcess(
            args=["python", "manage.py", "shell"],
            returncode=0,
            stdout="SNAPSHOT_SKIP: no such table: herbal_planta\n",
            stderr="",
        )
        with patch.object(self.module, "_run", return_value=result):
            block = self.module._data_snapshot_block()

        self.assertEqual(block.status, "SKIP")
        self.assertFalse(block.blocking)
        self.assertIn("no such table", block.detail)


if __name__ == "__main__":
    unittest.main()
