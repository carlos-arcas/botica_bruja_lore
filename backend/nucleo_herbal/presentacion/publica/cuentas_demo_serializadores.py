"""Serialización HTTP para API mínima de cuenta demo."""

from __future__ import annotations

from ...aplicacion.dto import CuentaDemoDTO, PedidoDemoDTO, PerfilCuentaDemoDTO


def serializar_cuenta_demo(dto: CuentaDemoDTO) -> dict:
    return {
        "id_usuario": dto.id_usuario,
        "email": dto.email,
        "nombre_visible": dto.nombre_visible,
    }


def serializar_perfil_cuenta_demo(dto: PerfilCuentaDemoDTO) -> dict:
    return {
        "id_usuario": dto.id_usuario,
        "email": dto.email,
        "nombre_visible": dto.nombre_visible,
    }


def serializar_historial_pedidos_demo(pedidos: tuple[PedidoDemoDTO, ...]) -> list[dict]:
    return [serializar_resumen_pedido_demo(pedido) for pedido in pedidos]


def serializar_resumen_pedido_demo(dto: PedidoDemoDTO) -> dict:
    return {
        "id_pedido": dto.id_pedido,
        "estado": dto.estado,
        "resumen": {
            "cantidad_total_items": sum(linea.cantidad for linea in dto.lineas),
            "subtotal_demo": str(dto.subtotal_demo),
        },
    }
