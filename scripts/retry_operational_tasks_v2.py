#!/usr/bin/env python3
"""Automatización mínima de reintentos operativos V2 para tareas seguras."""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")

import django
from django.core.exceptions import ImproperlyConfigured
from django.db.utils import OperationalError, ProgrammingError

django.setup()

from backend.nucleo_herbal.infraestructura.notificaciones_email import NotificadorEmailPostPago
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios_pedidos import RepositorioPedidosORM

LOGGER = logging.getLogger(__name__)
TASKS = ("email_post_pago", "email_envio", "email_cancelacion", "email_reembolso")


@dataclass(frozen=True, slots=True)
class RetryCandidate:
    task: str
    pedido_id: str
    motivo: str


@dataclass(frozen=True, slots=True)
class RetryResult:
    task: str
    pedido_id: str
    resultado: str
    detalle: str


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Reintenta tareas operativas V2 seguras por flags de pedido.")
    parser.add_argument("--task", choices=(*TASKS, "all"), default="all")
    parser.add_argument("--max-pedidos", type=int, default=120)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", action="store_true")
    return parser.parse_args()


def _collect_candidates(task: str, max_pedidos: int) -> tuple[RetryCandidate, ...]:
    queryset = PedidoRealModelo.objects.order_by("-fecha_creacion")
    limit = max(1, max_pedidos)
    candidates = []
    selected = TASKS if task == "all" else (task,)
    for selected_task in selected:
        candidates.extend(_collect_for_task(selected_task, queryset, limit))
    return tuple(candidates)


def _collect_for_task(task: str, queryset, limit: int) -> list[RetryCandidate]:
    if task == "email_post_pago":
        subset = queryset.filter(estado_pago="pagado", incidencia_stock_confirmacion=False, email_post_pago_enviado=False)[:limit]
        return [RetryCandidate(task, p.id_pedido, "pagado_sin_email_post_pago") for p in subset]
    if task == "email_envio":
        subset = queryset.filter(estado__in=("enviado", "entregado"), email_envio_enviado=False)[:limit]
        return [RetryCandidate(task, p.id_pedido, "pedido_enviado_sin_email_envio") for p in subset]
    if task == "email_cancelacion":
        subset = queryset.filter(cancelado_operativa_incidencia_stock=True, email_cancelacion_enviado=False)[:limit]
        return [RetryCandidate(task, p.id_pedido, "cancelacion_operativa_sin_email") for p in subset]
    subset = queryset.filter(estado_reembolso="ejecutado", email_reembolso_enviado=False)[:limit]
    return [RetryCandidate(task, p.id_pedido, "reembolso_ejecutado_sin_email") for p in subset]


def _execute(candidates: tuple[RetryCandidate, ...], dry_run: bool) -> tuple[RetryResult, ...]:
    if dry_run:
        return tuple(RetryResult(c.task, c.pedido_id, "candidate", c.motivo) for c in candidates)
    repositorio = RepositorioPedidosORM()
    notificador = NotificadorEmailPostPago()
    return tuple(_process_candidate(c, repositorio, notificador) for c in candidates)


def _process_candidate(candidate: RetryCandidate, repositorio: RepositorioPedidosORM, notificador: NotificadorEmailPostPago) -> RetryResult:
    pedido = repositorio.obtener_por_id(candidate.pedido_id)
    if pedido is None:
        return RetryResult(candidate.task, candidate.pedido_id, "skip", "pedido_no_encontrado")
    if not _is_still_eligible(candidate.task, pedido):
        return RetryResult(candidate.task, candidate.pedido_id, "skip", "no_elegible_en_ejecucion")
    operation_id = f"retry-v2-r08-{candidate.task}-{uuid4().hex}"
    try:
        updated = _send_and_mark(candidate.task, pedido, repositorio, notificador, operation_id)
    except Exception as error:  # noqa: BLE001
        LOGGER.error("retry_operational_task_error", extra={"task": candidate.task, "pedido_id": candidate.pedido_id, "error": str(error)})
        return RetryResult(candidate.task, candidate.pedido_id, "error", str(error))
    LOGGER.info("retry_operational_task_ok", extra={"task": candidate.task, "pedido_id": candidate.pedido_id, "operation_id": operation_id})
    return RetryResult(candidate.task, candidate.pedido_id, "ok", _sent_flag(candidate.task, updated))


