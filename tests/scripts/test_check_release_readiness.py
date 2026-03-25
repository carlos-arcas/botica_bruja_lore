from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase

ROOT_DIR = Path(__file__).resolve().parents[2]
SCRIPT = ROOT_DIR / "scripts" / "check_release_readiness.py"


class CheckReleaseReadinessTests(SimpleTestCase):
    def test_script_success(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPT)],
            cwd=ROOT_DIR,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertIn("Release readiness mínimo validado.", result.stdout)
