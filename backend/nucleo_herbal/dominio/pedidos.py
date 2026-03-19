"""Contrato canónico para ecommerce real y transición controlada desde demo."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal

from .excepciones import ErrorDominio

EstadoPedido = Literal[
    "pendiente_pago",
    "pagado",
    "preparando",
    "enviado",
    "entregado",
    "cancelado",
]
CanalCheckout = Literal["web_invitado", "web_autenticado", "backoffice"]

ESTADOS_PEDIDO_VALIDOS: tuple[EstadoPedido, ...] = (
    "pendiente_pago",
    "pagado",
    "preparando",
    "enviado",
    "entregado",
    "cancelado",
)
CANALES_CHECKOUT_VALIDOS: tuple[CanalCheckout, ...] = (
    "web_invitado",
    "web_autenticado",
    "backoffice",
)

ESTRATEGIA_CONVIVENCIA_PEDIDOS = {
    "contrato_canonico": "Pedido",
    "legado_demo": "PedidoDemo",
    "modo": "anti_corrupcion",
    "ruta_legacy": "/api/v1/pedidos-demo/",
    "ruta_objetivo": "/api/v1/pedidos/",
    "estado": "planificado_para_coexistencia_controlada",
}


@dataclass(frozen=True, slots=True)
class DireccionEntrega:
    nombre_destinatario: str
    linea_1: str
    linea_2: str = ""
    codigo_postal: str = ""
    ciudad: str = ""
    provincia: str = ""
    pais_iso: str = "ES"
    telefono: str = ""

    def __post_init__(self) -> None:
        if not self.nombre_destinatario.strip():
            raise ErrorDominio("La dirección de entrega requiere destinatario.")
        if not self.linea_1.strip():
            raise ErrorDominio("La dirección de entrega requiere línea principal.")
        if not self.ciudad.strip():
            raise ErrorDominio("La dirección de entrega requiere ciudad.")
        if not self.pais_iso.strip():
            raise ErrorDominio("La dirección de entrega requiere país ISO.")


@dataclass(frozen=True, slots=True)
class ClientePedido:
    id_cliente: str | None
    email: str
    nombre_visible: str = ""
    es_invitado: bool = True

    def __post_init__(self) -> None:
        if not self.email.strip():
            raise ErrorDominio("El cliente del pedido requiere email.")
        if not self.es_invitado and not _hay_texto(self.id_cliente):
            raise ErrorDominio("El cliente autenticado requiere identificador.")


@dataclass(frozen=True, slots=True)
class LineaPedido:
    id_producto: str
    slug_producto: str
    nombre_producto: str
    cantidad: int
    precio_unitario: Decimal
    moneda: str = "EUR"

    def __post_init__(self) -> None:
        if not self.id_producto.strip():
            raise ErrorDominio("La línea requiere id de producto.")
        if not self.slug_producto.strip():
            raise ErrorDominio("La línea requiere slug de producto.")
        if not self.nombre_producto.strip():
            raise ErrorDominio("La línea requiere nombre de producto.")
        if self.cantidad <= 0:
            raise ErrorDominio("La línea requiere cantidad mayor que cero.")
        if self.precio_unitario < Decimal("0"):
            raise ErrorDominio("La línea requiere precio unitario no negativo.")
        if not self.moneda.strip():
            raise ErrorDominio("La línea requiere moneda.")

    @property
    def subtotal(self) -> Decimal:
        return self.precio_unitario * self.cantidad


@dataclass(frozen=True, slots=True)
class Pedido:
    id_pedido: str
    estado: EstadoPedido
    canal_checkout: CanalCheckout
    cliente: ClientePedido
    lineas: tuple[LineaPedido, ...]
    direccion_entrega: DireccionEntrega
    fecha_creacion: datetime = field(default_factory=lambda: datetime.now(tz=UTC))

    def __post_init__(self) -> None:
        if not self.id_pedido.strip():
            raise ErrorDominio("El pedido requiere identificador.")
        if self.estado not in ESTADOS_PEDIDO_VALIDOS:
            raise ErrorDominio("El pedido requiere estado real válido.")
        if self.canal_checkout not in CANALES_CHECKOUT_VALIDOS:
            raise ErrorDominio("El pedido requiere canal de checkout válido.")
        if not self.lineas:
            raise ErrorDominio("El pedido requiere al menos una línea.")

    @property
    def subtotal(self) -> Decimal:
        return sum((linea.subtotal for linea in self.lineas), Decimal("0"))


@dataclass(frozen=True, slots=True)
class DetallePedido:
    pedido: Pedido
    origen_contrato: Literal["real", "demo_legacy"] = "real"
    id_externo_pago: str | None = None


@dataclass(frozen=True, slots=True)
class PayloadPedido:
    canal_checkout: CanalCheckout
    cliente: ClientePedido
    direccion_entrega: DireccionEntrega
    lineas: tuple[LineaPedido, ...]

    def __post_init__(self) -> None:
        if self.canal_checkout not in CANALES_CHECKOUT_VALIDOS:
            raise ErrorDominio("El payload requiere canal real válido.")
        if not self.lineas:
            raise ErrorDominio("El payload requiere al menos una línea.")


def _hay_texto(valor: str | None) -> bool:
    return bool(valor and valor.strip())
