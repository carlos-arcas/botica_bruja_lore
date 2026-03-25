from __future__ import annotations

import importlib.util
import io
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "backup_restore_postgres.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("backup_restore_postgres_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class BackupRestorePostgresTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_mask_database_url_hides_credentials(self) -> None:
        masked = self.module._mask_database_url("postgresql://user:secret@host:5432/db")
        self.assertEqual(masked, "postgresql://***@host:5432/db")

    def test_resolve_backup_dir_rejects_repo_internal_path(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "fuera del repositorio"):
            self.module._resolve_backup_dir(str(self.module.ROOT_DIR / "var" / "backups"))

    def test_backup_dry_run_ok_without_pg_dump_binary(self) -> None:
        with TemporaryDirectory() as tempdir:
            argv = [
                "backup_restore_postgres.py",
                "backup",
                "--dry-run",
                "--backup-dir",
                tempdir,
                "--database-url",
                "postgresql://user:secret@localhost:5432/botica",
            ]
            stdout = io.StringIO()
            with redirect_stdout(stdout):
                with mock.patch.object(sys, "argv", argv):
                    code = self.module.main()
            self.assertEqual(code, 0)
            self.assertIn("[DRY-RUN] No se ejecuta pg_dump.", stdout.getvalue())

    def test_restore_drill_requires_existing_dump(self) -> None:
        with TemporaryDirectory() as tempdir:
            dump_path = Path(tempdir) / "missing.dump"
            argv = [
                "backup_restore_postgres.py",
                "restore-drill",
                "--dry-run",
                "--restore-database-url",
                "postgresql://user:secret@localhost:5432/botica_restore",
                "--dump-file",
                str(dump_path),
            ]
            stdout = io.StringIO()
            with redirect_stdout(stdout):
                with mock.patch.object(sys, "argv", argv):
                    code = self.module.main()
            self.assertEqual(code, 1)
            self.assertIn("no existe", stdout.getvalue())

    def test_restore_drill_dry_run_ok(self) -> None:
        with TemporaryDirectory() as tempdir:
            dump_path = Path(tempdir) / "ok.dump"
            dump_path.write_text("dummy", encoding="utf-8")
            argv = [
                "backup_restore_postgres.py",
                "restore-drill",
                "--dry-run",
                "--restore-database-url",
                "postgresql://user:secret@localhost:5432/botica_restore",
                "--dump-file",
                str(dump_path),
            ]
            stdout = io.StringIO()
            with redirect_stdout(stdout):
                with mock.patch.object(sys, "argv", argv):
                    code = self.module.main()
            self.assertEqual(code, 0)
            self.assertIn("[DRY-RUN] No se ejecuta pg_restore.", stdout.getvalue())


if __name__ == "__main__":
    unittest.main()
