"""Views HTTP para autenticación y área de cuenta real."""

from __future__ import annotations

import json
from uuid import uuid4

from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ...aplicacion.casos_de_uso import ErrorAplicacionLookup
from ...aplicacion.casos_de_uso_cuentas_cliente import ErrorAutenticacionCliente, MENSAJE_GENERICO_RECUPERACION
from ...dominio.cuentas_cliente import ComandoDireccionCuentaCliente
from ...dominio.excepciones import ErrorDominio
from .cuentas_cliente_serializadores import (
    serializar_cuenta_cliente,
    serializar_estado_verificacion_email,
    serializar_pedidos_cuenta,
    serializar_recuperacion_password,
    serializar_sesion_cliente,
)
from .dependencias import construir_servicios_publicos_cuenta_cliente
from .direcciones_cuenta_cliente_serializadores import serializar_direccion_cuenta_cliente, serializar_direcciones_cuenta_cliente
from .logs_cuenta_cliente import log_evento_cuenta
from .respuestas_json import json_no_autorizado, json_no_encontrado, json_validacion

User = get_user_model()


@csrf_exempt
def registrar_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        log_evento_cuenta(evento="cuenta_real_registro", operation_id=operation_id, email=None, usuario_id=None, resultado="error", error=error.content.decode())
        return error
    email = _texto(payload, "email")
    try:
        cuenta = construir_servicios_publicos_cuenta_cliente().registrar_cuenta_cliente.ejecutar(
            email=email,
            nombre_visible=_texto(payload, "nombre_visible"),
            password_plano=_texto(payload, "password"),
            operation_id=operation_id,
        )
    except ErrorDominio as exc:
        log_evento_cuenta(evento="cuenta_real_registro", operation_id=operation_id, email=email, usuario_id=None, resultado="error", error=str(exc))
        return json_validacion(str(exc))
    login(request, User.objects.get(id=cuenta.id_usuario))
    log_evento_cuenta(evento="cuenta_real_registro", operation_id=operation_id, email=cuenta.email, usuario_id=cuenta.id_usuario, resultado="ok")
    return JsonResponse({"cuenta": serializar_cuenta_cliente(cuenta)}, status=201)


@csrf_exempt
def login_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        log_evento_cuenta(evento="cuenta_real_login", operation_id=operation_id, email=None, usuario_id=None, resultado="error", error=error.content.decode())
        return error
    email = _texto(payload, "email")
    try:
        cuenta = construir_servicios_publicos_cuenta_cliente().autenticar_cuenta_cliente.ejecutar(
            email=email,
            password_plano=_texto(payload, "password"),
        )
    except (ErrorAutenticacionCliente, ErrorDominio) as exc:
        log_evento_cuenta(evento="cuenta_real_login", operation_id=operation_id, email=email, usuario_id=None, resultado="credenciales_invalidas", error=str(exc))
        return json_no_autorizado("Credenciales inválidas.")
    login(request, User.objects.get(id=cuenta.id_usuario))
    log_evento_cuenta(evento="cuenta_real_login", operation_id=operation_id, email=cuenta.email, usuario_id=cuenta.id_usuario, resultado="ok")
    return JsonResponse({"cuenta": serializar_cuenta_cliente(cuenta)})


@csrf_exempt
def google_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        log_evento_cuenta(evento="cuenta_real_google", operation_id=operation_id, email=None, usuario_id=None, resultado="error", error=error.content.decode())
        return error
    try:
        resultado = construir_servicios_publicos_cuenta_cliente().autenticar_google_cuenta_cliente.ejecutar(
            credential=_texto(payload, "credential"),
        )
    except ErrorDominio as exc:
        log_evento_cuenta(evento="cuenta_real_google", operation_id=operation_id, email=None, usuario_id=None, resultado="error", error=str(exc))
        return json_validacion(str(exc))
    login(request, User.objects.get(id=resultado.cuenta.id_usuario))
    log_evento_cuenta(
        evento="cuenta_real_google",
        operation_id=operation_id,
        email=resultado.cuenta.email,
        usuario_id=resultado.cuenta.id_usuario,
        resultado="ok_nueva" if resultado.es_nueva_cuenta else "ok_existente",
    )
    return JsonResponse(
        {
            "cuenta": serializar_cuenta_cliente(resultado.cuenta),
            "es_nueva_cuenta": resultado.es_nueva_cuenta,
        }
    )


