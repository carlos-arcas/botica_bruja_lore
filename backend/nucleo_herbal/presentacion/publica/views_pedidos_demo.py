"""Views HTTP mínimas para crear y consultar pedidos demo."""

from __future__ import annotations

import json
from decimal import Decimal, InvalidOperation

from django.http import HttpRequest, JsonResponse

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...dominio.excepciones import ErrorDominio
from ...dominio.pedidos_demo import LineaPedido
from .dependencias import construir_servicios_publicos_pedidos_demo
from .email_demo_serializadores import serializar_email_demo
from .pedidos_demo_serializadores import serializar_pedido_demo
from .respuestas_json import json_no_encontrado, json_validacion


def crear_pedido_demo(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)

    payload, error = _leer_json(request)
    if error is not None:
        return error

    lineas, error_lineas = _construir_lineas(payload)
    if error_lineas is not None:
        return error_lineas

    email = payload.get("email")
    canal = payload.get("canal")
    id_usuario = payload.get("id_usuario")

    if not isinstance(email, str) or not email.strip():
        return json_validacion("El campo 'email' es obligatorio.")
    if not isinstance(canal, str) or not canal.strip():
        return json_validacion("El campo 'canal' es obligatorio.")
    if id_usuario is not None and not isinstance(id_usuario, str):
        return json_validacion("El campo 'id_usuario' debe ser texto.")

    try:
        servicios = construir_servicios_publicos_pedidos_demo()
        pedido = servicios.registrar_pedido_demo.ejecutar(
            lineas=lineas,
            email_contacto=email,
            canal_compra=canal,
            id_usuario=id_usuario,
        )
    except ErrorDominio as error_dominio:
        return json_validacion(str(error_dominio))

    return JsonResponse({"pedido": serializar_pedido_demo(pedido)}, status=201)


def detalle_pedido_demo(_request: HttpRequest, id_pedido: str) -> JsonResponse:
    servicios = construir_servicios_publicos_pedidos_demo()
    try:
        pedido = servicios.obtener_pedido_demo.ejecutar(id_pedido)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))

    return JsonResponse({"pedido": serializar_pedido_demo(pedido)})


def _leer_json(request: HttpRequest) -> tuple[dict, JsonResponse | None]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}, json_validacion("JSON inválido.")
    if not isinstance(payload, dict):
        return {}, json_validacion("El payload debe ser un objeto JSON.")
    return payload, None


def _construir_lineas(payload: dict) -> tuple[tuple[LineaPedido, ...], JsonResponse | None]:
    lineas = payload.get("lineas")
    if not isinstance(lineas, list) or not lineas:
        return (), json_validacion("El campo 'lineas' es obligatorio.")

    lineas_dominio: list[LineaPedido] = []
    for linea in lineas:
        if not isinstance(linea, dict):
            return (), json_validacion("Cada línea debe ser un objeto.")
        try:
            linea_dominio = LineaPedido(
                id_producto=_validar_texto(linea, "id_producto"),
                slug_producto=_validar_texto(linea, "slug_producto"),
                nombre_producto=_validar_texto(linea, "nombre_producto"),
                cantidad=_validar_entero(linea, "cantidad"),
                precio_unitario_demo=_validar_decimal(linea, "precio_unitario_demo"),
            )
        except (ValueError, ErrorDominio) as error:
            return (), json_validacion(str(error))
        lineas_dominio.append(linea_dominio)

    return tuple(lineas_dominio), None


def _validar_texto(payload: dict, campo: str) -> str:
    valor = payload.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        raise ValueError(f"El campo '{campo}' es obligatorio y debe ser texto.")
    return valor


def _validar_entero(payload: dict, campo: str) -> int:
    valor = payload.get(campo)
    if not isinstance(valor, int):
        raise ValueError(f"El campo '{campo}' debe ser entero.")
    return valor


def _validar_decimal(payload: dict, campo: str) -> Decimal:
    valor = payload.get(campo)
    if not isinstance(valor, (str, int, float)):
        raise ValueError(f"El campo '{campo}' debe ser numérico o texto decimal.")
    try:
        return Decimal(str(valor))
    except InvalidOperation as error:
        raise ValueError(f"El campo '{campo}' no tiene un decimal válido.") from error


def email_demo_pedido(_request: HttpRequest, id_pedido: str) -> JsonResponse:
    servicios = construir_servicios_publicos_pedidos_demo()
    try:
        email_demo = servicios.obtener_email_demo_pedido.ejecutar(id_pedido)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))

    return JsonResponse({"email_demo": serializar_email_demo(email_demo)})
