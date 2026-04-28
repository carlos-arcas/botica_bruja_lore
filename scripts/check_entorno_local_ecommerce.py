#!/usr/bin/env python3
"""Contrato reproducible de entorno local para ecommerce simulado."""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]


@dataclass(frozen=True, slots=True)
class ResultadoCheck:
    severidad: str
    codigo: str
    detalle: str
    ruta: str
    accion_sugerida: str


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Valida el contrato local reproducible de ecommerce simulado.")
    parser.add_argument("--json", action="store_true", help="Emite salida JSON.")
    parser.add_argument("--fail-on", choices=("blocker", "warning", "none"), default="blocker")
    return parser.parse_args(argv)


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _exists(root: Path, rel_path: str, codigo: str, detalle: str) -> ResultadoCheck:
    path = root / rel_path
    if path.exists():
        return ResultadoCheck("OK", codigo, detalle, rel_path, "Sin accion.")
    return ResultadoCheck("BLOCKER", codigo, f"Falta {rel_path}.", rel_path, "Restaurar archivo requerido por el entorno local.")


def _contains(root: Path, rel_path: str, marcadores: tuple[str, ...], codigo: str, detalle: str) -> ResultadoCheck:
    path = root / rel_path
    if not path.exists():
        return ResultadoCheck("BLOCKER", codigo, f"Falta {rel_path}.", rel_path, "Crear o restaurar archivo de contrato local.")
    contenido = _read(path)
    faltantes = [m for m in marcadores if m not in contenido]
    if not faltantes:
        return ResultadoCheck("OK", codigo, detalle, rel_path, "Sin accion.")
    return ResultadoCheck("BLOCKER", codigo, f"Faltan marcadores: {', '.join(faltantes)}.", rel_path, "Completar variables/comandos documentados.")


def _check_archivos_base(root: Path) -> list[ResultadoCheck]:
    return [
        _exists(root, "manage.py", "backend_manage_py", "Backend Django detectable."),
        _exists(root, "requirements.txt", "backend_requirements", "Dependencias Python documentadas."),
        _exists(root, "setup_entorno.bat", "setup_entorno", "Setup local detectable."),
        _exists(root, "run_app.bat", "run_app", "Arranque local detectable."),
        _exists(root, "frontend/package.json", "frontend_package", "Frontend Next detectable."),
        _exists(root, "scripts/bootstrap_ecommerce_local_simulado.py", "bootstrap_local", "Bootstrap local comprable detectable."),
        _exists(root, "scripts/check_ecommerce_local_simulado.py", "gate_local", "Gate local ecommerce detectable."),
        _exists(root, "docs/operativa_ecommerce_local_simulado.md", "operativa_local", "Guia operativa local detectable."),
        _exists(root, "docs/checklist_entorno_local_ecommerce.md", "checklist_entorno", "Checklist reproducible detectable."),
    ]


def _check_env_backend(root: Path) -> list[ResultadoCheck]:
    marcadores = (
        "DEBUG=true",
        "LOG_LEVEL=INFO",
        "BOTICA_PAYMENT_PROVIDER=simulado_local",
        "PUBLIC_SITE_URL=http://127.0.0.1:3000",
        "DEFAULT_FROM_EMAIL=no-reply@botica-lore.local",
        "EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend",
        "ENVIO_ESTANDAR_IMPORTE=4.90",
        "STRIPE_SECRET_KEY=",
    )
    return [_contains(root, ".env.example", marcadores, "env_backend_local", "Variables backend locales documentadas sin secretos reales.")]


def _check_env_frontend(root: Path) -> list[ResultadoCheck]:
    marcadores = (
        "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000",
        "NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000",
        "NEXT_PUBLIC_ANALITICA_LOCAL=false",
        "NEXT_PUBLIC_STRIPE_PUBLIC_KEY=",
    )
    return [_contains(root, "frontend/.env.example", marcadores, "env_frontend_local", "Variables frontend locales documentadas.")]


