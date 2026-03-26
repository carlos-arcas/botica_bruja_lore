from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_release_gate.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_release_gate_tested_frontend", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckReleaseGateFrontendTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_resolver_usa_npm_cmd_en_windows(self) -> None:
        def fake_which(executable: str) -> str | None:
            return "C:/node/npm.cmd" if executable == "npm.cmd" else None

        with patch.object(self.module.platform, "system", return_value="Windows"):
            with patch.object(self.module.shutil, "which", side_effect=fake_which):
                self.assertEqual(self.module._resolve_npm_executable(), "npm.cmd")

    def test_frontend_block_ejecuta_comandos_con_npm_cmd_en_windows(self) -> None:
        def fake_which(executable: str) -> str | None:
            available = {
                "npm.cmd": "C:/node/npm.cmd",
                "node": "C:/node/node.exe",
            }
            return available.get(executable)

        ok = self.module.BlockResult(name="ok", status="OK", blocking=True)
        with patch.object(self.module.platform, "system", return_value="Windows"):
            with patch.object(self.module.shutil, "which", side_effect=fake_which):
                with patch.object(self.module, "_run_block", return_value=ok) as mocked:
                    results = self.module._frontend_block()

        self.assertEqual(results, [ok, ok, ok, ok, ok])
        self.assertEqual([call.args[1][0] for call in mocked.call_args_list], ["npm.cmd"] * 5)


if __name__ == "__main__":
    unittest.main()
