#!/usr/bin/env python3
"""Conciliación operativa mínima de pedidos reales (solo lectura)."""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")

import django
from django.core.exceptions import ImproperlyConfigured
from django.db.utils import OperationalError, ProgrammingError

django.setup()

from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import (
    MovimientoInventarioModelo,
)
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo

SEVERIDADES = ("ERROR", "WARNING", "INFO")


@dataclass(frozen=True, slots=True)
class Inconsistencia:
    severidad: str
    codigo: str
    id_pedido: str
    detalle: str
    accion_sugerida: str


@dataclass(frozen=True, slots=True)
class PedidoSnapshot:
    id_pedido: str
    estado: str
    estado_pago: str
    inventario_descontado: bool
    incidencia_stock_confirmacion: bool
    cancelado_operativa_incidencia_stock: bool
    estado_reembolso: str
    inventario_restituido: bool
    transportista: str
    codigo_seguimiento: str
    envio_sin_seguimiento: bool
    fecha_envio: object
    fecha_entrega: object
    email_post_pago_enviado: bool
    email_envio_enviado: bool
    email_cancelacion_enviado: bool
    email_reembolso_enviado: bool


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Chequeo de conciliación operativa para pedidos reales.")
    parser.add_argument("--max-pedidos", type=int, default=300)
    parser.add_argument("--fail-on", choices=("error", "warning", "none"), default="error")
    parser.add_argument("--json", action="store_true")
    return parser.parse_args()


def _snapshot_pedidos(max_pedidos: int) -> tuple[PedidoSnapshot, ...]:
    queryset = PedidoRealModelo.objects.order_by("-fecha_creacion")[: max(1, max_pedidos)]
    return tuple(
        PedidoSnapshot(
            id_pedido=p.id_pedido,
            estado=p.estado,
            estado_pago=p.estado_pago,
            inventario_descontado=p.inventario_descontado,
            incidencia_stock_confirmacion=p.incidencia_stock_confirmacion,
            cancelado_operativa_incidencia_stock=p.cancelado_operativa_incidencia_stock,
            estado_reembolso=p.estado_reembolso,
            inventario_restituido=p.inventario_restituido,
            transportista=p.transportista,
            codigo_seguimiento=p.codigo_seguimiento,
            envio_sin_seguimiento=p.envio_sin_seguimiento,
            fecha_envio=p.fecha_envio,
            fecha_entrega=p.fecha_entrega,
            email_post_pago_enviado=p.email_post_pago_enviado,
            email_envio_enviado=p.email_envio_enviado,
            email_cancelacion_enviado=p.email_cancelacion_enviado,
            email_reembolso_enviado=p.email_reembolso_enviado,
        )
        for p in queryset
    )


def _referencias_restitucion(ids_pedido: tuple[str, ...]) -> set[str]:
    if not ids_pedido:
        return set()
    queryset = MovimientoInventarioModelo.objects.filter(
        tipo_movimiento=MovimientoInventarioModelo.TIPO_RESTITUCION_MANUAL,
        referencia__in=ids_pedido,
    ).values_list("referencia", flat=True)
    return {str(ref) for ref in queryset if ref}