@csrf_exempt
def logout_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    usuario = request.user if request.user.is_authenticated else None
    logout(request)
    log_evento_cuenta(evento="cuenta_real_logout", operation_id=operation_id, email=getattr(usuario, "email", None), usuario_id=str(usuario.id) if usuario else None, resultado="ok")
    return JsonResponse({"logout": True})


def sesion_actual_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    operation_id = _operation_id(request)
    if not request.user.is_authenticated:
        log_evento_cuenta(evento="cuenta_real_sesion", operation_id=operation_id, email=None, usuario_id=None, resultado="anonimo")
        return JsonResponse(serializar_sesion_cliente(type("Sesion", (), {"autenticado": False, "cuenta": None})()))
    try:
        sesion = construir_servicios_publicos_cuenta_cliente().obtener_sesion_cuenta_cliente.ejecutar(id_usuario=str(request.user.id))
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_sesion", operation_id=operation_id, email=request.user.email, usuario_id=str(request.user.id), resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_sesion", operation_id=operation_id, email=request.user.email, usuario_id=str(request.user.id), resultado="ok")
    return JsonResponse(serializar_sesion_cliente(sesion))


@csrf_exempt
def solicitar_recuperacion_password(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        return error
    email = _texto(payload, "email")
    try:
        resultado = construir_servicios_publicos_cuenta_cliente().solicitar_recuperacion_password.ejecutar(
            email=email,
            operation_id=operation_id,
        )
    except ErrorDominio as exc:
        log_evento_cuenta(evento="cuenta_real_password_recovery_solicitud", operation_id=operation_id, email=email, usuario_id=None, resultado="error", error=str(exc))
        return json_validacion(str(exc))
    log_evento_cuenta(evento="cuenta_real_password_recovery_solicitud", operation_id=operation_id, email=email, usuario_id=None, resultado="ok_generico")
    return JsonResponse({"recuperacion": serializar_recuperacion_password(resultado), "detalle": MENSAJE_GENERICO_RECUPERACION})


@csrf_exempt
def confirmar_recuperacion_password(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        return error
    try:
        cuenta = construir_servicios_publicos_cuenta_cliente().confirmar_recuperacion_password.ejecutar(
            token=_texto(payload, "token"),
            password_nuevo=_texto(payload, "password"),
        )
    except ErrorDominio as exc:
        resultado = _resultado_recuperacion(str(exc))
        log_evento_cuenta(evento="cuenta_real_password_recovery_confirmacion", operation_id=operation_id, email=None, usuario_id=None, resultado=resultado, error=str(exc))
        return json_validacion(str(exc), codigo=resultado)
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_password_recovery_confirmacion", operation_id=operation_id, email=None, usuario_id=None, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_password_recovery_confirmacion", operation_id=operation_id, email=cuenta.email, usuario_id=cuenta.id_usuario, resultado="ok")
    return JsonResponse({"cuenta": serializar_cuenta_cliente(cuenta)})


@csrf_exempt
def confirmar_verificacion_email(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        return error
    token = _texto(payload, "token")
    try:
        cuenta = construir_servicios_publicos_cuenta_cliente().confirmar_verificacion_email.ejecutar(token=token)
    except ErrorDominio as exc:
        resultado = "token_expirado" if "expirado" in str(exc).lower() else "token_invalido"
        log_evento_cuenta(evento="cuenta_real_confirmar_email", operation_id=operation_id, email=None, usuario_id=None, resultado=resultado, error=str(exc))
        return json_validacion(str(exc), codigo=resultado)
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_confirmar_email", operation_id=operation_id, email=None, usuario_id=None, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_confirmar_email", operation_id=operation_id, email=cuenta.email, usuario_id=cuenta.id_usuario, resultado="ok")
    return JsonResponse({"cuenta": serializar_cuenta_cliente(cuenta)})


@csrf_exempt
def reenviar_verificacion_email(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    payload, error = _leer_payload_json(request)
    if error is not None:
        return error
    email = _texto(payload, "email")
    try:
        resultado = construir_servicios_publicos_cuenta_cliente().reenviar_verificacion_email.ejecutar(
            email=email,
            operation_id=operation_id,
        )
    except ErrorDominio as exc:
        log_evento_cuenta(evento="cuenta_real_reenviar_email", operation_id=operation_id, email=email, usuario_id=None, resultado="cuenta_ya_verificada", error=str(exc))
        return json_validacion(str(exc))
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_reenviar_email", operation_id=operation_id, email=email, usuario_id=None, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_reenviar_email", operation_id=operation_id, email=resultado.email, usuario_id=None, resultado="ok")
    return JsonResponse({"verificacion": serializar_estado_verificacion_email(resultado)})


def pedidos_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    usuario_id, error = _usuario_autenticado(request)
    if error is not None:
        return error
    operation_id = _operation_id(request)
    try:
        pedidos = construir_servicios_publicos_cuenta_cliente().listar_pedidos_cuenta_cliente.ejecutar(id_usuario=usuario_id)
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_pedidos", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_pedidos", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
    return JsonResponse({"pedidos": serializar_pedidos_cuenta(pedidos)})


def detalle_pedido_cuenta_cliente(request: HttpRequest, id_pedido: str) -> JsonResponse:
    usuario_id, error = _usuario_autenticado(request)
    if error is not None:
        return error
    operation_id = _operation_id(request)
    try:
        pedido = construir_servicios_publicos_cuenta_cliente().obtener_pedido_cuenta_cliente.ejecutar(id_usuario=usuario_id, id_pedido=id_pedido)
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_detalle_pedido", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_detalle_pedido", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
    return JsonResponse({"pedido": serializar_pedidos_cuenta((pedido,))[0]})


def estado_verificacion_email(request: HttpRequest) -> JsonResponse:
    usuario_id, error = _usuario_autenticado(request)
    if error is not None:
        return error
    resultado = construir_servicios_publicos_cuenta_cliente().consultar_estado_verificacion_email.ejecutar(id_usuario=usuario_id)
    return JsonResponse({"verificacion": serializar_estado_verificacion_email(resultado)})


def _resultado_recuperacion(error: str) -> str:
    error_normalizado = error.lower()
    if "expirado" in error_normalizado:
        return "token_expirado"
    if "utilizado" in error_normalizado:
        return "token_usado"
    if "válido" in error_normalizado:
        return "token_invalido"
    return "password_invalida"


def _usuario_autenticado(request: HttpRequest) -> tuple[str, JsonResponse | None]:
    if isinstance(request.user, AnonymousUser) or not request.user.is_authenticated:
        return "", json_no_autorizado("Debes iniciar sesión con una cuenta real.")
    return str(request.user.id), None


def _operation_id(request: HttpRequest) -> str:
    return request.headers.get("X-Operation-Id", "").strip() or str(uuid4())


def _leer_payload_json(request: HttpRequest) -> tuple[dict, JsonResponse | None]:
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}, json_validacion("JSON inválido.")
    if not isinstance(payload, dict):
        return {}, json_validacion("El payload debe ser un objeto JSON.")
    return payload, None


