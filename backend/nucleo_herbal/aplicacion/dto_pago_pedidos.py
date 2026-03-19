"""DTOs de pago real v1 para el agregado Pedido."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True, slots=True)
class IntencionPagoPedidoDTO:
    id_pedido: str
    proveedor_pago: str
    id_externo_pago: str
    estado_pago: str
    moneda: str
    importe: Decimal
    url_pago: str | None


@dataclass(frozen=True, slots=True)
class EventoPagoNormalizadoDTO:
    id_evento: str
    tipo_evento: str
    proveedor_pago: str
    id_externo_pago: str
    id_pedido: str
    estado_pago: str
    moneda: str
    importe: Decimal
    payload_crudo: str