def _evaluar_pedido(p: PedidoSnapshot, referencias_restitucion: set[str]) -> tuple[Inconsistencia, ...]:
    hallazgos: list[Inconsistencia] = []

    def add(sev: str, code: str, det: str, accion: str) -> None:
        hallazgos.append(Inconsistencia(sev, code, p.id_pedido, det, accion))

    if p.estado == "pagado" and p.estado_pago == "pagado" and not p.inventario_descontado and not p.incidencia_stock_confirmacion:
        add("ERROR", "pedido_pagado_sin_descuento_ni_incidencia_stock", "Pedido pagado sin descuento de inventario y sin incidencia de stock confirmada.", "Revisar post-pago y registrar incidencia o descuento real de inventario.")
    if p.estado_reembolso in {"ejecutado", "fallido"} and not p.cancelado_operativa_incidencia_stock:
        add("ERROR", "reembolso_sin_cancelacion_operativa", "Pedido con estado de reembolso avanzado sin cancelación operativa por incidencia de stock.", "Auditar flujo de cancelación/reembolso y corregir estado operativo.")
    if p.cancelado_operativa_incidencia_stock and p.estado_reembolso == "no_iniciado":
        add("ERROR", "cancelacion_operativa_sin_reembolso_iniciado", "Pedido cancelado operativamente con reembolso no iniciado.", "Iniciar reembolso manual o documentar bloqueo operativo explícito.")
    if p.cancelado_operativa_incidencia_stock and p.estado_reembolso == "fallido":
        add("WARNING", "cancelacion_operativa_con_reembolso_fallido", "Pedido cancelado operativamente con reembolso fallido.", "Reintentar reembolso manual o cerrar incidencia administrativa.")
    if p.inventario_restituido and p.id_pedido not in referencias_restitucion:
        add("ERROR", "inventario_restituido_sin_ledger_restitucion", "Pedido marcado con inventario restituido sin movimiento ledger restitucion_manual asociado.", "Registrar movimiento de restitución manual o corregir flag inventario_restituido.")

    if p.estado in {"enviado", "entregado"}:
        if not p.transportista.strip():
            add("ERROR", "expedicion_sin_transportista", "Pedido enviado/entregado sin transportista.", "Completar datos de expedición en backoffice.")
        if p.fecha_envio is None:
            add("ERROR", "expedicion_sin_fecha_envio", "Pedido enviado/entregado sin fecha_envio.", "Corregir trazabilidad de expedición.")
        if not p.envio_sin_seguimiento and not p.codigo_seguimiento.strip():
            add("ERROR", "expedicion_sin_tracking_ni_flag_sin_tracking", "Pedido enviado/entregado sin código de seguimiento ni flag envio_sin_seguimiento.", "Informar tracking o marcar envío sin tracking público.")
    if p.estado == "entregado" and p.fecha_entrega is None:
        add("ERROR", "entregado_sin_fecha_entrega", "Pedido en estado entregado sin fecha_entrega.", "Completar fecha de entrega real.")

    if p.estado == "pagado" and not p.incidencia_stock_confirmacion and not p.email_post_pago_enviado:
        add("WARNING", "email_post_pago_pendiente", "Pedido pagado sin incidencia de stock y email post-pago no enviado.", "Revisar envío de email post-pago o registrar incidencia operativa.")
    if p.estado in {"enviado", "entregado"} and not p.email_envio_enviado:
        add("WARNING", "email_envio_pendiente", "Pedido enviado/entregado sin email de envío marcado como enviado.", "Revisar trigger de notificación de envío o marcar envío manual.")
    if p.cancelado_operativa_incidencia_stock and not p.email_cancelacion_enviado:
        add("WARNING", "email_cancelacion_pendiente", "Pedido cancelado operativamente sin email de cancelación marcado.", "Revisar notificación de cancelación operativa.")
    if p.estado_reembolso == "ejecutado" and not p.email_reembolso_enviado:
        add("WARNING", "email_reembolso_pendiente", "Reembolso ejecutado sin email de reembolso marcado.", "Enviar notificación de reembolso al cliente o registrar excepción operativa.")
    if p.email_reembolso_enviado and p.estado_reembolso != "ejecutado":
        add("ERROR", "email_reembolso_incoherente", "Email de reembolso marcado como enviado sin reembolso ejecutado.", "Corregir flags de email/reembolso para evitar información contradictoria.")

    return tuple(hallazgos)


def _evaluar(pedidos: tuple[PedidoSnapshot, ...], referencias_restitucion: set[str]) -> tuple[Inconsistencia, ...]:
    return tuple(h for p in pedidos for h in _evaluar_pedido(p, referencias_restitucion))


def _code_for_findings(hallazgos: tuple[Inconsistencia, ...], fail_on: str) -> int:
    if fail_on == "none":
        return 0
    if fail_on == "warning":
        return 1 if hallazgos else 0
    return 1 if any(h.severidad == "ERROR" for h in hallazgos) else 0


def _print_text(hallazgos: tuple[Inconsistencia, ...], pedidos_auditados: int) -> None:
    print("== Conciliación operativa de pedidos reales (solo lectura) ==")
    print(f"Pedidos auditados: {pedidos_auditados}")
    if not hallazgos:
        print("Resultado: sin inconsistencias detectadas.")
        return
    for sev in SEVERIDADES:
        subset = [h for h in hallazgos if h.severidad == sev]
        if not subset:
            continue
        print(f"\n[{sev}] {len(subset)} hallazgo(s)")
        for item in subset:
            print(f"- {item.id_pedido} :: {item.codigo}")
            print(f"  detalle: {item.detalle}")
            print(f"  accion: {item.accion_sugerida}")


def main() -> int:
    args = _parse_args()
    try:
        pedidos = _snapshot_pedidos(args.max_pedidos)
    except (OperationalError, ProgrammingError, ImproperlyConfigured) as error:
        print(f"SKIP: conciliación no aplicable en este entorno ({str(error).splitlines()[0]})")
        return 0

    hallazgos = _evaluar(pedidos, _referencias_restitucion(tuple(p.id_pedido for p in pedidos)))
    if args.json:
        print(
            json.dumps(
                {
                    "pedidos_auditados": len(pedidos),
                    "hallazgos": [asdict(h) for h in hallazgos],
                    "resumen": {s: sum(1 for h in hallazgos if h.severidad == s) for s in SEVERIDADES},
                    "exit_policy": args.fail_on,
                },
                ensure_ascii=False,
                indent=2,
                sort_keys=True,
            )
        )
    else:
        _print_text(hallazgos, len(pedidos))
    return _code_for_findings(hallazgos, args.fail_on)


if __name__ == "__main__":
    raise SystemExit(main())
