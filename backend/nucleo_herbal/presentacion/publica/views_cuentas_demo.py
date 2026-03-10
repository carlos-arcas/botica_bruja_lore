"""Views HTTP mínimas para API de cuenta demo del Ciclo 4."""

from __future__ import annotations

import json

from django.http import HttpRequest, JsonResponse

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_cuentas_demo import ErrorAutenticacionDemo
from ...dominio.excepciones import ErrorDominio
from .cuentas_demo_serializadores import (
    serializar_cuenta_demo,
    serializar_historial_pedidos_demo,
    serializar_perfil_cuenta_demo,
)
from .dependencias import construir_servicios_publicos_cuenta_demo


def registrar_cuenta_demo(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)

    payload, error = _leer_payload(request)
    if error is not None:
        return error

    email, error_email = _leer_texto(payload, "email")
    if error_email is not None:
        return error_email
    nombre_visible, error_nombre = _leer_texto(payload, "nombre_visible")
    if error_nombre is not None:
        return error_nombre
    clave_acceso_demo, error_clave = _leer_texto(payload, "clave_acceso_demo")
    if error_clave is not None:
        return error_clave

    try:
        servicios = construir_servicios_publicos_cuenta_demo()
        cuenta = servicios.registrar_cuenta_demo.ejecutar(
            email=email,
            nombre_visible=nombre_visible,
            clave_acceso_demo=clave_acceso_demo,
        )
    except ErrorDominio as error_dominio:
        return JsonResponse({"detalle": str(error_dominio)}, status=400)

    return JsonResponse({"cuenta": serializar_cuenta_demo(cuenta)}, status=201)


def autenticar_cuenta_demo(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)

    payload, error = _leer_payload(request)
    if error is not None:
        return error

    email, error_email = _leer_texto(payload, "email")
    if error_email is not None:
        return error_email
    clave_acceso_demo, error_clave = _leer_texto(payload, "clave_acceso_demo")
    if error_clave is not None:
        return error_clave

    try:
        servicios = construir_servicios_publicos_cuenta_demo()
        resultado = servicios.autenticar_cuenta_demo.ejecutar(
            email=email,
            clave_acceso_demo=clave_acceso_demo,
        )
    except ErrorAplicacionLookup as error_lookup:
        return JsonResponse({"detalle": str(error_lookup)}, status=404)
    except ErrorAutenticacionDemo as error_auth:
        return JsonResponse({"detalle": str(error_auth)}, status=401)

    return JsonResponse({"cuenta": serializar_cuenta_demo(resultado.cuenta)})


def perfil_cuenta_demo(_request: HttpRequest, id_usuario: str) -> JsonResponse:
    servicios = construir_servicios_publicos_cuenta_demo()
    try:
        perfil = servicios.obtener_perfil_cuenta_demo.ejecutar(id_usuario=id_usuario)
    except ErrorAplicacionLookup as error_lookup:
        return JsonResponse({"detalle": str(error_lookup)}, status=404)
    return JsonResponse({"perfil": serializar_perfil_cuenta_demo(perfil)})


def historial_cuenta_demo(_request: HttpRequest, id_usuario: str) -> JsonResponse:
    servicios = construir_servicios_publicos_cuenta_demo()
    try:
        pedidos = servicios.obtener_historial_cuenta_demo.ejecutar(id_usuario=id_usuario)
    except ErrorAplicacionLookup as error_lookup:
        return JsonResponse({"detalle": str(error_lookup)}, status=404)
    return JsonResponse({"pedidos": serializar_historial_pedidos_demo(pedidos)})


def _leer_payload(request: HttpRequest) -> tuple[dict, JsonResponse | None]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}, JsonResponse({"detalle": "JSON inválido."}, status=400)
    if not isinstance(payload, dict):
        return {}, JsonResponse({"detalle": "El payload debe ser un objeto JSON."}, status=400)
    return payload, None


def _leer_texto(payload: dict, campo: str) -> tuple[str, JsonResponse | None]:
    valor = payload.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        return "", JsonResponse({"detalle": f"El campo '{campo}' es obligatorio."}, status=400)
    return valor, None
