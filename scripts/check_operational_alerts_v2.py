#!/usr/bin/env python3
"""Agregador mínimo de alertas operativas V2 para ecommerce real."""

from __future__ import annotations

import argparse
import json
import logging
import os
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")

import django
from django.core.exceptions import ImproperlyConfigured
from django.db.utils import OperationalError, ProgrammingError

django.setup()

from backend.nucleo_herbal.infraestructura.persistencia_django.models import DevolucionPedidoModelo, PedidoRealModelo


SEVERIDADES = ("BLOCKER", "WARNING", "INFO")


@dataclass(frozen=True, slots=True)
class AlertaOperativa:
    severidad: str
    codigo: str
    entidad_tipo: str
    entidad_id: str
    mensaje: str
    accion_sugerida: str
    fuente: str


LOGGER = logging.getLogger(__name__)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Agregador mínimo de alertas operativas V2")
    parser.add_argument("--max-pedidos", type=int, default=300)
    parser.add_argument("--max-devoluciones", type=int, default=200)
    parser.add_argument("--fail-on", choices=("blocker", "warning", "none"), default="blocker")
    parser.add_argument("--json", action="store_true")
    return parser.parse_args()


def _make_alert(sev: str, code: str, tipo: str, entidad_id: str, mensaje: str, accion: str, fuente: str) -> AlertaOperativa:
    return AlertaOperativa(
        severidad=sev,
        codigo=code,
        entidad_tipo=tipo,
        entidad_id=entidad_id,
        mensaje=mensaje,
        accion_sugerida=accion,
        fuente=fuente,
    )


def _query_stock_reviews(max_pedidos: int) -> tuple[AlertaOperativa, ...]:
    queryset = PedidoRealModelo.objects.filter(
        estado="pagado",
        estado_pago="pagado",
        incidencia_stock_confirmacion=True,
        incidencia_stock_revisada=False,
    ).order_by("fecha_pago_confirmado", "-fecha_creacion")[: max(1, max_pedidos)]
    return tuple(
        _make_alert(
            "WARNING",
            "pedido_stock_incidencia_pendiente_revision",
            "pedido",
            pedido.id_pedido,
            "Pedido pagado con incidencia de stock pendiente de revisión operativa.",
            "Revisar incidencia en backoffice y decidir cancelación/reembolso o regularización de stock.",
            "pedido_estado",
        )
        for pedido in queryset
    )


def _query_reembolsos_fallidos(max_pedidos: int) -> tuple[AlertaOperativa, ...]:
    queryset = PedidoRealModelo.objects.filter(estado_reembolso="fallido").order_by("-fecha_reembolso", "-fecha_creacion")[: max(1, max_pedidos)]
    return tuple(
        _make_alert(
            "WARNING",
            "reembolso_fallido_pendiente_accion",
            "pedido",
            pedido.id_pedido,
            "Reembolso fallido pendiente de acción operativa.",
            "Reintentar reembolso manual o registrar bloqueo administrativo documentado.",
            "pedido_estado",
        )
        for pedido in queryset
    )


def _query_devoluciones_pendientes(max_devoluciones: int) -> tuple[AlertaOperativa, ...]:
    queryset = DevolucionPedidoModelo.objects.filter(estado=DevolucionPedidoModelo.ESTADO_ACEPTADA).order_by("-fecha_apertura")[: max(1, max_devoluciones)]
    alertas: list[AlertaOperativa] = []
    for devolucion in queryset:
        if devolucion.esta_resuelta_operativamente:
            continue
        alertas.append(
            _make_alert(
                "WARNING",
                "devolucion_aceptada_pendiente_resolucion_operativa",
                "devolucion",
                str(devolucion.pk),
                "Devolución aceptada sin resolución operativa completa (reembolso/restitución).",
                "Completar reembolso y restitución o documentar motivo de bloqueo operativo.",
                "devoluciones_postventa",
            )
        )
    return tuple(alertas)


def _run_json_script(script_name: str, args: list[str]) -> tuple[int, dict | None, str]:
    cmd = [PYTHON, str(ROOT_DIR / "scripts" / script_name), *args]
    proc = subprocess.run(cmd, cwd=ROOT_DIR, text=True, capture_output=True, check=False)
    payload: dict | None = None
    if proc.stdout.strip():
        try:
            payload = json.loads(proc.stdout)
        except json.JSONDecodeError:
            payload = None
    detail = proc.stdout.strip() or proc.stderr.strip() or f"exit={proc.returncode}"
    return proc.returncode, payload, detail


