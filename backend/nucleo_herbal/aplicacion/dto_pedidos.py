"""DTOs del checkout real v1."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass(frozen=True, slots=True)
class DireccionEntregaDTO:
    nombre_destinatario: str
    linea_1: str
    linea_2: str
    codigo_postal: str
    ciudad: str
    provincia: str
    pais_iso: str
    observaciones: str


@dataclass(frozen=True, slots=True)
class ClientePedidoDTO:
    email: str
    nombre_contacto: str
    telefono_contacto: str
    es_invitado: bool
    id_usuario: str | None


@dataclass(frozen=True, slots=True)
class LineaPedidoRealDTO:
    id_producto: str
    slug_producto: str
    nombre_producto: str
    cantidad: int
    precio_unitario: Decimal
    moneda: str
    subtotal: Decimal


@dataclass(frozen=True, slots=True)
class ExpedicionPedidoDTO:
    transportista: str
    codigo_seguimiento: str
    envio_sin_seguimiento: bool
    fecha_preparacion: datetime | None
    fecha_envio: datetime | None
    fecha_entrega: datetime | None
    observaciones_operativas: str
    email_envio_enviado: bool


@dataclass(frozen=True, slots=True)
class PedidoRealDTO:
    id_pedido: str
    estado: str
    estado_pago: str
    canal_checkout: str
    moneda: str
    subtotal: Decimal
    proveedor_pago: str | None
    id_externo_pago: str | None
    url_pago: str | None
    requiere_revision_manual: bool
    inventario_descontado: bool
    incidencia_stock_confirmacion: bool
    email_post_pago_enviado: bool
    cliente: ClientePedidoDTO
    direccion_entrega: DireccionEntregaDTO
    lineas: tuple[LineaPedidoRealDTO, ...]
    notas_cliente: str
    expedicion: ExpedicionPedidoDTO
