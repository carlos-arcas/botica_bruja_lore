"""Casos de uso de autenticación y área de cuenta real."""

from __future__ import annotations

import hashlib
import logging
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from .casos_de_uso import ErrorAplicacionLookup
from .casos_de_uso_pedidos import _a_dto as a_pedido_real_dto
from .dto import CuentaClienteDTO, ResultadoSesionClienteDTO, VerificacionEmailCuentaDTO
from .dto_pedidos import PedidoRealDTO
from .puertos.notificador_verificacion_email import NotificadorVerificacionEmail
from .puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from .puertos.repositorios_pedidos import RepositorioPedidos
from ..dominio.cuentas_cliente import CredencialesCuentaCliente
from ..dominio.excepciones import ErrorDominio

logger = logging.getLogger(__name__)
HORAS_EXPIRACION_VERIFICACION_EMAIL = 24


class ErrorAutenticacionCliente(ValueError):
    """Error de credenciales de cuenta real."""


@dataclass(slots=True)
class RegistrarCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    notificador_verificacion_email: NotificadorVerificacionEmail

    def ejecutar(
        self,
        *,
        email: str,
        nombre_visible: str,
        password_plano: str,
        operation_id: str,
    ) -> CuentaClienteDTO:
        cuenta = self.repositorio_cuentas_cliente.registrar(
            email=email,
            nombre_visible=nombre_visible,
            password_plano=password_plano,
        )
        GenerarSolicitudVerificacionEmail(
            repositorio_cuentas_cliente=self.repositorio_cuentas_cliente,
            notificador_verificacion_email=self.notificador_verificacion_email,
        ).ejecutar(id_usuario=cuenta.id_usuario, operation_id=operation_id)
        return _a_cuenta_cliente_dto(cuenta)


@dataclass(slots=True)
class AutenticarCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, email: str, password_plano: str) -> CuentaClienteDTO:
        cuenta = self.repositorio_cuentas_cliente.autenticar(
            CredencialesCuentaCliente(email=email, password_plano=password_plano)
        )
        if cuenta is None:
            raise ErrorAutenticacionCliente("Credenciales inválidas.")
        return _a_cuenta_cliente_dto(cuenta)


@dataclass(slots=True)
class ObtenerSesionCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str) -> ResultadoSesionClienteDTO:
        cuenta = self.repositorio_cuentas_cliente.obtener_por_id_usuario(id_usuario)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para usuario: {id_usuario}")
        return ResultadoSesionClienteDTO(autenticado=True, cuenta=_a_cuenta_cliente_dto(cuenta))


@dataclass(slots=True)
class ListarPedidosCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, *, id_usuario: str) -> tuple[PedidoRealDTO, ...]:
        self._asegurar_cuenta(id_usuario)
        pedidos = self.repositorio_pedidos.listar_por_id_usuario(id_usuario)
        return tuple(a_pedido_real_dto(pedido) for pedido in pedidos)

    def _asegurar_cuenta(self, id_usuario: str) -> None:
        if self.repositorio_cuentas_cliente.obtener_por_id_usuario(id_usuario) is None:
            raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para usuario: {id_usuario}")


@dataclass(slots=True)
class ObtenerPedidoCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, *, id_usuario: str, id_pedido: str) -> PedidoRealDTO:
        if self.repositorio_cuentas_cliente.obtener_por_id_usuario(id_usuario) is None:
            raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para usuario: {id_usuario}")
        pedido = self.repositorio_pedidos.obtener_por_id_y_usuario(id_pedido=id_pedido, id_usuario=id_usuario)
        if pedido is None:
            raise ErrorAplicacionLookup(f"Pedido real no encontrado para cuenta cliente: {id_pedido}")
        return a_pedido_real_dto(pedido)


