#!/usr/bin/env python3
"""Gate técnico canónico para demo/release del repositorio."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable


@dataclass
class BlockResult:
    name: str
    status: str
    blocking: bool
    detail: str = ""


def _print_header(title: str) -> None:
    print(f"\n=== {title} ===")


def _run(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str] | None:
    try:
        return subprocess.run(
            cmd,
            cwd=cwd or ROOT_DIR,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
    except FileNotFoundError:
        return None


def _print_process_output(result: subprocess.CompletedProcess[str]) -> None:
    if result.stdout.strip():
        print("--- stdout ---")
        print(result.stdout.strip())
    if result.stderr.strip():
        print("--- stderr ---")
        print(result.stderr.strip())


def _run_block(name: str, cmd: list[str], *, blocking: bool = True, cwd: Path | None = None) -> BlockResult:
    _print_header(name)
    print("$", " ".join(cmd))
    result = _run(cmd, cwd=cwd)

    if result is None:
        print("[SKIP] comando no disponible en el entorno")
        return BlockResult(name=name, status="SKIP", blocking=False, detail="comando no disponible")

    _print_process_output(result)
    if result.returncode == 0:
        print("[OK] bloque completado")
        return BlockResult(name=name, status="OK", blocking=blocking)

    print("[ERROR] bloque fallido")
    return BlockResult(name=name, status="ERROR", blocking=blocking, detail=f"exit={result.returncode}")


def _seed_demo_block() -> BlockResult:
    name = "D) Seed demo pública idempotente"
    _print_header(name)

    migrate = _run([PYTHON, "manage.py", "migrate", "--noinput"])
    print("$", f"{PYTHON} manage.py migrate --noinput  # precondición de tablas")
    if migrate is None:
        print("[ERROR] Python no disponible para ejecutar migrate")
        return BlockResult(name=name, status="ERROR", blocking=True, detail="python no disponible")
    _print_process_output(migrate)
    if migrate.returncode != 0:
        print("[ERROR] falló migrate previo a seed")
        return BlockResult(name=name, status="ERROR", blocking=True, detail=f"migrate exit={migrate.returncode}")

    first = _run([PYTHON, "manage.py", "seed_demo_publico"])
    if first is None:
        print("[ERROR] Python no disponible para ejecutar seed")
        return BlockResult(name=name, status="ERROR", blocking=True, detail="python no disponible")

    print("$", f"{PYTHON} manage.py seed_demo_publico  # primera ejecución")
    _print_process_output(first)
    if first.returncode != 0:
        print("[ERROR] falló primera ejecución de seed")
        return BlockResult(name=name, status="ERROR", blocking=True, detail=f"primera ejecución exit={first.returncode}")

    second = _run([PYTHON, "manage.py", "seed_demo_publico"])
    print("$", f"{PYTHON} manage.py seed_demo_publico  # segunda ejecución")
    if second is None:
        print("[ERROR] Python no disponible en segunda ejecución")
        return BlockResult(name=name, status="ERROR", blocking=True, detail="python no disponible")

    _print_process_output(second)
    if second.returncode != 0:
        print("[ERROR] falló segunda ejecución de seed (idempotencia operativa)")
        return BlockResult(name=name, status="ERROR", blocking=True, detail=f"segunda ejecución exit={second.returncode}")

    count_code = (
        "from backend.nucleo_herbal.infraestructura.persistencia_django.models import "
        "IntencionModelo, PlantaModelo, ProductoModelo, RitualModelo;"
        "print('intenciones_publicas=' + str(IntencionModelo.objects.filter(es_publica=True).count()));"
        "print('plantas_publicadas=' + str(PlantaModelo.objects.filter(publicada=True).count()));"
        "print('productos_publicados=' + str(ProductoModelo.objects.filter(publicado=True).count()));"
        "print('rituales_publicados=' + str(RitualModelo.objects.filter(publicado=True).count()))"
    )
    counts = _run([PYTHON, "manage.py", "shell", "-c", count_code])
    print("$", f"{PYTHON} manage.py shell -c '<conteos demo públicos>'")
    if counts is None:
        print("[ERROR] no se pudieron consultar conteos")
        return BlockResult(name=name, status="ERROR", blocking=True, detail="conteos no disponibles")

    _print_process_output(counts)
    if counts.returncode != 0:
        print("[ERROR] no se pudieron obtener conteos después de seed")
        return BlockResult(name=name, status="ERROR", blocking=True, detail=f"conteos exit={counts.returncode}")

    print("[OK] seed idempotente y conteos obtenidos")
    return BlockResult(name=name, status="OK", blocking=True)


def _frontend_block() -> list[BlockResult]:
    base_name = "E) Frontend"
    frontend_dir = ROOT_DIR / "frontend"
    package_json = frontend_dir / "package.json"

    if not package_json.exists():
        _print_header(base_name)
        print("[SKIP] frontend/package.json no existe; validación frontend no aplica")
        return [
            BlockResult(
                name=f"{base_name}: lint/build",
                status="SKIP",
                blocking=False,
                detail="frontend/package.json no encontrado",
            )
        ]

    npm_path = shutil.which("npm")
    node_path = shutil.which("node")
    if not npm_path or not node_path:
        _print_header(base_name)
        print("[SKIP] Node/npm no disponibles en el entorno")
        return [
            BlockResult(
                name=f"{base_name}: lint/build",
                status="SKIP",
                blocking=False,
                detail="node o npm no disponibles",
            )
        ]

    lint = _run_block(f"{base_name} - lint", ["npm", "run", "lint"], blocking=True, cwd=frontend_dir)
    build = _run_block(f"{base_name} - build", ["npm", "run", "build"], blocking=True, cwd=frontend_dir)
    return [lint, build]


def _print_summary(results: list[BlockResult]) -> int:
    _print_header("Resumen final del gate")
    blocking_failed = False

    for result in results:
        marker = {"OK": "OK", "ERROR": "ERROR", "SKIP": "SKIP"}.get(result.status, result.status)
        scope = "BLOCK" if result.blocking else "INFO"
        detail = f" ({result.detail})" if result.detail else ""
        print(f"- [{marker}] [{scope}] {result.name}{detail}")
        if result.blocking and result.status != "OK":
            blocking_failed = True

    if blocking_failed:
        print("\nVEREDICTO: ERROR — gate técnico NO superado.")
        return 1

    print("\nVEREDICTO: OK — gate técnico superado.")
    return 0


def main() -> int:
    print("== Gate técnico canónico: demo/release ==")
    results: list[BlockResult] = []

    results.append(
        _run_block(
            "A) Readiness backend",
            [PYTHON, "scripts/check_backend_readiness.py"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "B) Django check estructural",
            [PYTHON, "manage.py", "check"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "C1) Test crítico healthcheck",
            [PYTHON, "manage.py", "test", "tests.nucleo_herbal.test_healthcheck"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "C2) Test crítico seed demo",
            [PYTHON, "manage.py", "test", "tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command"],
            blocking=True,
        )
    )
    results.append(_seed_demo_block())
    results.extend(_frontend_block())

    return _print_summary(results)


if __name__ == "__main__":
    raise SystemExit(main())
