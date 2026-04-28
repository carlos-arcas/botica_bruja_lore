#!/usr/bin/env python3
"""Auditoria final automatizable del ecommerce local simulado."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

import check_ecommerce_local_simulado as gate_local

ROOT_DIR = Path(__file__).resolve().parents[1]
SEVERIDADES = ("BLOCKER", "WARNING", "OK")


@dataclass(frozen=True, slots=True)
class ResultadoAuditoria:
    severidad: str
    codigo: str
    categoria: str
    detalle: str
    ruta: str
    accion_sugerida: str


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Auditoria final ecommerce local simulado.")
    parser.add_argument("--json", action="store_true", help="Emite salida JSON.")
    parser.add_argument("--fail-on", choices=("blocker", "warning", "none"), default="blocker")
    return parser.parse_args(argv)


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _exists(root: Path, rel_path: str) -> bool:
    return (root / rel_path).exists()


def _rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT_DIR).as_posix()
    except ValueError:
        return path.as_posix()


def _resultado(
    severidad: str,
    codigo: str,
    categoria: str,
    detalle: str,
    ruta: str,
    accion: str = "Sin accion.",
) -> ResultadoAuditoria:
    return ResultadoAuditoria(severidad, codigo, categoria, detalle, ruta, accion)


def _check_docs_clave(root: Path) -> list[ResultadoAuditoria]:
    requeridos = (
        "docs/roadmap_ecommerce_local_simulado.md",
        "docs/90_estado_implementacion.md",
        "docs/checklist_presentacion_ecommerce_local.md",
        "docs/operativa_ecommerce_local_simulado.md",
        "docs/plan_retirada_legacy_demo.md",
    )
    faltantes = [rel for rel in requeridos if not _exists(root, rel)]
    if faltantes:
        return [_resultado("BLOCKER", "documentacion_clave", "documentacion", "Faltan documentos: " + ", ".join(faltantes), "docs", "Restaurar documentacion viva de auditoria.")]
    return [_resultado("OK", "documentacion_clave", "documentacion", "Documentacion clave presente.", "docs")]


def _check_catalogo_vendible(root: Path) -> list[ResultadoAuditoria]:
    requeridos = (
        "scripts/bootstrap_ecommerce_local_simulado.py",
        "tests/nucleo_herbal/test_catalogo_vendible_local.py",
    )
    faltantes = [rel for rel in requeridos if not _exists(root, rel)]
    if faltantes:
        return [_resultado("BLOCKER", "catalogo_vendible", "catalogo", "Faltan contratos de catalogo vendible: " + ", ".join(faltantes), "catalogo", "Restaurar bootstrap/test de catalogo vendible.")]
    roadmap = root / "docs/roadmap_ecommerce_local_simulado.md"
    if not roadmap.exists():
        return [_resultado("WARNING", "catalogo_vendible", "catalogo", "No se puede verificar referencia de catalogo vendible sin roadmap local.", _rel(roadmap), "Restaurar roadmap local.")]
    if "Catalogo vendible" not in _read(roadmap):
        return [_resultado("WARNING", "catalogo_vendible", "catalogo", "Catalogo vendible no queda referenciado en roadmap local.", _rel(roadmap), "Documentar contrato de catalogo vendible.")]
    return [_resultado("OK", "catalogo_vendible", "catalogo", "Bootstrap y contrato de catalogo vendible presentes.", "catalogo")]


def _check_presentacion(root: Path) -> list[ResultadoAuditoria]:
    checklist = root / "docs/checklist_presentacion_ecommerce_local.md"
    if not checklist.exists():
        return [_resultado("BLOCKER", "checklist_presentacion", "presentacion", "No existe checklist de presentacion.", _rel(checklist), "Restaurar checklist final.")]
    contenido = _read(checklist)
    marcadores = ("Lo que NO se debe prometer", "Pago simulado", "V2-R10")
    if all(m in contenido for m in marcadores):
        return [_resultado("OK", "checklist_presentacion", "presentacion", "Checklist diferencia portfolio/local de produccion real.", _rel(checklist))]
    return [_resultado("WARNING", "checklist_presentacion", "presentacion", "Checklist incompleta para explicar limites de presentacion.", _rel(checklist), "Revisar limites y guion de demo.")]


def _check_tests_regresion(root: Path) -> list[ResultadoAuditoria]:
    requeridos = (
        "tests/nucleo_herbal/test_regresion_compra_local_simulada.py",
        "frontend/tests/compra-local-simulada.test.ts",
        "tests/scripts/test_check_ecommerce_local_simulado.py",
    )
    faltantes = [rel for rel in requeridos if not _exists(root, rel)]
    if faltantes:
        return [_resultado("WARNING", "regresion_compra_local", "qa", "Faltan tests de regresion local: " + ", ".join(faltantes), "tests", "Completar regresion antes de presentacion robusta.")]
    return [_resultado("OK", "regresion_compra_local", "qa", "Regresion local por capas presente.", "tests")]


def _check_legacy_congelado(root: Path) -> list[ResultadoAuditoria]:
    plan = root / "docs/plan_retirada_legacy_demo.md"
    roadmap = root / "docs/roadmap_ecommerce_local_simulado.md"
    if not plan.exists() or not roadmap.exists():
        return [_resultado("BLOCKER", "legacy_congelado", "legacy", "No se puede verificar plan/roadmap legacy.", "docs", "Restaurar plan de retirada y roadmap local.")]
    texto = _read(plan) + "\n" + _read(roadmap)
    marcadores = ("Legacy controlado", "Fase A", "Fase B", "PedidoDemo", "CuentaDemo")
    if all(m in texto for m in marcadores):
        return [_resultado("OK", "legacy_congelado", "legacy", "Legacy demo congelado y con plan de retirada.", "docs/plan_retirada_legacy_demo.md")]
    return [_resultado("BLOCKER", "legacy_congelado", "legacy", "Legacy no queda congelado o sin fases de retirada.", "docs", "Completar plan de retirada legacy.")]


def _check_gate_local(root: Path) -> list[ResultadoAuditoria]:
    resultados = gate_local.evaluar(root)
    blockers = [r for r in resultados if r.severidad == "BLOCKER"]
    warnings = [r for r in resultados if r.severidad == "WARNING"]
    if blockers:
        detalle = "Gate local con blockers: " + ", ".join(r.codigo for r in blockers[:6])
        return [_resultado("BLOCKER", "gate_local", "calidad", detalle, "scripts/check_ecommerce_local_simulado.py", "Corregir blockers del gate local.")]
    if warnings:
        detalle = "Gate local sin blockers; warnings: " + ", ".join(r.codigo for r in warnings[:6])
        return [_resultado("WARNING", "gate_local", "calidad", detalle, "scripts/check_ecommerce_local_simulado.py", "Aceptar warnings solo si son legacy controlado.")]
    return [_resultado("OK", "gate_local", "calidad", "Gate local sin blockers ni warnings.", "scripts/check_ecommerce_local_simulado.py")]


def evaluar(root: Path = ROOT_DIR) -> tuple[ResultadoAuditoria, ...]:
    resultados: list[ResultadoAuditoria] = []
    resultados.extend(_check_docs_clave(root))
    resultados.extend(_check_gate_local(root))
    resultados.extend(_check_catalogo_vendible(root))
    resultados.extend(_check_presentacion(root))
    resultados.extend(_check_tests_regresion(root))
    resultados.extend(_check_legacy_congelado(root))
    return tuple(resultados)


def _exit_code(resultados: tuple[ResultadoAuditoria, ...], fail_on: str) -> int:
    if fail_on == "none":
        return 0
    if fail_on == "warning":
        return 1 if any(r.severidad in {"BLOCKER", "WARNING"} for r in resultados) else 0
    return 1 if any(r.severidad == "BLOCKER" for r in resultados) else 0


def _payload(resultados: tuple[ResultadoAuditoria, ...]) -> dict[str, object]:
    return {
        "auditoria": "ecommerce_local_simulado",
        "objetivo": "presentacion local, no go-live externo",
        "conteo": {sev: sum(1 for r in resultados if r.severidad == sev) for sev in SEVERIDADES},
        "resultados": [asdict(r) for r in resultados],
    }


def _print_text(resultados: tuple[ResultadoAuditoria, ...]) -> None:
    print("== Auditoria final ecommerce local simulado ==")
    print("Objetivo: consolidar estado local antes de presentacion u optimizacion.")
    print("Nota: no declara produccion lista, no activa Stripe y no desbloquea V2-R10.")
    for severidad in SEVERIDADES:
        subset = [r for r in resultados if r.severidad == severidad]
        if not subset:
            continue
        print(f"\n[{severidad}] {len(subset)} resultado(s)")
        for item in subset:
            print(f"- {item.codigo} ({item.categoria}) :: {item.detalle}")
            print(f"  ruta: {item.ruta}")
            print(f"  accion: {item.accion_sugerida}")


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    resultados = evaluar(ROOT_DIR)
    if args.json:
        print(json.dumps(_payload(resultados), ensure_ascii=False, indent=2))
    else:
        _print_text(resultados)
    return _exit_code(resultados, args.fail_on)


if __name__ == "__main__":
    raise SystemExit(main())
