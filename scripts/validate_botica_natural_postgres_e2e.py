#!/usr/bin/env python3
"""Validación real de Botica Natural contra PostgreSQL (sin mocks)."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable

EXPECTED_SECTION = "botica-natural"
EXPECTED_COUNT = 5


@dataclass
class StepResult:
    name: str
    ok: bool
    detail: str = ""


def _run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=ROOT_DIR,
        text=True,
        capture_output=True,
        check=False,
    )


def _print_command(cmd: list[str]) -> None:
    print(f"$ {' '.join(cmd)}")


def _print_output(result: subprocess.CompletedProcess[str]) -> None:
    if result.stdout.strip():
        print("--- stdout ---")
        print(result.stdout.strip())
    if result.stderr.strip():
        print("--- stderr ---")
        print(result.stderr.strip())


def _step_command(name: str, cmd: list[str]) -> StepResult:
    print(f"\n=== {name} ===")
    _print_command(cmd)
    result = _run(cmd)
    _print_output(result)
    if result.returncode == 0:
        return StepResult(name=name, ok=True)
    return StepResult(name=name, ok=False, detail=f"exit={result.returncode}")


def _step_orm_verification() -> StepResult:
    print("\n=== Verificación ORM: 5 productos públicos de botica-natural ===")
    code = (
        "from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo;"
        f"qs=ProductoModelo.objects.filter(publicado=True,seccion_publica='{EXPECTED_SECTION}').order_by('slug');"
        "print('count=' + str(qs.count()));"
        "print('slugs=' + json.dumps(list(qs.values_list('slug', flat=True))))"
    )
    cmd = [PYTHON, "manage.py", "shell", "-c", f"import json; {code}"]
    _print_command(cmd)
    result = _run(cmd)
    _print_output(result)
    if result.returncode != 0:
        return StepResult(name="verificacion_orm", ok=False, detail=f"exit={result.returncode}")
    if f"count={EXPECTED_COUNT}" not in result.stdout:
        return StepResult(name="verificacion_orm", ok=False, detail="conteo inesperado")
    return StepResult(name="verificacion_orm", ok=True)


def _step_endpoint_verification() -> StepResult:
    print("\n=== Verificación endpoint público ===")
    backend_base = os.environ.get("BACKEND_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    url = f"{backend_base}/api/v1/herbal/secciones/{EXPECTED_SECTION}/productos/"
    print(f"$ GET {url}")
    request = urllib.request.Request(url, headers={"Accept": "application/json"}, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8")
            payload = json.loads(body)
    except urllib.error.URLError as error:
        return StepResult(name="verificacion_endpoint", ok=False, detail=f"sin conexión: {error.reason}")
    except (TimeoutError, json.JSONDecodeError, UnicodeDecodeError) as error:
        return StepResult(name="verificacion_endpoint", ok=False, detail=str(error))

    productos = payload.get("productos") if isinstance(payload, dict) else None
    if not isinstance(productos, list):
        return StepResult(name="verificacion_endpoint", ok=False, detail="respuesta sin lista 'productos'")
    print(f"productos_count={len(productos)}")
    if len(productos) != EXPECTED_COUNT:
        return StepResult(name="verificacion_endpoint", ok=False, detail="conteo de endpoint inesperado")
    return StepResult(name="verificacion_endpoint", ok=True)


def _summary(results: list[StepResult]) -> int:
    print("\n=== Resumen validación Botica Natural ===")
    has_errors = False
    for result in results:
        status = "OK" if result.ok else "ERROR"
        detail = f" ({result.detail})" if result.detail else ""
        print(f"- [{status}] {result.name}{detail}")
        has_errors = has_errors or not result.ok

    if has_errors:
        print("\nVEREDICTO: NO DONE")
        return 1

    print("\nVEREDICTO: DONE")
    return 0


def main() -> int:
    if not os.environ.get("DATABASE_URL"):
        print("[ERROR] Debes definir DATABASE_URL apuntando a PostgreSQL real.")
        return 2
    if not os.environ.get("SECRET_KEY"):
        print("[ERROR] Debes definir SECRET_KEY para ejecutar comandos Django con DATABASE_URL.")
        return 2

    print("== Validación E2E Botica Natural contra PostgreSQL ==")
    results = [
        _step_command("migrate", [PYTHON, "manage.py", "migrate", "--noinput"]),
        _step_command("seed_demo_publico", [PYTHON, "manage.py", "seed_demo_publico"]),
        _step_orm_verification(),
        _step_endpoint_verification(),
    ]
    return _summary(results)


if __name__ == "__main__":
    raise SystemExit(main())
