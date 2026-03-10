"""Serialización HTTP para email demo asociado a pedidos demo."""

from __future__ import annotations

from ...aplicacion.dto import EmailDemoLineaDTO, EmailPedidoDemoDTO


def serializar_email_demo(dto: EmailPedidoDemoDTO) -> dict:
    return {
        "id_pedido": dto.id_pedido,
        "estado": dto.estado,
        "canal": dto.canal_compra,
        "email_destino": dto.email_destino,
        "asunto": dto.asunto,
        "cuerpo_texto": dto.cuerpo_texto,
        "subtotal_demo": str(dto.subtotal_demo),
        "lineas": [serializar_linea_email_demo(linea) for linea in dto.lineas],
        "es_simulacion": True,
    }


def serializar_linea_email_demo(dto: EmailDemoLineaDTO) -> dict:
    return {
        "nombre_producto": dto.nombre_producto,
        "cantidad": dto.cantidad,
        "subtotal_demo": str(dto.subtotal_demo),
    }
