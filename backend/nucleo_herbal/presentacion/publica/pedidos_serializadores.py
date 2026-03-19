"""Serialización HTTP del checkout real v1."""

from __future__ import annotations

from ...aplicacion.dto_pedidos import PedidoRealDTO


def serializar_pedido(dto: PedidoRealDTO) -> dict[str, object]:
    return {
        "id_pedido": dto.id_pedido,
        "estado": dto.estado,
        "estado_pago": dto.estado_pago,
        "canal_checkout": dto.canal_checkout,
        "moneda": dto.moneda,
        "subtotal": str(dto.subtotal),
        "cliente": {
            "email_contacto": dto.cliente.email,
            "nombre_contacto": dto.cliente.nombre_contacto,
            "telefono_contacto": dto.cliente.telefono_contacto,
            "id_usuario": dto.cliente.id_usuario,
            "es_invitado": dto.cliente.es_invitado,
        },
        "direccion_entrega": {
            "nombre_destinatario": dto.direccion_entrega.nombre_destinatario,
            "linea_1": dto.direccion_entrega.linea_1,
            "linea_2": dto.direccion_entrega.linea_2,
            "codigo_postal": dto.direccion_entrega.codigo_postal,
            "ciudad": dto.direccion_entrega.ciudad,
            "provincia": dto.direccion_entrega.provincia,
            "pais_iso": dto.direccion_entrega.pais_iso,
            "observaciones": dto.direccion_entrega.observaciones,
        },
        "notas_cliente": dto.notas_cliente,
        "pago": {
            "proveedor_pago": dto.proveedor_pago,
            "id_externo_pago": dto.id_externo_pago,
            "url_pago": dto.url_pago,
        },
        "resumen": {
            "cantidad_total_items": sum(linea.cantidad for linea in dto.lineas),
            "subtotal": str(dto.subtotal),
        },
        "lineas": [
            {
                "id_producto": linea.id_producto,
                "slug_producto": linea.slug_producto,
                "nombre_producto": linea.nombre_producto,
                "cantidad": linea.cantidad,
                "precio_unitario": str(linea.precio_unitario),
                "moneda": linea.moneda,
                "subtotal": str(linea.subtotal),
            }
            for linea in dto.lineas
        ],
    }
