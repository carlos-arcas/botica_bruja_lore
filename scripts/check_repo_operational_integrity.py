#!/usr/bin/env python3
"""Chequeo canónico de integridad operativa/documental del repositorio (solo lectura)."""

from __future__ import annotations

import re
import sys
import tomllib
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

CRITICAL_DOCS = [
    Path("docs/deploy_railway.md"),
    Path("docs/13_testing_ci_y_quality_gate.md"),
    Path("docs/90_estado_implementacion.md"),
]

UNWANTED_DOC_ARTIFACTS = [
    "codex-file-citation",
    "【F:",
    "†L",
    "<<<",
    ">>>",
]

WSGI_TARGET = "backend.configuracion_django.wsgi:application"
SETTINGS_ASSIGNMENT = (
    'os.environ["DJANGO_SETTINGS_MODULE"] = "backend.configuracion_django.settings"'
)


class ValidationError(Exception):
    """Error de validación bloqueante para el chequeo de integridad."""


def _read_text(relative_path: Path) -> str:
    return (ROOT_DIR / relative_path).read_text(encoding="utf-8")


def _load_toml(relative_path: Path) -> dict:
    with (ROOT_DIR / relative_path).open("rb") as file_handle:
        return tomllib.load(file_handle)


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def _check_critical_markdown() -> None:
    print("A) Markdown crítico")
    for relative_path in CRITICAL_DOCS:
        content = _read_text(relative_path)

        fence_count = content.count("```")
        _require(
            fence_count % 2 == 0,
            f"{relative_path}: número impar de fences ``` ({fence_count}).",
        )
        _require(
            content.endswith("\n"),
            f"{relative_path}: el archivo debe terminar con salto de línea.",
        )

        for artifact in UNWANTED_DOC_ARTIFACTS:
            _require(
                artifact not in content,
                f"{relative_path}: artefacto indeseado detectado: '{artifact}'.",
            )

    print("[OK] Markdown crítico válido")


def _check_backend_boot_coherence() -> None:
    print("B) Coherencia de arranque backend")
    procfile_content = _read_text(Path("Procfile"))
    backend_toml_content = _read_text(Path("backend/railway.toml"))
    manage_content = _read_text(Path("manage.py"))
    wsgi_content = _read_text(Path("backend/configuracion_django/wsgi.py"))

    _require(
        WSGI_TARGET in procfile_content,
        "Procfile debe contener backend.configuracion_django.wsgi:application.",
    )
    _require(
        WSGI_TARGET in backend_toml_content,
        "backend/railway.toml debe contener backend.configuracion_django.wsgi:application.",
    )
    _require(
        SETTINGS_ASSIGNMENT in manage_content,
        "manage.py debe forzar backend.configuracion_django.settings.",
    )
    _require(
        SETTINGS_ASSIGNMENT in wsgi_content,
        "backend/configuracion_django/wsgi.py debe forzar backend.configuracion_django.settings.",
    )

    print("[OK] Arranque backend coherente")


def _check_railway_toml_coherence() -> None:
    print("C) Coherencia de configuración Railway")
    backend_toml = _load_toml(Path("backend/railway.toml"))
    frontend_toml = _load_toml(Path("frontend/railway.toml"))

    _require("build" in backend_toml, "backend/railway.toml debe incluir sección [build].")
    _require("deploy" in backend_toml, "backend/railway.toml debe incluir sección [deploy].")
    _require("builder" in backend_toml["build"], "backend/railway.toml requiere build.builder.")
    _require(
        "startCommand" in backend_toml["deploy"],
        "backend/railway.toml requiere deploy.startCommand.",
    )
    _require(
        backend_toml["deploy"].get("healthcheckPath") == "/healthz",
        "backend/railway.toml debe usar deploy.healthcheckPath='/healthz'.",
    )

    _require("build" in frontend_toml, "frontend/railway.toml debe incluir sección [build].")
    _require("deploy" in frontend_toml, "frontend/railway.toml debe incluir sección [deploy].")
    _require("builder" in frontend_toml["build"], "frontend/railway.toml requiere build.builder.")
    start_command = frontend_toml["deploy"].get("startCommand")
    _require(
        isinstance(start_command, str) and start_command.strip(),
        "frontend/railway.toml debe tener deploy.startCommand no vacío.",
    )

    print("[OK] Railway TOML coherente")


def _check_railway_env_example() -> None:
    print("D) Coherencia de .env.railway.example")
    content = _read_text(Path(".env.railway.example"))

    required_entries = [
        "SECRET_KEY=",
        "DEBUG=false",
        "ALLOWED_HOSTS=",
        "CSRF_TRUSTED_ORIGINS=",
        "DATABASE_URL=${{Postgres.DATABASE_URL}}",
        "NEXT_PUBLIC_API_BASE_URL=",
    ]

    for entry in required_entries:
        _require(entry in content, f".env.railway.example debe contener '{entry}'.")

    _require(
        "SERVICE_NAME.DATABASE_URL" not in content,
        ".env.railway.example no debe contener 'SERVICE_NAME.DATABASE_URL'; usar Postgres.",
    )

    for legacy_var in ("APP_DEBUG", "DJANGO_SETTINGS_MODULE", "WSGI_APPLICATION"):
        _require(
            legacy_var in content,
            f".env.railway.example debe incluir referencia explícita a variable legacy '{legacy_var}'.",
        )

    print("[OK] .env.railway.example coherente")


def _check_ci_docs_canonical_command() -> None:
    print("E) Coherencia CI <-> documentación")
    workflow_content = _read_text(Path(".github/workflows/quality_gate.yml"))
    docs_gate_content = _read_text(Path("docs/13_testing_ci_y_quality_gate.md"))

    canonical_command = "python scripts/check_release_gate.py"
    workflow_gate_patterns = (
        r"(?i)python(?:3(?:\.\d+)?)?\s+scripts/check_release_gate\.py\b",
        r'(?i)"?\$env:VENV_PYTHON"?\s+scripts/check_release_gate\.py\b',
    )

    _require(
        any(re.search(pattern, workflow_content) for pattern in workflow_gate_patterns),
        (
            ".github/workflows/quality_gate.yml debe ejecutar scripts/check_release_gate.py "
            "(ya sea con python directo o con $env:VENV_PYTHON)."
        ),
    )
    _require(
        canonical_command in docs_gate_content,
        "docs/13_testing_ci_y_quality_gate.md debe mencionar python scripts/check_release_gate.py como comando canónico.",
    )

    # Trazabilidad explícita adicional en docs para evitar ambigüedad semántica.
    _require(
        re.search(r"comando can[oó]nico", docs_gate_content, flags=re.IGNORECASE) is not None,
        "docs/13_testing_ci_y_quality_gate.md debe declarar el comando canónico de gate.",
    )

    print("[OK] CI y documentación alineados")


def main() -> int:
    print("== Chequeo canónico: integridad operativa/documental del repo ==")
    try:
        _check_critical_markdown()
        _check_backend_boot_coherence()
        _check_railway_toml_coherence()
        _check_railway_env_example()
        _check_ci_docs_canonical_command()
    except FileNotFoundError as error:
        print(f"[ERROR] Archivo requerido no encontrado: {error.filename}")
        return 1
    except (tomllib.TOMLDecodeError, ValidationError) as error:
        print(f"[ERROR] {error}")
        return 1

    print("Integridad operativa/documental validada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
