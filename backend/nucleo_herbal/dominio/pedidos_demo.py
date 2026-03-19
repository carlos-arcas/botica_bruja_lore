"""Dominio transaccional demo para pedidos del ecommerce."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import UTC, datetime
from decimal import Decimal

from .excepciones import ErrorDominio

ESTADOS_PEDIDO_DEMO_VALIDOS = {"creado", "confirmado", "cancelado_demo"}
MARCA_CONTRATO_PEDIDO_DEMO = "legado_controlado"
RUTA_API_PEDIDOS_DEMO = "/api/v1/pedidos-demo/"
RUTA_FRONT_PEDIDO_DEMO = "/pedido-demo/[id_pedido]"
CANALES_PEDIDO_DEMO_VALIDOS = {"invitado", "autenticado"}


@dataclass(frozen=True, slots=True)
class LineaPedido:
    """Snapshot mínimo de una selección comercial dentro de un pedido demo."""

    id_producto: str
    slug_producto: str
    nombre_producto: str
    cantidad: int
    precio_unitario_demo: Decimal

    def __post_init__(self) -> None:
        if not self.id_producto.strip():
            raise ErrorDominio("La línea requiere id de producto.")
        if not self.slug_producto.strip():
            raise ErrorDominio("La línea requiere slug de producto.")
        if not self.nombre_producto.strip():
            raise ErrorDominio("La línea requiere nombre de producto.")
        if self.cantidad <= 0:
            raise ErrorDominio("La línea requiere cantidad mayor que cero.")
        if self.precio_unitario_demo < Decimal("0"):
            raise ErrorDominio("La línea requiere precio demo no negativo.")

    @property
    def subtotal_demo(self) -> Decimal:
        return self.precio_unitario_demo * self.cantidad

    def clave_agregacion(self) -> tuple[str, str]:
        return self.id_producto, self.slug_producto


@dataclass(frozen=True, slots=True)
class PedidoDemo:
    """Agregado raíz de checkout demo sin dependencias de infraestructura."""

    id_pedido: str
    email_contacto: str
    canal_compra: str
    lineas: tuple[LineaPedido, ...]
    estado: str = "creado"
    fecha_creacion: datetime = field(default_factory=lambda: datetime.now(tz=UTC))
    id_usuario: str | None = None

    def __post_init__(self) -> None:
        if not self.id_pedido.strip():
            raise ErrorDominio("El pedido demo requiere identificador.")
        if not self.email_contacto.strip():
            raise ErrorDominio("El pedido demo requiere email de contacto.")
        if self.canal_compra not in CANALES_PEDIDO_DEMO_VALIDOS:
            raise ErrorDominio("El pedido demo requiere canal válido.")
        if not self.lineas:
            raise ErrorDominio("El pedido demo requiere al menos una línea.")
        if self.estado not in ESTADOS_PEDIDO_DEMO_VALIDOS:
            raise ErrorDominio("El pedido demo requiere un estado válido.")
        if self.canal_compra == "autenticado" and not _hay_texto(self.id_usuario):
            raise ErrorDominio("El pedido autenticado requiere id de usuario.")

    @property
    def subtotal_demo(self) -> Decimal:
        return sum((linea.subtotal_demo for linea in self.lineas), Decimal("0"))

    def con_linea_agregada(self, nueva_linea: LineaPedido) -> PedidoDemo:
        lineas_normalizadas = normalizar_lineas((*self.lineas, nueva_linea))
        return replace(self, lineas=lineas_normalizadas)


def normalizar_lineas(lineas: tuple[LineaPedido, ...]) -> tuple[LineaPedido, ...]:
    if not lineas:
        raise ErrorDominio("No se puede normalizar un pedido demo sin líneas.")

    lineas_por_clave: dict[tuple[str, str], LineaPedido] = {}
    for linea in lineas:
        clave = linea.clave_agregacion()
        previa = lineas_por_clave.get(clave)
        if previa is None:
            lineas_por_clave[clave] = linea
            continue
        _validar_snapshot_compatible(previa, linea)
        lineas_por_clave[clave] = replace(previa, cantidad=previa.cantidad + linea.cantidad)

    return tuple(lineas_por_clave.values())


def _validar_snapshot_compatible(linea_base: LineaPedido, linea_nueva: LineaPedido) -> None:
    if linea_base.nombre_producto != linea_nueva.nombre_producto:
        raise ErrorDominio("No se puede mezclar snapshot de nombre para un mismo producto.")
    if linea_base.precio_unitario_demo != linea_nueva.precio_unitario_demo:
        raise ErrorDominio("No se puede mezclar precio demo para un mismo producto.")


def _hay_texto(valor: str | None) -> bool:
    if valor is None:
        return False
    return bool(valor.strip())
