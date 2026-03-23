"""Serializadores JSON para libreta de direcciones de cuenta cliente."""

from __future__ import annotations


def serializar_direccion_cuenta_cliente(direccion) -> dict[str, object]:
    return {
        "id_direccion": direccion.id_direccion,
        "alias": direccion.alias,
        "nombre_destinatario": direccion.nombre_destinatario,
        "telefono_contacto": direccion.telefono_contacto,
        "linea_1": direccion.linea_1,
        "linea_2": direccion.linea_2,
        "codigo_postal": direccion.codigo_postal,
        "ciudad": direccion.ciudad,
        "provincia": direccion.provincia,
        "pais_iso": direccion.pais_iso,
        "predeterminada": direccion.predeterminada,
        "fecha_creacion": direccion.fecha_creacion.isoformat() if direccion.fecha_creacion else None,
        "fecha_actualizacion": direccion.fecha_actualizacion.isoformat() if direccion.fecha_actualizacion else None,
    }


def serializar_direcciones_cuenta_cliente(direcciones) -> list[dict[str, object]]:
    return [serializar_direccion_cuenta_cliente(direccion) for direccion in direcciones]
