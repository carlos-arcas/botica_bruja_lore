"""Casos de uso de autenticación Google para cuenta cliente real."""

from __future__ import annotations

import secrets
from dataclasses import dataclass

from .casos_de_uso import ErrorAplicacionLookup
from .dto import CuentaClienteDTO, ResultadoAutenticacionGoogleCuentaClienteDTO
from .puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from .puertos.verificador_google_identity import VerificadorGoogleIdentity
from ..dominio.excepciones import ErrorDominio


@dataclass(slots=True)
class AutenticarCuentaClienteGoogle:
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    verificador_google_identity: VerificadorGoogleIdentity

    def ejecutar(self, *, credential: str) -> ResultadoAutenticacionGoogleCuentaClienteDTO:
        identidad = self.verificador_google_identity.verificar(credential=credential)
        if not identidad.email_verificado:
            raise ErrorDominio("Google no confirmó el email de esta cuenta.")

        cuenta = self.repositorio_cuentas_cliente.obtener_por_google_sub(identidad.google_sub)
        if cuenta is not None:
            return ResultadoAutenticacionGoogleCuentaClienteDTO(
                cuenta=_a_cuenta_cliente_dto(cuenta),
                es_nueva_cuenta=False,
            )

        cuenta_por_email = self.repositorio_cuentas_cliente.obtener_por_email(identidad.email)
        es_nueva_cuenta = cuenta_por_email is None
        if cuenta_por_email is None:
            cuenta_por_email = self.repositorio_cuentas_cliente.registrar(
                email=identidad.email,
                nombre_visible=_resolver_nombre_visible(identidad),
                password_plano=secrets.token_urlsafe(24),
            )

        cuenta_vinculada = self.repositorio_cuentas_cliente.vincular_google(
            id_usuario=cuenta_por_email.id_usuario,
            google_sub=identidad.google_sub,
            email_verificado=True,
        )
        if cuenta_vinculada is None:
            raise ErrorAplicacionLookup(
                f"No se pudo vincular la identidad Google a la cuenta: {cuenta_por_email.id_usuario}"
            )
        return ResultadoAutenticacionGoogleCuentaClienteDTO(
            cuenta=_a_cuenta_cliente_dto(cuenta_vinculada),
            es_nueva_cuenta=es_nueva_cuenta,
        )


def _resolver_nombre_visible(identidad) -> str:
    nombre = identidad.nombre_visible.strip()
    if nombre:
        return nombre
    return identidad.email.split("@", 1)[0]


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