def _is_still_eligible(task: str, pedido) -> bool:
    if task == "email_post_pago":
        return pedido.estado_pago == "pagado" and not pedido.incidencia_stock_confirmacion and not pedido.email_post_pago_enviado
    if task == "email_envio":
        return pedido.estado in {"enviado", "entregado"} and not pedido.email_envio_enviado
    if task == "email_cancelacion":
        return pedido.cancelado_operativa_incidencia_stock and not pedido.email_cancelacion_enviado
    return pedido.estado_reembolso == "ejecutado" and not pedido.email_reembolso_enviado


def _send_and_mark(task: str, pedido, repositorio: RepositorioPedidosORM, notificador: NotificadorEmailPostPago, operation_id: str):
    now = datetime.now(tz=UTC)
    if task == "email_post_pago":
        notificador.enviar_confirmacion_pago(pedido, operation_id)
        return repositorio.guardar(pedido.marcar_email_post_pago_enviado(now))
    if task == "email_envio":
        notificador.enviar_confirmacion_envio(pedido, operation_id)
        return repositorio.guardar(pedido.marcar_email_envio_enviado(now))
    if task == "email_cancelacion":
        notificador.enviar_cancelacion_operativa_stock(pedido, operation_id)
        return repositorio.guardar(pedido.marcar_email_cancelacion_enviado(now))
    notificador.enviar_reembolso_manual_ejecutado(pedido, operation_id)
    return repositorio.guardar(pedido.marcar_email_reembolso_enviado(now))


def _sent_flag(task: str, pedido) -> str:
    if task == "email_post_pago":
        return f"email_post_pago_enviado={pedido.email_post_pago_enviado}"
    if task == "email_envio":
        return f"email_envio_enviado={pedido.email_envio_enviado}"
    if task == "email_cancelacion":
        return f"email_cancelacion_enviado={pedido.email_cancelacion_enviado}"
    return f"email_reembolso_enviado={pedido.email_reembolso_enviado}"


def _print_text(candidates: tuple[RetryCandidate, ...], results: tuple[RetryResult, ...], dry_run: bool) -> None:
    mode = "DRY_RUN" if dry_run else "EXECUTE"
    print(f"== Retry operational tasks V2 ({mode}) ==")
    print(f"Candidatos: {len(candidates)}")
    if not results:
        print("Resultado: sin tareas elegibles.")
        return
    for item in results:
        print(f"- {item.task} :: {item.pedido_id} :: {item.resultado} :: {item.detalle}")


def main() -> int:
    args = _parse_args()
    try:
        candidates = _collect_candidates(args.task, args.max_pedidos)
        results = _execute(candidates, args.dry_run)
    except (OperationalError, ProgrammingError, ImproperlyConfigured) as error:
        print(f"SKIP: retry tasks no aplicables en este entorno ({str(error).splitlines()[0]})")
        return 0
    if args.json:
        print(
            json.dumps(
                {
                    "dry_run": args.dry_run,
                    "task": args.task,
                    "candidatos": [asdict(c) for c in candidates],
                    "resultados": [asdict(r) for r in results],
                    "resumen": {
                        "ok": sum(1 for r in results if r.resultado == "ok"),
                        "skip": sum(1 for r in results if r.resultado == "skip"),
                        "error": sum(1 for r in results if r.resultado == "error"),
                        "candidate": sum(1 for r in results if r.resultado == "candidate"),
                    },
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        _print_text(candidates, results, args.dry_run)
    return 1 if any(r.resultado == "error" for r in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
