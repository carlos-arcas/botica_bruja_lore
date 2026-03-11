"""Views HTTP mínimas para cuenta demo con valor (ciclo 4 / prompt 3)."""

from __future__ import annotations

import json

from django.http import HttpRequest, JsonResponse

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_cuentas_demo import ErrorAutenticacionDemo
from ...dominio.excepciones import ErrorDominio
from .cuentas_demo_serializadores import (
    serializar_cuenta_demo,
    serializar_historial_pedido_demo,
    serializar_perfil_cuenta_demo,
)
from .dependencias import construir_servicios_publicos_cuenta_demo
from .respuestas_json import json_no_autorizado, json_no_encontrado, json_validacion


def registrar_cuenta_demo(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)

    payload, error = _leer_payload_json(request)
    if error is not None:
        return error

    email, error = _validar_texto_obligatorio(payload, "email")
    if error is not None:
        return error
    nombre_visible, error = _validar_texto_obligatorio(payload, "nombre_visible")
    if error is not None:
        return error
    clave_demo, error = _validar_texto_obligatorio(payload, "clave_acceso_demo")
    if error is not None:
        return error

    servicios = construir_servicios_publicos_cuenta_demo()
    try:
        cuenta = servicios.registrar_cuenta_demo.ejecutar(
            email=email,
            nombre_visible=nombre_visible,
            clave_acceso_demo=clave_demo,
        )
    except ErrorDominio as error_dominio:
        return json_validacion(str(error_dominio))

    return JsonResponse({"cuenta": serializar_cuenta_demo(cuenta)}, status=201)


def autenticar_cuenta_demo(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)

    payload, error = _leer_payload_json(request)
    if error is not None:
        return error

    email, error = _validar_texto_obligatorio(payload, "email")
    if error is not None:
        return error
    clave_demo, error = _validar_texto_obligatorio(payload, "clave_acceso_demo")
    if error is not None:
        return error

    servicios = construir_servicios_publicos_cuenta_demo()
    try:
        resultado = servicios.autenticar_cuenta_demo.ejecutar(
            email=email,
            clave_acceso_demo=clave_demo,
        )
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))
    except ErrorAutenticacionDemo as error_autenticacion:
        return json_no_autorizado(str(error_autenticacion))

    return JsonResponse({"cuenta": serializar_cuenta_demo(resultado.cuenta)})


def perfil_cuenta_demo(_request: HttpRequest, id_usuario: str) -> JsonResponse:
    servicios = construir_servicios_publicos_cuenta_demo()
    try:
        perfil = servicios.obtener_perfil_cuenta_demo.ejecutar(id_usuario=id_usuario)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))

    return JsonResponse({"perfil": serializar_perfil_cuenta_demo(perfil)})


def historial_pedidos_demo_cuenta(_request: HttpRequest, id_usuario: str) -> JsonResponse:
    servicios = construir_servicios_publicos_cuenta_demo()
    try:
        historial = servicios.obtener_historial_cuenta_demo.ejecutar(id_usuario=id_usuario)
    except ErrorAplicacionLookup as error_lookup:
        return json_no_encontrado(str(error_lookup))

    return JsonResponse(
        {
            "id_usuario": id_usuario,
            "pedidos": [serializar_historial_pedido_demo(item) for item in historial],
        }
    )


def _leer_payload_json(request: HttpRequest) -> tuple[dict, JsonResponse | None]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}, json_validacion("JSON inválido.")
    if not isinstance(payload, dict):
        return {}, json_validacion("El payload debe ser un objeto JSON.")
    return payload, None


def _validar_texto_obligatorio(payload: dict, campo: str) -> tuple[str, JsonResponse | None]:
    valor = payload.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        return "", json_validacion(f"El campo '{campo}' es obligatorio y debe ser texto.")
    return valor, None
