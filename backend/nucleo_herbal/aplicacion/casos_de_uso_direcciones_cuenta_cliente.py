"""Casos de uso de libreta de direcciones de cuenta cliente."""

from __future__ import annotations

from dataclasses import dataclass

from .casos_de_uso import ErrorAplicacionLookup
from .dto import DireccionCuentaClienteDTO
from .puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from ..dominio.cuentas_cliente import ComandoDireccionCuentaCliente


@dataclass(slots=True)
class ListarDireccionesCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str) -> tuple[DireccionCuentaClienteDTO, ...]:
        _asegurar_cuenta(self.repositorio_cuentas_cliente, id_usuario)
        direcciones = self.repositorio_cuentas_cliente.listar_direcciones(id_usuario=id_usuario)
        return tuple(_a_direccion_dto(direccion) for direccion in direcciones)


@dataclass(slots=True)
class CrearDireccionCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str, comando: ComandoDireccionCuentaCliente) -> DireccionCuentaClienteDTO:
        _asegurar_cuenta(self.repositorio_cuentas_cliente, id_usuario)
        direccion = self.repositorio_cuentas_cliente.crear_direccion(id_usuario=id_usuario, comando=comando)
        return _a_direccion_dto(direccion)


@dataclass(slots=True)
class ActualizarDireccionCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str, id_direccion: str, comando: ComandoDireccionCuentaCliente) -> DireccionCuentaClienteDTO:
        _asegurar_cuenta(self.repositorio_cuentas_cliente, id_usuario)
        direccion = self.repositorio_cuentas_cliente.actualizar_direccion(
            id_usuario=id_usuario,
            id_direccion=id_direccion,
            comando=comando,
        )
        if direccion is None:
            raise ErrorAplicacionLookup(f"Dirección no encontrada para la cuenta cliente: {id_direccion}")
        return _a_direccion_dto(direccion)


@dataclass(slots=True)
class EliminarDireccionCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str, id_direccion: str) -> None:
        _asegurar_cuenta(self.repositorio_cuentas_cliente, id_usuario)
        if not self.repositorio_cuentas_cliente.eliminar_direccion(id_usuario=id_usuario, id_direccion=id_direccion):
            raise ErrorAplicacionLookup(f"Dirección no encontrada para la cuenta cliente: {id_direccion}")


@dataclass(slots=True)
class MarcarDireccionPredeterminadaCuentaCliente:
    repositorio_cuentas_cliente: RepositorioCuentasCliente

    def ejecutar(self, *, id_usuario: str, id_direccion: str) -> DireccionCuentaClienteDTO:
        _asegurar_cuenta(self.repositorio_cuentas_cliente, id_usuario)
        direccion = self.repositorio_cuentas_cliente.marcar_direccion_predeterminada(
            id_usuario=id_usuario,
            id_direccion=id_direccion,
        )
        if direccion is None:
            raise ErrorAplicacionLookup(f"Dirección no encontrada para la cuenta cliente: {id_direccion}")
        return _a_direccion_dto(direccion)


def _asegurar_cuenta(repo: RepositorioCuentasCliente, id_usuario: str) -> None:
    if repo.obtener_por_id_usuario(id_usuario) is None:
        raise ErrorAplicacionLookup(f"Cuenta cliente no encontrada para usuario: {id_usuario}")


def _a_direccion_dto(direccion) -> DireccionCuentaClienteDTO:
    return DireccionCuentaClienteDTO(
        id_direccion=direccion.id_direccion,
        alias=direccion.alias,
        nombre_destinatario=direccion.nombre_destinatario,
        telefono_contacto=direccion.telefono_contacto,
        linea_1=direccion.linea_1,
        linea_2=direccion.linea_2,
        codigo_postal=direccion.codigo_postal,
        ciudad=direccion.ciudad,
        provincia=direccion.provincia,
        pais_iso=direccion.pais_iso,
        predeterminada=direccion.predeterminada,
        fecha_creacion=direccion.fecha_creacion,
        fecha_actualizacion=direccion.fecha_actualizacion,
    )
