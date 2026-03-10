"""Casos de uso de aplicación para base transaccional demo."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from ..dominio.pedidos_demo import LineaPedido, PedidoDemo, normalizar_lineas
from .dto import LineaPedidoDTO, PedidoDemoDTO, ResumenPedidoDemoDTO
from .puertos.repositorios_pedidos_demo import RepositorioPedidosDemo


@dataclass(slots=True)
class CrearPedidoDemoDesdeLineas:
    """Construye un pedido demo con normalización mínima de líneas."""

    def ejecutar(
        self,
        lineas: tuple[LineaPedido, ...],
        email_contacto: str,
        canal_compra: str,
        id_usuario: str | None = None,
    ) -> PedidoDemoDTO:
        pedido = PedidoDemo(
            id_pedido=_generar_id_pedido_demo(),
            email_contacto=email_contacto,
            canal_compra=canal_compra,
            lineas=normalizar_lineas(lineas),
            id_usuario=id_usuario,
        )
        return _a_pedido_dto(pedido)


@dataclass(slots=True)
class RegistrarPedidoDemo:
    """Construye y persiste el agregado pedido demo con repositorio desacoplado."""

    repositorio_pedidos_demo: RepositorioPedidosDemo

    def ejecutar(
        self,
        lineas: tuple[LineaPedido, ...],
        email_contacto: str,
        canal_compra: str,
        id_usuario: str | None = None,
    ) -> PedidoDemoDTO:
        pedido = PedidoDemo(
            id_pedido=_generar_id_pedido_demo(),
            email_contacto=email_contacto,
            canal_compra=canal_compra,
            lineas=normalizar_lineas(lineas),
            id_usuario=id_usuario,
        )
        pedido_persistido = self.repositorio_pedidos_demo.guardar(pedido)
        return _a_pedido_dto(pedido_persistido)


@dataclass(slots=True)
class RecalcularResumenPedidoDemo:
    """Devuelve resumen de importes del pedido demo."""

    def ejecutar(self, pedido: PedidoDemo) -> ResumenPedidoDemoDTO:
        return ResumenPedidoDemoDTO(
            id_pedido=pedido.id_pedido,
            cantidad_total_items=sum(linea.cantidad for linea in pedido.lineas),
            subtotal_demo=pedido.subtotal_demo,
        )


def _generar_id_pedido_demo() -> str:
    marca_tiempo = datetime.now(tz=UTC).strftime("%Y%m%d%H%M%S")
    sufijo = uuid4().hex[:8]
    return f"PD-{marca_tiempo}-{sufijo}"


def _a_pedido_dto(pedido: PedidoDemo) -> PedidoDemoDTO:
    return PedidoDemoDTO(
        id_pedido=pedido.id_pedido,
        estado=pedido.estado,
        canal_compra=pedido.canal_compra,
        email_contacto=pedido.email_contacto,
        subtotal_demo=pedido.subtotal_demo,
        lineas=tuple(_a_linea_dto(linea) for linea in pedido.lineas),
    )


def _a_linea_dto(linea: LineaPedido) -> LineaPedidoDTO:
    return LineaPedidoDTO(
        id_producto=linea.id_producto,
        slug_producto=linea.slug_producto,
        nombre_producto=linea.nombre_producto,
        cantidad=linea.cantidad,
        precio_unitario_demo=linea.precio_unitario_demo,
        subtotal_demo=linea.subtotal_demo,
    )