def _reconciliation_alerts(max_pedidos: int) -> tuple[AlertaOperativa, ...]:
    code, payload, detail = _run_json_script(
        "check_operational_reconciliation.py",
        ["--max-pedidos", str(max_pedidos), "--fail-on", "none", "--json"],
    )
    if code != 0 or not payload:
        return (
            _make_alert(
                "BLOCKER",
                "conciliacion_no_disponible",
                "proceso",
                "check_operational_reconciliation",
                "No se pudo ejecutar/parsear la conciliación operativa.",
                "Verificar entorno Django y script de conciliación; reintentar ejecución.",
                "conciliacion_operativa",
            ),
        )

    alertas = []
    for hallazgo in payload.get("hallazgos", []):
        if hallazgo.get("severidad") != "BLOCKER":
            continue
        alertas.append(
            _make_alert(
                "BLOCKER",
                f"conciliacion_{hallazgo.get('codigo', 'sin_codigo')}",
                "pedido",
                str(hallazgo.get("id_pedido", "n/a")),
                str(hallazgo.get("detalle", "Hallazgo crítico de conciliación operativa.")),
                str(hallazgo.get("accion_sugerida", "Revisar hallazgo de conciliación.")),
                "conciliacion_operativa",
            )
        )
    return tuple(alertas)


def _readiness_alerts() -> tuple[AlertaOperativa, ...]:
    code, payload, detail = _run_json_script("check_release_readiness.py", [])
    if code == 0:
        return ()
    inferred = "Readiness/restore mínimo fallido; revisar checklist operativo y backup/restore."
    if payload is not None:
        inferred = "Readiness fallido (salida JSON inesperada); revisar script de readiness."
    return (
        _make_alert(
            "BLOCKER",
            "release_readiness_fallido",
            "proceso",
            "check_release_readiness",
            inferred,
            "Corregir fallo reportado por check_release_readiness.py antes de liberar operación.",
            "release_readiness",
        ),
        _make_alert(
            "INFO",
            "release_readiness_detalle",
            "proceso",
            "check_release_readiness",
            detail.splitlines()[-1][:220],
            "Consultar salida completa del script para diagnóstico detallado.",
            "release_readiness",
        ),
    )


def _collect_alerts(max_pedidos: int, max_devoluciones: int) -> tuple[AlertaOperativa, ...]:
    alertas = [
        *_query_stock_reviews(max_pedidos),
        *_query_reembolsos_fallidos(max_pedidos),
        *_query_devoluciones_pendientes(max_devoluciones),
        *_reconciliation_alerts(max_pedidos),
        *_readiness_alerts(),
    ]
    LOGGER.info("operational_alerts_collected total=%s", len(alertas))
    return tuple(alertas)


def _exit_code(alertas: tuple[AlertaOperativa, ...], fail_on: str) -> int:
    if fail_on == "none":
        return 0
    if fail_on == "warning":
        return 1 if alertas else 0
    return 1 if any(a.severidad == "BLOCKER" for a in alertas) else 0


def _print_text(alertas: tuple[AlertaOperativa, ...]) -> None:
    print("== Alertas operativas V2 ==")
    print(f"Total alertas: {len(alertas)}")
    if not alertas:
        print("Resultado: sin alertas operativas activas.")
        return

    for sev in SEVERIDADES:
        subset = [a for a in alertas if a.severidad == sev]
        if not subset:
            continue
        print(f"\n[{sev}] {len(subset)} alerta(s)")
        for alerta in subset:
            print(f"- {alerta.codigo} :: {alerta.entidad_tipo}:{alerta.entidad_id}")
            print(f"  mensaje: {alerta.mensaje}")
            print(f"  accion: {alerta.accion_sugerida}")
            print(f"  fuente: {alerta.fuente}")


def main() -> int:
    args = _parse_args()
    try:
        alertas = _collect_alerts(args.max_pedidos, args.max_devoluciones)
    except (OperationalError, ProgrammingError, ImproperlyConfigured) as error:
        print(f"SKIP: alertas no aplicables en este entorno ({str(error).splitlines()[0]})")
        return 0

    if args.json:
        print(
            json.dumps(
                {
                    "alertas": [asdict(a) for a in alertas],
                    "resumen": {s: sum(1 for a in alertas if a.severidad == s) for s in SEVERIDADES},
                    "politica_salida": args.fail_on,
                    "codigos": sorted({a.codigo for a in alertas}),
                },
                ensure_ascii=False,
                indent=2,
                sort_keys=True,
            )
        )
    else:
        _print_text(alertas)
    return _exit_code(alertas, args.fail_on)


if __name__ == "__main__":
    raise SystemExit(main())
