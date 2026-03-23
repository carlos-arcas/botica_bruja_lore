"""Contrato canónico para ecommerce real y transición controlada desde demo."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal

from .excepciones import ErrorDominio

EstadoPedido = Literal["pendiente_pago", "pagado", "preparando", "enviado", "entregado", "cancelado"]
EstadoPago = Literal["pendiente", "requiere_accion", "pagado", "fallido", "cancelado"]
CanalCheckout = Literal["web_invitado", "web_autenticado", "backoffice"]
ProveedorPago = Literal["stripe"]

ESTADOS_PEDIDO_VALIDOS: tuple[EstadoPedido, ...] = (
    "pendiente_pago",
    "pagado",
    "preparando",
    "enviado",
    "entregado",
    "cancelado",
)
ESTADOS_PAGO_VALIDOS: tuple[EstadoPago, ...] = ("pendiente", "requiere_accion", "pagado", "fallido", "cancelado")
CANALES_CHECKOUT_VALIDOS: tuple[CanalCheckout, ...] = ("web_invitado", "web_autenticado", "backoffice")
RUTA_API_PEDIDOS = "/api/v1/pedidos/"

ESTRATEGIA_CONVIVENCIA_PEDIDOS = {
    "contrato_canonico": "Pedido",
    "legado_demo": "PedidoDemo",
    "modo": "anti_corrupcion",
    "ruta_legacy": "/api/v1/pedidos-demo/",
    "ruta_objetivo": RUTA_API_PEDIDOS,
    "estado": "coexistencia_checkout_real_v1",
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
    observaciones: str = ""

    def __post_init__(self) -> None:
        for campo, valor in (
            ("destinatario", self.nombre_destinatario),
            ("línea principal", self.linea_1),
            ("código postal", self.codigo_postal),
            ("ciudad", self.ciudad),
            ("provincia", self.provincia),
            ("país ISO", self.pais_iso),
        ):
            if not valor.strip():
                raise ErrorDominio(f"La dirección de entrega requiere {campo}.")


@dataclass(frozen=True, slots=True)
class ClientePedido:
    id_cliente: str | None
    email: str
    nombre_contacto: str
    telefono_contacto: str
    es_invitado: bool = True

    def __post_init__(self) -> None:
        for campo, valor in (("email", self.email), ("nombre de contacto", self.nombre_contacto), ("teléfono de contacto", self.telefono_contacto)):
            if not valor.strip():
                raise ErrorDominio(f"El cliente del pedido requiere {campo}.")
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
        for campo, valor in (("id de producto", self.id_producto), ("slug de producto", self.slug_producto), ("nombre de producto", self.nombre_producto), ("moneda", self.moneda)):
            if not valor.strip():
                raise ErrorDominio(f"La línea requiere {campo}.")
        if self.cantidad <= 0:
            raise ErrorDominio("La línea requiere cantidad mayor que cero.")
        if self.precio_unitario < Decimal("0"):
            raise ErrorDominio("La línea requiere precio unitario no negativo.")

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
    notas_cliente: str = ""
    moneda: str = "EUR"
    estado_pago: EstadoPago = "pendiente"
    proveedor_pago: ProveedorPago | None = None
    id_externo_pago: str | None = None
    url_pago: str | None = None
    fecha_pago_confirmado: datetime | None = None
    requiere_revision_manual: bool = False
    email_post_pago_enviado: bool = False
    fecha_email_post_pago: datetime | None = None
    transportista: str = ""
    codigo_seguimiento: str = ""
    envio_sin_seguimiento: bool = False
    fecha_preparacion: datetime | None = None
    fecha_envio: datetime | None = None
    fecha_entrega: datetime | None = None
    observaciones_operativas: str = ""
    email_envio_enviado: bool = False
    fecha_email_envio: datetime | None = None

    def __post_init__(self) -> None:
        if not self.id_pedido.strip():
            raise ErrorDominio("El pedido requiere identificador.")
        if self.estado not in ESTADOS_PEDIDO_VALIDOS:
            raise ErrorDominio("El pedido requiere estado real válido.")
        if self.estado_pago not in ESTADOS_PAGO_VALIDOS:
            raise ErrorDominio("El pedido requiere estado de pago válido.")
        if self.canal_checkout not in CANALES_CHECKOUT_VALIDOS:
            raise ErrorDominio("El pedido requiere canal de checkout válido.")
        if not self.lineas:
            raise ErrorDominio("El pedido requiere al menos una línea.")
        if not self.moneda.strip():
            raise ErrorDominio("El pedido requiere moneda.")
        if self.estado == "pagado" and self.estado_pago != "pagado":
            raise ErrorDominio("Un pedido pagado requiere estado_pago='pagado'.")
        if self.fecha_email_post_pago and not self.email_post_pago_enviado:
            raise ErrorDominio("La fecha de email post-pago requiere email_post_pago_enviado=True.")
        if self.fecha_email_envio and not self.email_envio_enviado:
            raise ErrorDominio("La fecha de email de envío requiere email_envio_enviado=True.")
        self._validar_operacion_fisica()

    @property
    def subtotal(self) -> Decimal:
        return sum((linea.subtotal for linea in self.lineas), Decimal("0"))

    def puede_iniciar_pago(self) -> None:
        if self.estado == "pagado" or self.estado_pago == "pagado":
            raise ErrorDominio("El pedido ya está pagado.")
        if self.estado != "pendiente_pago":
            raise ErrorDominio("El pedido no está en un estado compatible para iniciar pago.")

    def registrar_intencion_pago(self, proveedor: ProveedorPago, id_externo_pago: str, url_pago: str | None, estado_pago: EstadoPago) -> "Pedido":
        self.puede_iniciar_pago()
        return replace(self, proveedor_pago=proveedor, id_externo_pago=id_externo_pago, url_pago=url_pago, estado_pago=estado_pago)

    def marcar_pagado(self, fecha_confirmacion: datetime) -> "Pedido":
        if self.estado == "pagado" and self.estado_pago == "pagado":
            return self
        if self.estado != "pendiente_pago":
            raise ErrorDominio("Solo un pedido pendiente de pago puede pasar a pagado.")
        return replace(self, estado="pagado", estado_pago="pagado", fecha_pago_confirmado=fecha_confirmacion, requiere_revision_manual=True)

    def registrar_fallo_pago(self) -> "Pedido":
        if self.estado == "pagado":
            return self
        return replace(self, estado_pago="fallido")

    def registrar_cancelacion_pago(self) -> "Pedido":
        if self.estado == "pagado":
            return self
        return replace(self, estado_pago="cancelado")

    def marcar_email_post_pago_enviado(self, fecha_envio: datetime) -> "Pedido":
        if self.email_post_pago_enviado:
            return self
        return replace(self, email_post_pago_enviado=True, fecha_email_post_pago=fecha_envio)

    def marcar_email_envio_enviado(self, fecha_envio: datetime) -> "Pedido":
        if self.email_envio_enviado:
            return self
        return replace(self, email_envio_enviado=True, fecha_email_envio=fecha_envio)

    def marcar_preparando(self, fecha_preparacion: datetime) -> "Pedido":
        if self.estado != "pagado":
            raise ErrorDominio("Solo un pedido pagado puede pasar a preparando.")
        return replace(self, estado="preparando", requiere_revision_manual=False, fecha_preparacion=fecha_preparacion)

    def marcar_enviado(self, *, fecha_envio: datetime, transportista: str, codigo_seguimiento: str = "", envio_sin_seguimiento: bool = False, observaciones_operativas: str | None = None) -> "Pedido":
        if self.estado != "preparando":
            raise ErrorDominio("Solo un pedido preparando puede pasar a enviado.")
        return replace(
            self,
            estado="enviado",
            transportista=transportista.strip(),
            codigo_seguimiento=codigo_seguimiento.strip(),
            envio_sin_seguimiento=envio_sin_seguimiento,
            fecha_preparacion=self.fecha_preparacion or fecha_envio,
            fecha_envio=fecha_envio,
            observaciones_operativas=_combinar_observaciones(self.observaciones_operativas, observaciones_operativas),
        )

    def marcar_entregado(self, fecha_entrega: datetime, observaciones_operativas: str | None = None) -> "Pedido":
        if self.estado != "enviado":
            raise ErrorDominio("Solo un pedido enviado puede pasar a entregado.")
        return replace(self, estado="entregado", fecha_entrega=fecha_entrega, observaciones_operativas=_combinar_observaciones(self.observaciones_operativas, observaciones_operativas))

    def _validar_operacion_fisica(self) -> None:
        if self.estado in {"preparando", "enviado", "entregado"} and self.fecha_preparacion is None:
            raise ErrorDominio("La operativa física requiere fecha_preparacion desde preparando.")
        if self.estado in {"enviado", "entregado"}:
            self._validar_expedicion()
        if self.estado == "entregado" and self.fecha_entrega is None:
            raise ErrorDominio("Un pedido entregado requiere fecha_entrega.")

    def _validar_expedicion(self) -> None:
        if not self.transportista.strip():
            raise ErrorDominio("El envío requiere transportista.")
        if self.fecha_envio is None:
            raise ErrorDominio("El envío requiere fecha_envio.")
        if not self.envio_sin_seguimiento and not self.codigo_seguimiento.strip():
            raise ErrorDominio("El envío requiere código de seguimiento o marcar envío sin seguimiento.")


@dataclass(frozen=True, slots=True)
class DetallePedido:
    pedido: Pedido
    origen_contrato: Literal["real", "demo_legacy"] = "real"
    id_externo_pago: str | None = None


@dataclass(frozen=True, slots=True)
class PayloadPedido:
    canal_checkout: CanalCheckout
    cliente: ClientePedido
    direccion_entrega: DireccionEntrega | None
    lineas: tuple[LineaPedido, ...]
    notas_cliente: str = ""
    moneda: str = "EUR"
    id_direccion_guardada: str | None = None

    def __post_init__(self) -> None:
        if self.canal_checkout not in CANALES_CHECKOUT_VALIDOS:
            raise ErrorDominio("El payload requiere canal real válido.")
        if not self.lineas:
            raise ErrorDominio("El payload requiere al menos una línea.")
        if not self.moneda.strip():
            raise ErrorDominio("El payload requiere moneda.")
        tiene_manual = self.direccion_entrega is not None
        tiene_guardada = _hay_texto(self.id_direccion_guardada)
        if tiene_manual == tiene_guardada:
            raise ErrorDominio("Debes indicar exactamente una fuente de dirección: 'direccion_entrega' o 'id_direccion_guardada'.")
        if self.cliente.es_invitado and tiene_guardada:
            raise ErrorDominio("Solo un cliente autenticado puede usar 'id_direccion_guardada'.")



def _hay_texto(valor: str | None) -> bool:
    return bool(valor and valor.strip())


def _combinar_observaciones(actual: str, nueva: str | None) -> str:
    return nueva.strip() if nueva is not None else actual
