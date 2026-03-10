#!/usr/bin/env python3
"""Gate único de regresión SEO contractual."""

from __future__ import annotations

import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable


@dataclass(frozen=True)
class ResultadoPaso:
    nombre: str
    retorno: int


def _ejecutar(nombre: str, comando: list[str], cwd: Path = ROOT_DIR) -> ResultadoPaso:
    print(f"\n== {nombre} ==")
    print("$", " ".join(comando))
    proceso = subprocess.run(comando, cwd=cwd, check=False)
    return ResultadoPaso(nombre=nombre, retorno=proceso.returncode)


def _asegurar_npm_disponible() -> None:
    if shutil.which("npm"):
        return
    print("[ERROR] npm no está disponible. No se puede ejecutar el bloque SEO frontend.")
    raise SystemExit(1)


def main() -> int:
    print("== Gate SEO contractual: backend + frontend ==")
    _asegurar_npm_disponible()

    resultados = [
        _ejecutar(
            "Backend SEO contractual",
            [
                PYTHON,
                "manage.py",
                "test",
                "tests.nucleo_herbal.test_healthcheck",
                "tests.nucleo_herbal.test_seo_contrato_backend",
            ],
        ),
        _ejecutar(
            "Frontend SEO contractual",
            ["npm", "run", "test:seo:contrato"],
            cwd=ROOT_DIR / "frontend",
        ),
    ]

    fallos = [r for r in resultados if r.retorno != 0]
    if not fallos:
        print("\nVEREDICTO SEO: OK")
        return 0

    print("\nVEREDICTO SEO: ERROR")
    for fallo in fallos:
        print(f"- {fallo.nombre}: exit={fallo.retorno}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