@dataclass(slots=True)
class GenerarSolicitudVerificacionEmail:
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    notificador_verificacion_email: NotificadorVerificacionEmail

    def ejecutar(self, *, id_usuario: str, operation_id: str) -> VerificacionEmailCuentaDTO:
        cuenta = self.repositorio_cuentas_cliente.obtener_por_id_usuario(id_usuario)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para usuario: {id_usuario}")
        if cuenta.email_verificado:
            raise ErrorDominio("La cuenta ya tiene el email verificado.")
        token_plano = secrets.token_urlsafe(32)
        expira_en = datetime.now(timezone.utc) + timedelta(hours=HORAS_EXPIRACION_VERIFICACION_EMAIL)
        self.repositorio_cuentas_cliente.crear_solicitud_verificacion(
            id_usuario=id_usuario,
            token_hash=_hash_token(token_plano),
            expira_en=expira_en,
        )
        self.notificador_verificacion_email.enviar_verificacion(
            cuenta=cuenta,
            token_plano=token_plano,
            expira_en=expira_en,
            operation_id=operation_id,
        )
        logger.info(
            "cuenta_real_verificacion_email_generada",
            extra={"operation_id": operation_id, "usuario_id": id_usuario, "email": cuenta.email},
        )
        return VerificacionEmailCuentaDTO(
            email=cuenta.email,
            email_verificado=False,
            expira_en=expira_en,
            reenviada=True,
        )


@dataclass(slots=True)
class ConfirmarVerificacionEmail:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, token: str) -> CuentaClienteDTO:
        token_hash = _hash_token(token)
        solicitud = self.repositorio_cuentas_cliente.obtener_solicitud_por_token_hash(token_hash)
        if solicitud is None:
            raise ErrorDominio("El token de verificación no es válido.")
        if solicitud.fecha_confirmacion is not None:
            cuenta = self.repositorio_cuentas_cliente.obtener_por_id_usuario(solicitud.id_usuario)
            if cuenta is None:
                raise ErrorAplicacionLookup(
                    f"Cuenta cliente no encontrada para usuario: {solicitud.id_usuario}"
                )
            return _a_cuenta_cliente_dto(cuenta)
        if solicitud.expira_en <= datetime.now(timezone.utc):
            raise ErrorDominio("El token de verificación ha expirado.")
        cuenta = self.repositorio_cuentas_cliente.marcar_email_verificado(
            id_usuario=solicitud.id_usuario,
            token_hash=token_hash,
        )
        if cuenta is None:
            raise ErrorAplicacionLookup(
                f"Cuenta cliente no encontrada para usuario: {solicitud.id_usuario}"
            )
        return _a_cuenta_cliente_dto(cuenta)


@dataclass(slots=True)
class ReenviarVerificacionEmail:
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    notificador_verificacion_email: NotificadorVerificacionEmail

    def ejecutar(self, *, email: str, operation_id: str) -> VerificacionEmailCuentaDTO:
        cuenta = self.repositorio_cuentas_cliente.obtener_por_email(email)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para email: {email}")
        if cuenta.email_verificado:
            raise ErrorDominio("La cuenta ya tiene el email verificado.")
        return GenerarSolicitudVerificacionEmail(
            repositorio_cuentas_cliente=self.repositorio_cuentas_cliente,
            notificador_verificacion_email=self.notificador_verificacion_email,
        ).ejecutar(id_usuario=cuenta.id_usuario, operation_id=operation_id)


@dataclass(slots=True)
class ConsultarEstadoVerificacionEmail:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str) -> VerificacionEmailCuentaDTO:
        cuenta = self.repositorio_cuentas_cliente.obtener_por_id_usuario(id_usuario)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para usuario: {id_usuario}")
        solicitud = self.repositorio_cuentas_cliente.obtener_solicitud_activa_por_usuario(id_usuario)
        expira_en = None if solicitud is None else solicitud.expira_en
        return VerificacionEmailCuentaDTO(
            email=cuenta.email,
            email_verificado=cuenta.email_verificado,
            expira_en=expira_en,
            reenviada=False,
        )


def _hash_token(token: str) -> str:
    token_normalizado = token.strip()
    if not token_normalizado:
        raise ErrorDominio("El token de verificación es obligatorio.")
    return hashlib.sha256(token_normalizado.encode("utf-8")).hexdigest()


def _a_cuenta_cliente_dto(cuenta) -> CuentaClienteDTO:
    return CuentaClienteDTO(
        id_usuario=cuenta.id_usuario,
        email=cuenta.email,
        nombre_visible=cuenta.nombre_visible,
        activo=cuenta.activo,
        email_verificado=cuenta.email_verificado,
        fecha_creacion=cuenta.fecha_creacion,
        fecha_actualizacion=cuenta.fecha_actualizacion,
    )
