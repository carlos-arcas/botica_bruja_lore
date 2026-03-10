#!/usr/bin/env python3
"""Bootstrap explícito de entorno demo/release (operación mutante)."""

from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable


@dataclass
class StepResult:
    name: str
    ok: bool
    detail: str = ""


def _print_header(title: str) -> None:
    print(f"\n=== {title} ===")


def _run(cmd: list[str]) -> subprocess.CompletedProcess[str] | None:
    try:
        return subprocess.run(
            cmd,
            cwd=ROOT_DIR,
            text=True,
            capture_output=True,
            check=False,
        )
    except FileNotFoundError:
        return None


def _print_output(result: subprocess.CompletedProcess[str]) -> None:
    if result.stdout.strip():
        print("--- stdout ---")
        print(result.stdout.strip())
    if result.stderr.strip():
        print("--- stderr ---")
        print(result.stderr.strip())


def _run_step(name: str, cmd: list[str]) -> StepResult:
    _print_header(name)
    print("$", " ".join(cmd))
    result = _run(cmd)
    if result is None:
        print("[ERROR] comando no disponible")
        return StepResult(name=name, ok=False, detail="comando no disponible")

    _print_output(result)
    if result.returncode == 0:
        print("[OK] paso completado")
        return StepResult(name=name, ok=True)

    print("[ERROR] paso fallido")
    return StepResult(name=name, ok=False, detail=f"exit={result.returncode}")


def _data_snapshot_step(name: str) -> StepResult:
    code = (
        "from backend.nucleo_herbal.infraestructura.persistencia_django.models import "
        "IntencionModelo, PlantaModelo, ProductoModelo, RitualModelo;"
        "print('intenciones_publicas=' + str(IntencionModelo.objects.filter(es_publica=True).count()));"
        "print('plantas_publicadas=' + str(PlantaModelo.objects.filter(publicada=True).count()));"
        "print('productos_publicados=' + str(ProductoModelo.objects.filter(publicado=True).count()));"
        "print('rituales_publicados=' + str(RitualModelo.objects.filter(publicado=True).count()))"
    )
    return _run_step(name, [PYTHON, "manage.py", "shell", "-c", code])


def _print_summary(results: list[StepResult]) -> int:
    _print_header("Resumen bootstrap demo")
    failed = False
    for result in results:
        status = "OK" if result.ok else "ERROR"
        detail = f" ({result.detail})" if result.detail else ""
        print(f"- [{status}] {result.name}{detail}")
        failed = failed or not result.ok

    if failed:
        print("\nVEREDICTO: ERROR — bootstrap demo incompleto.")
        return 1

    print("\nVEREDICTO: OK — bootstrap demo completado.")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bootstrap demo explícito: ejecuta migrate + seed_demo_publico y muestra conteos.",
    )
    parser.add_argument(
        "--skip-second-seed",
        action="store_true",
        help="omite la segunda ejecución de seed_demo_publico (idempotencia).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    print("== Bootstrap demo release (MUTANTE) ==")
    print("Aviso: esta operación SIEMPRE muta estado (esquema y/o datos).")
    print("No usar como gate canónico de auditoría.")

    results = [
        _run_step("A) Migrate", [PYTHON, "manage.py", "migrate", "--noinput"]),
        _run_step("B1) Seed demo pública (primera ejecución)", [PYTHON, "manage.py", "seed_demo_publico"]),
    ]

    if not args.skip_second_seed:
        results.append(
            _run_step("B2) Seed demo pública (segunda ejecución, idempotencia)", [PYTHON, "manage.py", "seed_demo_publico"])
        )

    results.append(_data_snapshot_step("C) Conteos públicos finales"))
    return _print_summary(results)


if __name__ == "__main__":
    raise SystemExit(main())
