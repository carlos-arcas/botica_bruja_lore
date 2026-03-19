"""Serializadores JSON para cuenta real de cliente."""

from __future__ import annotations

from ..publica.pedidos_serializadores import serializar_pedido


def serializar_cuenta_cliente(cuenta) -> dict[str, object]:
    return {
        "id_usuario": cuenta.id_usuario,
        "email": cuenta.email,
        "nombre_visible": cuenta.nombre_visible,
        "activo": cuenta.activo,
        "email_verificado": cuenta.email_verificado,
        "fecha_creacion": cuenta.fecha_creacion.isoformat() if cuenta.fecha_creacion else None,
        "fecha_actualizacion": cuenta.fecha_actualizacion.isoformat() if cuenta.fecha_actualizacion else None,
    }


def serializar_sesion_cliente(resultado) -> dict[str, object]:
    return {
        "autenticado": resultado.autenticado,
        "cuenta": None if resultado.cuenta is None else serializar_cuenta_cliente(resultado.cuenta),
    }


def serializar_pedidos_cuenta(pedidos) -> list[dict[str, object]]:
    return [serializar_pedido(pedido) for pedido in pedidos]
