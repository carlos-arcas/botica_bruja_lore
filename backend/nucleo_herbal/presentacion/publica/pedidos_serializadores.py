"""Serialización HTTP del checkout real v1."""

from __future__ import annotations

from ...aplicacion.dto_pedidos import PedidoRealDTO


def _serializar_fecha(valor: object) -> str | None:
    return None if valor is None else valor.isoformat()


def serializar_pedido(dto: PedidoRealDTO) -> dict[str, object]:
    return {
        "id_pedido": dto.id_pedido,
        "estado": dto.estado,
        "estado_pago": dto.estado_pago,
        "canal_checkout": dto.canal_checkout,
        "moneda": dto.moneda,
        "metodo_envio": dto.metodo_envio,
        "subtotal": str(dto.subtotal),
        "importe_envio": str(dto.importe_envio),
        "total": str(dto.total),
        "requiere_revision_manual": dto.requiere_revision_manual,
        "email_post_pago_enviado": dto.email_post_pago_enviado,
        "inventario_descontado": dto.inventario_descontado,
        "incidencia_stock_confirmacion": dto.incidencia_stock_confirmacion,
        "incidencia_stock_revisada": dto.incidencia_stock_revisada,
        "fecha_revision_incidencia_stock": dto.fecha_revision_incidencia_stock.isoformat().replace('+00:00', 'Z') if dto.fecha_revision_incidencia_stock else None,
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
        "expedicion": {
            "transportista": dto.expedicion.transportista,
            "codigo_seguimiento": dto.expedicion.codigo_seguimiento,
            "envio_sin_seguimiento": dto.expedicion.envio_sin_seguimiento,
            "fecha_preparacion": _serializar_fecha(dto.expedicion.fecha_preparacion),
            "fecha_envio": _serializar_fecha(dto.expedicion.fecha_envio),
            "fecha_entrega": _serializar_fecha(dto.expedicion.fecha_entrega),
            "observaciones_operativas": dto.expedicion.observaciones_operativas,
            "email_envio_enviado": dto.expedicion.email_envio_enviado,
        },
        "resumen": {
            "cantidad_total_items": sum(linea.cantidad_comercial for linea in dto.lineas),
            "subtotal": str(dto.subtotal),
            "importe_envio": str(dto.importe_envio),
            "total": str(dto.total),
        },
        "estado_cliente": {
            "cancelado_operativamente": dto.cancelado_operativa_incidencia_stock,
            "estado_reembolso": dto.estado_reembolso,
            "fecha_reembolso": _serializar_fecha(dto.fecha_reembolso),
        },
        "lineas": [
            {
                "id_producto": linea.id_producto,
                "slug_producto": linea.slug_producto,
                "nombre_producto": linea.nombre_producto,
                "cantidad": linea.cantidad_comercial,
                "cantidad_comercial": linea.cantidad_comercial,
                "unidad_comercial": linea.unidad_comercial,
                "precio_unitario": str(linea.precio_unitario),
                "moneda": linea.moneda,
                "subtotal": str(linea.subtotal),
            }
            for linea in dto.lineas
        ],
    }
