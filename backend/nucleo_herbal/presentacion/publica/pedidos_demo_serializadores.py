"""Serialización HTTP para API mínima de pedidos demo."""

from __future__ import annotations

from ...aplicacion.dto import LineaPedidoDTO, PedidoDemoDTO


def serializar_pedido_demo(dto: PedidoDemoDTO) -> dict:
    return {
        "id_pedido": dto.id_pedido,
        "estado": dto.estado,
        "canal": dto.canal_compra,
        "email": dto.email_contacto,
        "resumen": {
            "cantidad_total_items": sum(linea.cantidad for linea in dto.lineas),
            "subtotal_demo": str(dto.subtotal_demo),
        },
        "lineas": [serializar_linea_pedido(item) for item in dto.lineas],
    }


def serializar_linea_pedido(dto: LineaPedidoDTO) -> dict:
    return {
        "id_producto": dto.id_producto,
        "slug_producto": dto.slug_producto,
        "nombre_producto": dto.nombre_producto,
        "cantidad": dto.cantidad,
        "precio_unitario_demo": str(dto.precio_unitario_demo),
        "subtotal_demo": str(dto.subtotal_demo),
    }
