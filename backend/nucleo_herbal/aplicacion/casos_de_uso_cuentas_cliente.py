"""Casos de uso de autenticación y área de cuenta real."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from .casos_de_uso import ErrorAplicacionLookup
from .dto import CuentaClienteDTO, ResultadoSesionClienteDTO
from .dto_pedidos import PedidoRealDTO
from .puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from .puertos.repositorios_pedidos import RepositorioPedidos
from ..dominio.cuentas_cliente import CredencialesCuentaCliente
from .casos_de_uso_pedidos import _a_dto as a_pedido_real_dto

logger = logging.getLogger(__name__)


class ErrorAutenticacionCliente(ValueError):
    """Error de credenciales de cuenta real."""


@dataclass(slots=True)
class RegistrarCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, email: str, nombre_visible: str, password_plano: str) -> CuentaClienteDTO:
        cuenta = self.repositorio_cuentas_cliente.registrar(
            email=email,
            nombre_visible=nombre_visible,
            password_plano=password_plano,
        )
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
