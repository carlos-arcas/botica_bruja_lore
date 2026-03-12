from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_seo_contract.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_seo_contract_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckSeoContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_resolver_usa_npm_cmd_en_windows(self) -> None:
        def fake_which(executable: str) -> str | None:
            return "C:/node/npm.cmd" if executable == "npm.cmd" else None

        with patch.object(self.module.platform, "system", return_value="Windows"):
            with patch.object(self.module.shutil, "which", side_effect=fake_which):
                self.assertEqual(self.module._resolver_ejecutable_npm(), "npm.cmd")

    def test_resolver_usa_npm_en_unix(self) -> None:
        def fake_which(executable: str) -> str | None:
            return "/usr/bin/npm" if executable == "npm" else None

        with patch.object(self.module.platform, "system", return_value="Linux"):
            with patch.object(self.module.shutil, "which", side_effect=fake_which):
                self.assertEqual(self.module._resolver_ejecutable_npm(), "npm")


if __name__ == "__main__":
    unittest.main()
