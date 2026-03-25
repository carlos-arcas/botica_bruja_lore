#!/usr/bin/env python3
"""Backups lógicos y restore drill mínimo para PostgreSQL (operación v2-r01)."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_PREFIX = "botica_backup"


@dataclass(frozen=True, slots=True)
class BackupPlan:
    database_url: str
    output_file: Path


@dataclass(frozen=True, slots=True)
class RestorePlan:
    restore_database_url: str
    dump_file: Path


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Backup lógico y restore drill mínimo para PostgreSQL.")
    parser.add_argument("mode", choices=("backup", "restore-drill"))
    parser.add_argument("--dry-run", action="store_true", help="Muestra el plan y valida prerequisitos sin ejecutar pg_dump/pg_restore.")
    parser.add_argument("--backup-dir", default=os.environ.get("BOTICA_BACKUP_DIR", ""))
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL", ""))
    parser.add_argument("--restore-database-url", default=os.environ.get("BOTICA_RESTORE_DATABASE_URL", ""))
    parser.add_argument("--dump-file", default="", help="Ruta al dump .dump (solo restore-drill).")
    parser.add_argument("--filename-prefix", default=DEFAULT_PREFIX)
    return parser.parse_args()


def _mask_database_url(url: str) -> str:
    if "@" not in url or "://" not in url:
        return "<masked-invalid-or-empty-url>"
    schema, rest = url.split("://", 1)
    if "@" not in rest:
        return "<masked-invalid-or-empty-url>"
    _, host_and_db = rest.split("@", 1)
    return f"{schema}://***@{host_and_db}"


def _resolve_backup_dir(raw_value: str) -> Path:
    value = raw_value.strip()
    if not value:
        raise RuntimeError("Debes definir --backup-dir o BOTICA_BACKUP_DIR.")
    backup_dir = Path(value).expanduser().resolve()
    try:
        backup_dir.relative_to(ROOT_DIR)
    except ValueError:
        return backup_dir
    raise RuntimeError("La ruta de backup debe quedar fuera del repositorio para no versionar dumps.")


def _build_backup_plan(args: argparse.Namespace) -> BackupPlan:
    db_url = args.database_url.strip()
    if not db_url:
        raise RuntimeError("Debes definir --database-url o DATABASE_URL.")

    backup_dir = _resolve_backup_dir(args.backup_dir)
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    filename = f"{args.filename_prefix.strip() or DEFAULT_PREFIX}_{timestamp}.dump"
    return BackupPlan(database_url=db_url, output_file=backup_dir / filename)


def _build_restore_plan(args: argparse.Namespace) -> RestorePlan:
    db_url = args.restore_database_url.strip()
    if not db_url:
        raise RuntimeError("Debes definir --restore-database-url o BOTICA_RESTORE_DATABASE_URL.")

    dump_raw = args.dump_file.strip()
    if not dump_raw:
        raise RuntimeError("Debes definir --dump-file para restore-drill.")

    dump_file = Path(dump_raw).expanduser().resolve()
    if not dump_file.exists():
        raise RuntimeError(f"El dump indicado no existe: {dump_file}")

    return RestorePlan(restore_database_url=db_url, dump_file=dump_file)


def _require_binary(name: str) -> None:
    if shutil.which(name):
        return
    raise RuntimeError(f"No se encontró '{name}' en PATH.")


def _run(command: list[str]) -> int:
    process = subprocess.run(command, text=True, capture_output=True, check=False)
    if process.stdout.strip():
        print("--- stdout ---")
        print(process.stdout.strip())
    if process.stderr.strip():
        print("--- stderr ---")
        print(process.stderr.strip())
    return process.returncode


def _exec_backup(plan: BackupPlan, dry_run: bool) -> int:
    print("== Backup lógico PostgreSQL ==")
    print(f"database_url={_mask_database_url(plan.database_url)}")
    print(f"output_file={plan.output_file}")
    cmd = [
        "pg_dump",
        "--no-owner",
        "--no-privileges",
        "--format=custom",
        f"--file={plan.output_file}",
        plan.database_url,
    ]
    print("command=", " ".join(cmd[:-1] + [_mask_database_url(plan.database_url)]))

    if dry_run:
        print("[DRY-RUN] No se ejecuta pg_dump.")
        return 0

    _require_binary("pg_dump")
    plan.output_file.parent.mkdir(parents=True, exist_ok=True)
    exit_code = _run(cmd)
    if exit_code == 0:
        print("[OK] Backup completado.")
        return 0
    print(f"[ERROR] Backup falló (exit={exit_code}).")
    return exit_code


def _exec_restore_drill(plan: RestorePlan, dry_run: bool) -> int:
    print("== Restore drill mínimo PostgreSQL ==")
    print(f"restore_database_url={_mask_database_url(plan.restore_database_url)}")
    print(f"dump_file={plan.dump_file}")
    cmd = [
        "pg_restore",
        "--no-owner",
        "--no-privileges",
        "--clean",
        "--if-exists",
        f"--dbname={plan.restore_database_url}",
        str(plan.dump_file),
    ]
    print("command=", " ".join(cmd[:-2] + [f"--dbname={_mask_database_url(plan.restore_database_url)}", str(plan.dump_file)]))

    if dry_run:
        print("[DRY-RUN] No se ejecuta pg_restore.")
        return 0

    _require_binary("pg_restore")
    exit_code = _run(cmd)
    if exit_code == 0:
        print("[OK] Restore drill completado.")
        return 0
    print(f"[ERROR] Restore drill falló (exit={exit_code}).")
    return exit_code


def main() -> int:
    args = _parse_args()
    try:
        if args.mode == "backup":
            plan = _build_backup_plan(args)
            return _exec_backup(plan, args.dry_run)
        plan = _build_restore_plan(args)
        return _exec_restore_drill(plan, args.dry_run)
    except RuntimeError as error:
        print(f"[ERROR] {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