def _check_scripts_frontend(root: Path) -> list[ResultadoCheck]:
    marcadores = (
        '"dev"',
        '"build"',
        '"lint"',
        '"test:checkout-real"',
        '"test:compra-local"',
        '"test:cesta"',
        '"test:cuenta-cliente"',
    )
    return [_contains(root, "frontend/package.json", marcadores, "scripts_frontend_criticos", "Scripts frontend criticos disponibles.")]


def _check_checklist(root: Path) -> list[ResultadoCheck]:
    marcadores = (
        "BOTICA_PAYMENT_PROVIDER=simulado_local",
        "setup_entorno.bat --check",
        "manage.py migrate",
        "scripts/bootstrap_ecommerce_local_simulado.py --dry-run",
        "npm --prefix frontend run dev",
        "scripts/check_ecommerce_local_simulado.py",
        "scripts/check_entorno_local_ecommerce.py",
        "V2-R10",
    )
    return [_contains(root, "docs/checklist_entorno_local_ecommerce.md", marcadores, "checklist_comandos_reales", "Checklist documenta comandos y limites locales.")]


def _check_proveedor_entorno() -> list[ResultadoCheck]:
    proveedor = os.getenv("BOTICA_PAYMENT_PROVIDER", "simulado_local").strip().lower() or "simulado_local"
    if proveedor == "simulado_local":
        return [ResultadoCheck("OK", "proveedor_entorno", "Proveedor local actual simulado_local o no configurado.", "env:BOTICA_PAYMENT_PROVIDER", "Sin accion.")]
    if proveedor == "stripe":
        return [ResultadoCheck("WARNING", "proveedor_entorno", "El entorno actual usa stripe; no es el modo local recomendado.", "env:BOTICA_PAYMENT_PROVIDER", "Volver a simulado_local para desarrollo local.")]
    return [ResultadoCheck("BLOCKER", "proveedor_entorno", f"Proveedor no soportado: {proveedor}.", "env:BOTICA_PAYMENT_PROVIDER", "Usar simulado_local o stripe futuro explicito.")]


def evaluar(root: Path = ROOT_DIR) -> tuple[ResultadoCheck, ...]:
    resultados: list[ResultadoCheck] = []
    resultados.extend(_check_archivos_base(root))
    resultados.extend(_check_env_backend(root))
    resultados.extend(_check_env_frontend(root))
    resultados.extend(_check_scripts_frontend(root))
    resultados.extend(_check_checklist(root))
    resultados.extend(_check_proveedor_entorno())
    return tuple(resultados)


def _conteo(resultados: tuple[ResultadoCheck, ...]) -> dict[str, int]:
    return {sev: sum(1 for r in resultados if r.severidad == sev) for sev in ("BLOCKER", "WARNING", "OK")}


def _exit_code(resultados: tuple[ResultadoCheck, ...], fail_on: str) -> int:
    if fail_on == "none":
        return 0
    if any(r.severidad == "BLOCKER" for r in resultados):
        return 1
    if fail_on == "warning" and any(r.severidad == "WARNING" for r in resultados):
        return 1
    return 0


def _print_text(resultados: tuple[ResultadoCheck, ...]) -> None:
    print("== Contrato entorno local ecommerce simulado ==")
    print("Objetivo: validar archivos, variables y comandos locales sin servicios externos.")
    print("Nota: no activa Stripe, no crea base de datos y no declara go-live.")
    for severidad in ("BLOCKER", "WARNING", "OK"):
        grupo = [r for r in resultados if r.severidad == severidad]
        if not grupo:
            continue
        print(f"\n[{severidad}] {len(grupo)} check(s)")
        for resultado in grupo:
            print(f"- {resultado.codigo} :: {resultado.detalle}")
            print(f"  ruta: {resultado.ruta}")
            print(f"  accion: {resultado.accion_sugerida}")


def _print_json(resultados: tuple[ResultadoCheck, ...]) -> None:
    payload = {
        "check": "entorno_local_ecommerce_simulado",
        "objetivo": "reproducibilidad local sin servicios externos",
        "conteo": _conteo(resultados),
        "resultados": [asdict(r) for r in resultados],
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    resultados = evaluar(ROOT_DIR)
    if args.json:
        _print_json(resultados)
    else:
        _print_text(resultados)
    return _exit_code(resultados, args.fail_on)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