def _texto(payload: dict, campo: str) -> str:
    valor = payload.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        raise ErrorDominio(f"El campo '{campo}' es obligatorio y debe ser texto.")
    return valor.strip()


def direcciones_cuenta_cliente(request: HttpRequest) -> JsonResponse:
    usuario_id, error = _usuario_autenticado(request)
    if error is not None:
        return error
    operation_id = _operation_id(request)
    servicios = construir_servicios_publicos_cuenta_cliente()
    if request.method == "GET":
        try:
            direcciones = servicios.listar_direcciones_cuenta_cliente.ejecutar(id_usuario=usuario_id)
        except ErrorAplicacionLookup as exc:
            log_evento_cuenta(evento="cuenta_real_direcciones_listar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
            return json_no_encontrado(str(exc))
        log_evento_cuenta(evento="cuenta_real_direcciones_listar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
        return JsonResponse({"direcciones": serializar_direcciones_cuenta_cliente(direcciones)})
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    payload, error = _leer_payload_json(request)
    if error is not None:
        return error
    try:
        direccion = servicios.crear_direccion_cuenta_cliente.ejecutar(
            id_usuario=usuario_id,
            comando=_construir_comando_direccion(payload),
        )
    except ErrorDominio as exc:
        log_evento_cuenta(evento="cuenta_real_direccion_crear", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
        return json_validacion(str(exc))
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_direccion_crear", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_direccion_crear", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
    return JsonResponse({"direccion": serializar_direccion_cuenta_cliente(direccion)}, status=201)


@csrf_exempt
def detalle_direccion_cuenta_cliente(request: HttpRequest, id_direccion: str) -> JsonResponse:
    usuario_id, error = _usuario_autenticado(request)
    if error is not None:
        return error
    operation_id = _operation_id(request)
    servicios = construir_servicios_publicos_cuenta_cliente()
    if request.method == "PUT":
        payload, error = _leer_payload_json(request)
        if error is not None:
            return error
        try:
            direccion = servicios.actualizar_direccion_cuenta_cliente.ejecutar(
                id_usuario=usuario_id,
                id_direccion=id_direccion,
                comando=_construir_comando_direccion(payload),
            )
        except ErrorDominio as exc:
            log_evento_cuenta(evento="cuenta_real_direccion_actualizar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
            return json_validacion(str(exc))
        except ErrorAplicacionLookup as exc:
            log_evento_cuenta(evento="cuenta_real_direccion_actualizar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
            return json_no_encontrado(str(exc))
        log_evento_cuenta(evento="cuenta_real_direccion_actualizar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
        return JsonResponse({"direccion": serializar_direccion_cuenta_cliente(direccion)})
    if request.method == "DELETE":
        try:
            servicios.eliminar_direccion_cuenta_cliente.ejecutar(id_usuario=usuario_id, id_direccion=id_direccion)
        except ErrorAplicacionLookup as exc:
            log_evento_cuenta(evento="cuenta_real_direccion_eliminar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
            return json_no_encontrado(str(exc))
        log_evento_cuenta(evento="cuenta_real_direccion_eliminar", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
        return JsonResponse({"eliminada": True})
    return JsonResponse({"detalle": "Método no permitido."}, status=405)


@csrf_exempt
def marcar_direccion_predeterminada_cuenta_cliente(request: HttpRequest, id_direccion: str) -> JsonResponse:
    usuario_id, error = _usuario_autenticado(request)
    if error is not None:
        return error
    if request.method != "POST":
        return JsonResponse({"detalle": "Método no permitido."}, status=405)
    operation_id = _operation_id(request)
    try:
        direccion = construir_servicios_publicos_cuenta_cliente().marcar_direccion_predeterminada_cuenta_cliente.ejecutar(
            id_usuario=usuario_id,
            id_direccion=id_direccion,
        )
    except ErrorAplicacionLookup as exc:
        log_evento_cuenta(evento="cuenta_real_direccion_predeterminada", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="error", error=str(exc))
        return json_no_encontrado(str(exc))
    log_evento_cuenta(evento="cuenta_real_direccion_predeterminada", operation_id=operation_id, email=request.user.email, usuario_id=usuario_id, resultado="ok")
    return JsonResponse({"direccion": serializar_direccion_cuenta_cliente(direccion)})


def _construir_comando_direccion(payload: dict) -> ComandoDireccionCuentaCliente:
    return ComandoDireccionCuentaCliente(
        alias=_texto_opcional(payload, "alias") or "",
        nombre_destinatario=_texto(payload, "nombre_destinatario"),
        telefono_contacto=_texto(payload, "telefono_contacto"),
        linea_1=_texto(payload, "linea_1"),
        linea_2=_texto_opcional(payload, "linea_2") or "",
        codigo_postal=_texto(payload, "codigo_postal"),
        ciudad=_texto(payload, "ciudad"),
        provincia=_texto(payload, "provincia"),
        pais_iso=_texto_opcional(payload, "pais_iso") or "ES",
    )


def _texto_opcional(payload: dict, campo: str) -> str | None:
    valor = payload.get(campo)
    if valor is None:
        return None
    if not isinstance(valor, str):
        raise ErrorDominio(f"El campo '{campo}' debe ser texto.")
    return valor.strip() or None
