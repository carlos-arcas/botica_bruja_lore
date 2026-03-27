#!/usr/bin/env python3
"""Chequeo mínimo de release readiness para seguridad/configuración y backups."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

_ENV_REQUIRED = (
    "SECRET_KEY=",
    "DATABASE_URL=",
    "PUBLIC_SITE_URL=",
    "DEFAULT_FROM_EMAIL=",
    "STRIPE_PUBLIC_KEY=",
    "STRIPE_SECRET_KEY=",
    "STRIPE_WEBHOOK_SECRET=",
    "PAYMENT_SUCCESS_URL=",
    "PAYMENT_CANCEL_URL=",
    "EMAIL_BACKEND=",
)

_PREBOOT_REQUIRED_VARS = (
    "SECRET_KEY",
    "DATABASE_URL",
    "PUBLIC_SITE_URL",
    "PAYMENT_SUCCESS_URL",
    "PAYMENT_CANCEL_URL",
    "DEFAULT_FROM_EMAIL",
    "EMAIL_BACKEND",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
)

_RELEASE_DOC_REQUIRED_MARKERS = (
    "CHECKLIST DE RELEASE",
    "PRIVACIDAD OPERATIVA",
    "Fuente canónica previa al boot",
    "HTTPS absoluto",
    "dominio real (no `.local`)",
    "SMTP real",
    "pg_dump",
    "pg_restore",
    "backup_restore_postgres.py",
    "BOTICA_BACKUP_DIR",
)

_DEPLOY_DOC_SECTION_START = "## 2) Variables requeridas en Railway UI"
_DEPLOY_DOC_SECTION_END = "### 2.1) Admin provisional seguro (opcional y controlado)"


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def _require_markers(content: str, markers: tuple[str, ...], file_label: str) -> None:
    for marker in markers:
        _require(marker in content, f"Falta '{marker}' en {file_label}")


def _extract_section(content: str, start_marker: str, end_marker: str, file_label: str) -> str:
    start = content.find(start_marker)
    end = content.find(end_marker)
    _require(start >= 0, f"No se encontró '{start_marker}' en {file_label}")
    _require(end > start, f"No se encontró '{end_marker}' después de '{start_marker}' en {file_label}")
    return content[start:end]


def _check_env_example() -> None:
    print("A) .env.railway.example endurecido")
    content = (ROOT_DIR / ".env.railway.example").read_text(encoding="utf-8")
    _require_markers(content, _ENV_REQUIRED, ".env.railway.example")
    print("[OK] Variables críticas documentadas en .env.railway.example")


def _check_release_doc() -> None:
    print("B) Contrato documental preflight (release + Railway)")
    release_content = (ROOT_DIR / "docs/release_readiness_minima.md").read_text(encoding="utf-8")
    deploy_content = (ROOT_DIR / "docs/deploy_railway.md").read_text(encoding="utf-8")
    deploy_variables_section = _extract_section(
        deploy_content,
        _DEPLOY_DOC_SECTION_START,
        _DEPLOY_DOC_SECTION_END,
        "docs/deploy_railway.md",
    )
    _require_markers(
        release_content,
        _RELEASE_DOC_REQUIRED_MARKERS,
        "docs/release_readiness_minima.md",
    )
    _require_markers(
        release_content,
        _PREBOOT_REQUIRED_VARS,
        "docs/release_readiness_minima.md",
    )
    _require_markers(
        deploy_variables_section,
        _PREBOOT_REQUIRED_VARS,
        "docs/deploy_railway.md (sección Railway UI)",
    )
    print("[OK] Checklist release y contrato Railway previos al boot están alineados")


def _check_runtime_env_safety() -> None:
    print("C) Variables sensibles en entorno actual (solo aviso)")
    maybe_secret = []
    for key in ("SECRET_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "ADMIN_PASSWORD_PROVISIONAL"):
        value = os.getenv(key, "")
        if value and re.search(r"(demo|test|changeme|1234)", value, flags=re.IGNORECASE):
            maybe_secret.append(key)

    if maybe_secret:
        print("[WARNING] Variables potencialmente débiles detectadas:", ", ".join(maybe_secret))
    else:
        print("[OK] No se detectaron secretos obviamente débiles en entorno actual")


def main() -> int:
    print("== Release readiness mínimo: seguridad, privacidad y backups ==")
    try:
        _check_env_example()
        _check_release_doc()
        _check_runtime_env_safety()
    except FileNotFoundError as error:
        print(f"[ERROR] Archivo requerido no encontrado: {error.filename}")
        return 1
    except RuntimeError as error:
        print(f"[ERROR] {error}")
        return 1

    print("Release readiness mínimo validado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
