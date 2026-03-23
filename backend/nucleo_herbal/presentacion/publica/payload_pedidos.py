"""Construcción del payload HTTP del checkout real hacia dominio."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation

from ...dominio.excepciones import ErrorDominio
from ...dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, PayloadPedido


def construir_payload_pedido(payload: dict) -> PayloadPedido:
    canal_checkout = _texto(payload, "canal_checkout")
    id_usuario = _texto_opcional(payload, "id_usuario")
    nombre_contacto = _texto(payload, "nombre_contacto")
    moneda = _texto_opcional(payload, "moneda") or "EUR"
    cliente = ClientePedido(
        id_cliente=id_usuario,
        email=_texto(payload, "email_contacto"),
        nombre_contacto=nombre_contacto,
        telefono_contacto=_texto(payload, "telefono_contacto"),
        es_invitado=canal_checkout == "web_invitado",
    )
    direccion = _construir_direccion_opcional(payload)
    lineas = _construir_lineas(payload, moneda)
    return PayloadPedido(
        canal_checkout=canal_checkout,
        cliente=cliente,
        direccion_entrega=direccion,
        lineas=lineas,
        notas_cliente=_texto_opcional(payload, "notas_cliente") or "",
        moneda=moneda,
        id_direccion_guardada=_texto_opcional(payload, "id_direccion_guardada"),
    )


def _construir_direccion_opcional(payload: dict) -> DireccionEntrega | None:
    if "direccion_entrega" not in payload or payload.get("direccion_entrega") is None:
        return None
    return _construir_direccion(_objeto(payload, "direccion_entrega"))


def _construir_direccion(payload: dict) -> DireccionEntrega:
    return DireccionEntrega(
        nombre_destinatario=_texto(payload, "nombre_destinatario"),
        linea_1=_texto(payload, "linea_1"),
        linea_2=_texto_opcional(payload, "linea_2") or "",
        codigo_postal=_texto(payload, "codigo_postal"),
        ciudad=_texto(payload, "ciudad"),
        provincia=_texto(payload, "provincia"),
        pais_iso=_texto_opcional(payload, "pais_iso") or "ES",
        observaciones=_texto_opcional(payload, "observaciones") or "",
    )


def _construir_lineas(payload: dict, moneda: str) -> tuple[LineaPedido, ...]:
    lineas = payload.get("lineas")
    if not isinstance(lineas, list) or not lineas:
        raise ErrorDominio("El campo 'lineas' es obligatorio.")
    return tuple(_construir_linea(linea, moneda) for linea in lineas)


def _construir_linea(payload: dict, moneda: str) -> LineaPedido:
    if not isinstance(payload, dict):
        raise ErrorDominio("Cada línea debe ser un objeto.")
    return LineaPedido(
        id_producto=_texto(payload, "id_producto"),
        slug_producto=_texto(payload, "slug_producto"),
        nombre_producto=_texto(payload, "nombre_producto"),
        cantidad=_entero(payload, "cantidad"),
        precio_unitario=_decimal(payload, "precio_unitario"),
        moneda=_texto_opcional(payload, "moneda") or moneda,
    )


def _objeto(payload: dict, campo: str) -> dict:
    valor = payload.get(campo)
    if not isinstance(valor, dict):
        raise ErrorDominio(f"El campo '{campo}' debe ser un objeto.")
    return valor


def _texto(payload: dict, campo: str) -> str:
    valor = payload.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        raise ErrorDominio(f"El campo '{campo}' es obligatorio y debe ser texto.")
    return valor.strip()


def _texto_opcional(payload: dict, campo: str) -> str | None:
    valor = payload.get(campo)
    if valor is None:
        return None
    if not isinstance(valor, str):
        raise ErrorDominio(f"El campo '{campo}' debe ser texto.")
    return valor.strip() or None


def _entero(payload: dict, campo: str) -> int:
    valor = payload.get(campo)
    if not isinstance(valor, int):
        raise ErrorDominio(f"El campo '{campo}' debe ser entero.")
    return valor


def _decimal(payload: dict, campo: str) -> Decimal:
    valor = payload.get(campo)
    if not isinstance(valor, (str, int, float)):
        raise ErrorDominio(f"El campo '{campo}' debe ser numérico o texto decimal.")
    try:
        return Decimal(str(valor))
    except InvalidOperation as error:
        raise ErrorDominio(f"El campo '{campo}' no tiene un decimal válido.") from error
