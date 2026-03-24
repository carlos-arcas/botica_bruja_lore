"""Adaptadores de transición para coexistencia entre pedido demo y contrato real."""

from __future__ import annotations

import logging

from ..dominio.pedidos import ClientePedido, DetallePedido, DireccionEntrega, LineaPedido, Pedido
from ..dominio.pedidos_demo import PedidoDemo

logger = logging.getLogger(__name__)


def adaptar_pedido_demo_a_detalle_pedido(pedido_demo: PedidoDemo) -> DetallePedido:
    logger.info(
        "adaptando_pedido_demo_a_contrato_real",
        extra={
            "id_pedido": pedido_demo.id_pedido,
            "canal_demo": pedido_demo.canal_compra,
            "estado_demo": pedido_demo.estado,
            "contrato_origen": "demo_legacy",
        },
    )
    return DetallePedido(
        pedido=Pedido(
            id_pedido=pedido_demo.id_pedido,
            estado="pendiente_pago",
            canal_checkout=_mapear_canal(pedido_demo.canal_compra),
            cliente=ClientePedido(
                id_cliente=pedido_demo.id_usuario,
                email=pedido_demo.email_contacto,
                nombre_contacto="pendiente_migracion",
                telefono_contacto="pendiente_migracion",
                es_invitado=pedido_demo.canal_compra == "invitado",
            ),
            lineas=tuple(_mapear_linea(linea) for linea in pedido_demo.lineas),
            direccion_entrega=DireccionEntrega(
                nombre_destinatario="pendiente_migracion",
                linea_1="pendiente_migracion",
                codigo_postal="pendiente_migracion",
                ciudad="pendiente_migracion",
                provincia="pendiente_migracion",
            ),
        ),
        origen_contrato="demo_legacy",
    )


def _mapear_canal(canal_demo: str) -> str:
    return "web_autenticado" if canal_demo == "autenticado" else "web_invitado"


def _mapear_linea(linea_demo) -> LineaPedido:
    return LineaPedido(
        id_producto=linea_demo.id_producto,
        slug_producto=linea_demo.slug_producto,
        nombre_producto=linea_demo.nombre_producto,
        cantidad_comercial=linea_demo.cantidad,
        unidad_comercial="ud", precio_unitario=linea_demo.precio_unitario_demo,
    )
