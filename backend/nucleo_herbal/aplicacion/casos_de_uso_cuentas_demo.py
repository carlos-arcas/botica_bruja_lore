"""Casos de uso mínimos de cuenta demo con valor (ciclo 4 / prompt 1)."""

from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from ..dominio.cuentas_demo import CuentaDemo, CredencialCuentaDemo, PerfilCuentaDemo
from .casos_de_uso import ErrorAplicacionLookup
from .dto import CuentaDemoDTO, PedidoDemoDTO, PerfilCuentaDemoDTO, ResultadoAutenticacionDemoDTO
from .puertos.proveedores_historial_pedidos_demo import ProveedorHistorialPedidosDemo
from .puertos.repositorios_cuentas_demo import RepositorioCuentasDemo


class ErrorAutenticacionDemo(ValueError):
    """Error de autenticación demo para credencial inválida."""


@dataclass(slots=True)
class RegistrarCuentaDemo:
    repositorio_cuentas_demo: RepositorioCuentasDemo

    def ejecutar(self, *, email: str, nombre_visible: str, clave_acceso_demo: str) -> CuentaDemoDTO:
        cuenta = CuentaDemo(
            id_usuario=_generar_id_usuario_demo(),
            email=email,
            perfil=PerfilCuentaDemo(nombre_visible=nombre_visible),
            credencial=CredencialCuentaDemo(clave_acceso_demo=clave_acceso_demo),
        )
        cuenta_persistida = self.repositorio_cuentas_demo.guardar(cuenta)
        return _a_cuenta_demo_dto(cuenta_persistida)


@dataclass(slots=True)
class AutenticarCuentaDemo:
    repositorio_cuentas_demo: RepositorioCuentasDemo

    def ejecutar(self, *, email: str, clave_acceso_demo: str) -> ResultadoAutenticacionDemoDTO:
        cuenta = self.repositorio_cuentas_demo.obtener_por_email(email)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta demo no encontrada para email: {email}")
        if not cuenta.validar_credencial_demo(clave_acceso_demo):
            raise ErrorAutenticacionDemo("Credencial demo inválida.")
        return ResultadoAutenticacionDemoDTO(cuenta=_a_cuenta_demo_dto(cuenta))


@dataclass(slots=True)
class ObtenerPerfilCuentaDemo:
    repositorio_cuentas_demo: RepositorioCuentasDemo

    def ejecutar(self, *, id_usuario: str) -> PerfilCuentaDemoDTO:
        cuenta = self.repositorio_cuentas_demo.obtener_por_id_usuario(id_usuario)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta demo no encontrada para usuario: {id_usuario}")
        return PerfilCuentaDemoDTO(
            id_usuario=cuenta.id_usuario,
            email=cuenta.email,
            nombre_visible=cuenta.perfil.nombre_visible,
        )


@dataclass(slots=True)
class ObtenerHistorialPedidosDemoCuenta:
    repositorio_cuentas_demo: RepositorioCuentasDemo
    proveedor_historial_pedidos_demo: ProveedorHistorialPedidosDemo

    def ejecutar(self, *, id_usuario: str) -> tuple[PedidoDemoDTO, ...]:
        cuenta = self.repositorio_cuentas_demo.obtener_por_id_usuario(id_usuario)
        if cuenta is None:
            raise ErrorAplicacionLookup(f"Cuenta demo no encontrada para usuario: {id_usuario}")
        pedidos = self.proveedor_historial_pedidos_demo.listar_por_vinculo_cuenta(
            id_usuario=cuenta.id_usuario,
            email_contacto=cuenta.email,
        )
        return tuple(_a_pedido_demo_dto(pedido) for pedido in pedidos)



def _a_cuenta_demo_dto(cuenta: CuentaDemo) -> CuentaDemoDTO:
    return CuentaDemoDTO(
        id_usuario=cuenta.id_usuario,
        email=cuenta.email,
        nombre_visible=cuenta.perfil.nombre_visible,
    )



def _a_pedido_demo_dto(pedido) -> PedidoDemoDTO:
    return PedidoDemoDTO(
        id_pedido=pedido.id_pedido,
        estado=pedido.estado,
        canal_compra=pedido.canal_compra,
        email_contacto=pedido.email_contacto,
        subtotal_demo=pedido.subtotal_demo,
        lineas=tuple(
            _a_linea_dto(linea)
            for linea in pedido.lineas
        ),
    )



def _a_linea_dto(linea):
    from .dto import LineaPedidoDTO

    return LineaPedidoDTO(
        id_producto=linea.id_producto,
        slug_producto=linea.slug_producto,
        nombre_producto=linea.nombre_producto,
        cantidad=linea.cantidad,
        precio_unitario_demo=linea.precio_unitario_demo,
        subtotal_demo=linea.subtotal_demo,
    )



def _generar_id_usuario_demo() -> str:
    return f"USR-{uuid4().hex[:10]}"
