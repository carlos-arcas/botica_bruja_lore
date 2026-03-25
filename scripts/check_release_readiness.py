#!/usr/bin/env python3
"""Chequeo mínimo de release readiness para seguridad/configuración y backups."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

_ENV_REQUIRED = (
    "PUBLIC_SITE_URL=",
    "DEFAULT_FROM_EMAIL=",
    "STRIPE_PUBLIC_KEY=",
    "STRIPE_SECRET_KEY=",
    "STRIPE_WEBHOOK_SECRET=",
    "PAYMENT_SUCCESS_URL=",
    "PAYMENT_CANCEL_URL=",
)


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def _check_env_example() -> None:
    print("A) .env.railway.example endurecido")
    content = (ROOT_DIR / ".env.railway.example").read_text(encoding="utf-8")
    for entry in _ENV_REQUIRED:
        _require(entry in content, f"Falta '{entry}' en .env.railway.example")
    print("[OK] Variables críticas documentadas en .env.railway.example")


def _check_release_doc() -> None:
    print("B) Checklist release + backup/restore")
    content = (ROOT_DIR / "docs/release_readiness_minima.md").read_text(encoding="utf-8")
    required_markers = (
        "pg_dump",
        "pg_restore",
        "CHECKLIST DE RELEASE",
        "PRIVACIDAD OPERATIVA",
    )
    for marker in required_markers:
        _require(marker in content, f"Falta marcador obligatorio '{marker}' en docs/release_readiness_minima.md")
    print("[OK] Checklist y estrategia mínima de backup/restore presentes")


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
