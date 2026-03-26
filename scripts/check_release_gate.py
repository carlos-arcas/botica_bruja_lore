#!/usr/bin/env python3
"""Gate técnico canónico para demo/release del repositorio (solo validación)."""

from __future__ import annotations

import logging
import os
import platform
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable


def _log_level() -> str:
    valor = os.environ.get("LOG_LEVEL", "INFO").strip().upper()
    return valor if valor in logging.getLevelNamesMapping() else "INFO"


logging.basicConfig(
    level=_log_level(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
LOGGER = logging.getLogger(__name__)


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
) -> subprocess.CompletedProcess[str] | None:
    try:
        return subprocess.run(
            cmd,
            cwd=cwd or ROOT_DIR,
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


def _extract_skip_detail(result: subprocess.CompletedProcess[str]) -> str | None:
    for stream in (result.stdout, result.stderr):
        for raw_line in stream.splitlines():
            line = raw_line.strip()
            if line.startswith("SKIP:"):
                return line.removeprefix("SKIP:").strip()
    return None


def _run_block(name: str, cmd: list[str], *, blocking: bool = True, cwd: Path | None = None) -> BlockResult:
    _print_header(name)
    print("$", " ".join(cmd))
    result = _run(cmd, cwd=cwd)

    if result is None:
        print("[SKIP] comando no disponible en el entorno")
        return BlockResult(name=name, status="SKIP", blocking=False, detail="comando no disponible")

    _print_process_output(result)
    if result.returncode == 0:
        skip_detail = _extract_skip_detail(result)
        if skip_detail is not None:
            print(f"[SKIP] {skip_detail}")
            return BlockResult(name=name, status="SKIP", blocking=False, detail=skip_detail)
        print("[OK] bloque completado")
        return BlockResult(name=name, status="OK", blocking=blocking)

    LOGGER.error("release_gate_block_failed name=%s exit=%s", name, result.returncode)
    print("[ERROR] bloque fallido")
    return BlockResult(name=name, status="ERROR", blocking=blocking, detail=f"exit={result.returncode}")


def _resolve_npm_executable() -> str | None:
    candidates = ("npm.cmd", "npm") if platform.system() == "Windows" else ("npm", "npm.cmd")
    for candidate in candidates:
        if shutil.which(candidate):
            return candidate
    return None


def _data_snapshot_block() -> BlockResult:
    name = "D) Snapshot de datos públicos existentes (solo lectura)"
    _print_header(name)

    count_code = "\n".join(
        [
            "from django.core.exceptions import ImproperlyConfigured",
            "from django.db.utils import OperationalError, ProgrammingError",
            "try:",
            "    from backend.nucleo_herbal.infraestructura.persistencia_django.models import IntencionModelo, PlantaModelo, ProductoModelo, RitualModelo",
            "    print('intenciones_publicas=' + str(IntencionModelo.objects.filter(es_publica=True).count()))",
            "    print('plantas_publicadas=' + str(PlantaModelo.objects.filter(publicada=True).count()))",
            "    print('productos_publicados=' + str(ProductoModelo.objects.filter(publicado=True).count()))",
            "    print('rituales_publicados=' + str(RitualModelo.objects.filter(publicado=True).count()))",
            "except (OperationalError, ProgrammingError, ImproperlyConfigured) as error:",
            "    print('SNAPSHOT_SKIP: ' + str(error).splitlines()[0])",
        ]
    )
    print("$", f"{PYTHON} manage.py shell -c '<conteos públicos solo lectura>'")
    counts = _run([PYTHON, "manage.py", "shell", "-c", count_code])

    if counts is None:
        print("[SKIP] no se pudieron consultar conteos (python no disponible)")
        return BlockResult(name=name, status="SKIP", blocking=False, detail="conteos no disponibles")

    if counts.returncode == 0:
        skip_match = re.search(r"SNAPSHOT_SKIP:\s*(.+)", counts.stdout)
        if skip_match:
            reason = skip_match.group(1).strip()
            print(f"[SKIP] snapshot no aplicable en este entorno: {reason}")
            return BlockResult(name=name, status="SKIP", blocking=False, detail=reason)

        _print_process_output(counts)
        print("[OK] snapshot de conteos obtenido")
        return BlockResult(name=name, status="OK", blocking=False)

    short_error = counts.stderr.strip().splitlines()[-1] if counts.stderr.strip() else f"exit={counts.returncode}"
    print(f"[SKIP] no se pudieron consultar conteos en este entorno: {short_error}")
    return BlockResult(name=name, status="SKIP", blocking=False, detail=short_error)


def _frontend_block() -> list[BlockResult]:
    base_name = "G) Frontend"
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

    npm_cmd = _resolve_npm_executable()
    node_path = shutil.which("node")
    if not npm_cmd or not node_path:
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

    lint = _run_block(f"{base_name} - lint", [npm_cmd, "run", "lint"], blocking=True, cwd=frontend_dir)
    checkout_demo = _run_block(
        f"{base_name} - test checkout demo",
        [npm_cmd, "run", "test:checkout-demo"],
        blocking=True,
        cwd=frontend_dir,
    )
    cuenta_demo = _run_block(
        f"{base_name} - test cuenta demo",
        [npm_cmd, "run", "test:cuenta-demo"],
        blocking=True,
        cwd=frontend_dir,
    )
    calendario_ritual = _run_block(
        f"{base_name} - test calendario ritual",
        [npm_cmd, "run", "test:calendario-ritual"],
        blocking=True,
        cwd=frontend_dir,
    )
    build = _run_block(f"{base_name} - build", [npm_cmd, "run", "build"], blocking=True, cwd=frontend_dir)
    return [lint, checkout_demo, cuenta_demo, calendario_ritual, build]


def _operational_reconciliation_block() -> BlockResult:
    return _run_block(
        "H) Conciliación operativa (BLOCKER/WARNING/INFO, solo lectura)",
        [PYTHON, "scripts/check_operational_reconciliation.py", "--fail-on", "blocker"],
        blocking=True,
    )


def _release_readiness_block() -> BlockResult:
    return _run_block(
        "I) Release readiness mínimo (seguridad/privacidad/backups)",
        [PYTHON, "scripts/check_release_readiness.py"],
        blocking=True,
    )


def _operational_alerts_block() -> BlockResult:
    return _run_block(
        "J) Alertas operativas V2 (solo lectura)",
        [PYTHON, "scripts/check_operational_alerts_v2.py", "--fail-on", "blocker"],
        blocking=True,
    )


def _retry_operational_tasks_dry_run_block() -> BlockResult:
    return _run_block(
        "K) Reintentos operativos V2 (dry-run, solo lectura)",
        [PYTHON, "scripts/retry_operational_tasks_v2.py", "--dry-run", "--json"],
        blocking=True,
    )


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
    LOGGER.info("release_gate_start")
    print("== Gate técnico canónico: demo/release (solo lectura por defecto) ==")
    print("Nota: este gate NO ejecuta migrate ni seed_demo_publico.")
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
    results.append(
        _run_block(
            "C3) Test crítico guardrails deploy",
            [PYTHON, "manage.py", "test", "tests.nucleo_herbal.test_deploy_guards"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "C4) Test scripts operativos críticos",
            [PYTHON, "manage.py", "test", "tests.scripts"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "C5) Test crítico contratos API pública frontend",
            [PYTHON, "manage.py", "test", "tests.nucleo_herbal.test_contratos_api_publica_frontend"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "C6) Test crítico contratos API demo frontend",
            [PYTHON, "manage.py", "test", "tests.nucleo_herbal.test_contratos_api_publica_demo_frontend"],
            blocking=True,
        )
    )
    results.append(_data_snapshot_block())
    results.append(
        _run_block(
            "E) Contrato SEO de regresión",
            [PYTHON, "scripts/check_seo_contract.py"],
            blocking=True,
        )
    )
    results.append(
        _run_block(
            "F) Integridad operativa del repo",
            [PYTHON, "scripts/check_repo_operational_integrity.py"],
            blocking=True,
        )
    )
    results.extend(_frontend_block())
    results.append(_operational_reconciliation_block())
    results.append(_release_readiness_block())
    results.append(_operational_alerts_block())
    results.append(_retry_operational_tasks_dry_run_block())

    code = _print_summary(results)
    if code == 0:
        LOGGER.info("release_gate_ok")
    else:
        LOGGER.error("release_gate_error")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
