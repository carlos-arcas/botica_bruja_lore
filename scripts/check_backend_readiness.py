#!/usr/bin/env python3
"""Smoke check canónico para readiness técnica del backend Django."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable

SETTINGS_MODULE = "backend.configuracion_django.settings"
EXPECTED_DB_ERROR = "DATABASE_URL es obligatoria en Railway/producción."
EXPECTED_SECRET_ERROR = (
    "SECRET_KEY es obligatoria cuando DEBUG=false o en Railway/producción."
)


def _base_env() -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT_DIR)
    env.setdefault("LC_ALL", "C.UTF-8")
    env.setdefault("LANG", "C.UTF-8")
    return env


def _run(cmd: list[str], env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=ROOT_DIR,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


def _assert_success(result: subprocess.CompletedProcess[str], label: str) -> None:
    if result.returncode == 0:
        print(f"[OK] {label}")
        return

    print(f"[ERROR] {label}")
    if result.stdout.strip():
        print("--- stdout ---")
        print(result.stdout.strip())
    if result.stderr.strip():
        print("--- stderr ---")
        print(result.stderr.strip())
    raise SystemExit(1)


def _assert_failure_contains(
    result: subprocess.CompletedProcess[str],
    label: str,
    expected_message: str,
) -> None:
    output = f"{result.stdout}\n{result.stderr}"
    if result.returncode != 0 and expected_message in output:
        print(f"[OK] {label}")
        return

    print(f"[ERROR] {label}")
    print("--- stdout ---")
    print(result.stdout.strip())
    print("--- stderr ---")
    print(result.stderr.strip())
    raise SystemExit(1)


def _case_a_local_reasonable() -> None:
    env = _base_env()
    for key in (
        "DATABASE_URL",
        "RAILWAY_PUBLIC_DOMAIN",
        "RAILWAY_ENVIRONMENT_ID",
        "RAILWAY_PROJECT_ID",
    ):
        env.pop(key, None)

    result = _run([PYTHON, "manage.py", "check"], env)
    _assert_success(result, "Caso A: local sin Railway ni DATABASE_URL arranca con fallback SQLite")


def _case_b_railway_without_database_url() -> None:
    env = _base_env()
    env["RAILWAY_ENVIRONMENT_ID"] = "smoke-test"
    env["SECRET_KEY"] = "smoke-secret"
    env.pop("DATABASE_URL", None)

    code = (
        "import backend.configuracion_django.settings as settings;"
        "print(settings.DATABASES['default']['ENGINE'])"
    )
    result = _run([PYTHON, "-c", code], env)
    _assert_failure_contains(
        result,
        "Caso B: Railway sin DATABASE_URL falla con error canónico",
        EXPECTED_DB_ERROR,
    )


def _case_c_production_without_secret_key() -> None:
    env = _base_env()
    env["DEBUG"] = "false"
    env["DATABASE_URL"] = "sqlite:///var/dev.sqlite3"
    env.pop("SECRET_KEY", None)
    env.pop("RAILWAY_PUBLIC_DOMAIN", None)
    env.pop("RAILWAY_ENVIRONMENT_ID", None)
    env.pop("RAILWAY_PROJECT_ID", None)

    code = f"import {SETTINGS_MODULE}"
    result = _run([PYTHON, "-c", code], env)
    _assert_failure_contains(
        result,
        "Caso C: DEBUG=false sin SECRET_KEY falla por hardening",
        EXPECTED_SECRET_ERROR,
    )


def _case_d_repo_bootstrap_integrity() -> None:
    manage_content = (ROOT_DIR / "manage.py").read_text(encoding="utf-8")
    wsgi_content = (ROOT_DIR / "backend/configuracion_django/wsgi.py").read_text(
        encoding="utf-8"
    )

    required_assignment = 'os.environ["DJANGO_SETTINGS_MODULE"] = "backend.configuracion_django.settings"'

    if required_assignment not in manage_content:
        print("[ERROR] Caso D: manage.py no fuerza backend.configuracion_django.settings")
        raise SystemExit(1)

    if required_assignment not in wsgi_content:
        print("[ERROR] Caso D: wsgi.py no fuerza backend.configuracion_django.settings")
        raise SystemExit(1)

    env = _base_env()
    env.pop("DATABASE_URL", None)
    env.pop("RAILWAY_PUBLIC_DOMAIN", None)
    env.pop("RAILWAY_ENVIRONMENT_ID", None)
    env.pop("RAILWAY_PROJECT_ID", None)

    code = (
        "from backend.configuracion_django.wsgi import application;"
        "print(application.__class__.__name__)"
    )
    result = _run([PYTHON, "-c", code], env)
    _assert_success(result, "Caso D: WSGI canónico del repo es importable")


def main() -> None:
    print("== Backend readiness check (canónico) ==")
    _case_a_local_reasonable()
    _case_b_railway_without_database_url()
    _case_c_production_without_secret_key()
    _case_d_repo_bootstrap_integrity()
    print("Readiness técnica validada.")


if __name__ == "__main__":
    main()
