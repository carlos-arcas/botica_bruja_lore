from decimal import Decimal
import unittest

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_cuentas_demo import (
    AutenticarCuentaDemo,
    ErrorAutenticacionDemo,
    ObtenerHistorialPedidosDemoCuenta,
    ObtenerPerfilCuentaDemo,
    RegistrarCuentaDemo,
)
from backend.nucleo_herbal.aplicacion.puertos.proveedores_historial_pedidos_demo import (
    ProveedorHistorialPedidosDemo,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios_cuentas_demo import RepositorioCuentasDemo
from backend.nucleo_herbal.dominio.cuentas_demo import CuentaDemo, CredencialCuentaDemo, PerfilCuentaDemo
from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo


class TestCasosDeUsoCuentaDemo(unittest.TestCase):
    def test_registrar_cuenta_demo_valida(self) -> None:
        repositorio = RepositorioCuentasDemoMemoria()
        caso = RegistrarCuentaDemo(repositorio_cuentas_demo=repositorio)

        cuenta = caso.ejecutar(
            email="lore@test.dev",
            nombre_visible="Lore",
            clave_acceso_demo="clave-demo",
        )

        self.assertTrue(cuenta.id_usuario.startswith("USR-"))
        self.assertEqual(cuenta.nombre_visible, "Lore")

    def test_autenticacion_demo_valida(self) -> None:
        repositorio = _repositorio_con_cuenta()
        caso = AutenticarCuentaDemo(repositorio_cuentas_demo=repositorio)

        resultado = caso.ejecutar(email="lore@test.dev", clave_acceso_demo="clave-demo")

        self.assertEqual(resultado.cuenta.email, "lore@test.dev")

    def test_autenticacion_demo_invalida_por_clave(self) -> None:
        repositorio = _repositorio_con_cuenta()
        caso = AutenticarCuentaDemo(repositorio_cuentas_demo=repositorio)

        with self.assertRaises(ErrorAutenticacionDemo):
            caso.ejecutar(email="lore@test.dev", clave_acceso_demo="otro")

    def test_obtener_perfil_minimo(self) -> None:
        repositorio = _repositorio_con_cuenta()
        caso = ObtenerPerfilCuentaDemo(repositorio_cuentas_demo=repositorio)

        perfil = caso.ejecutar(id_usuario="USR-1")

        self.assertEqual(perfil.nombre_visible, "Lore")

    def test_obtener_historial_vacio(self) -> None:
        repositorio = _repositorio_con_cuenta()
        historial = ProveedorHistorialPedidosDemoMemoria(pedidos=())
        caso = ObtenerHistorialPedidosDemoCuenta(
            repositorio_cuentas_demo=repositorio,
            proveedor_historial_pedidos_demo=historial,
        )

        pedidos = caso.ejecutar(id_usuario="USR-1")

        self.assertEqual(pedidos, ())

    def test_obtener_historial_con_pedidos_asociados(self) -> None:
        repositorio = _repositorio_con_cuenta()
        historial = ProveedorHistorialPedidosDemoMemoria(
            pedidos=(
                _pedido(id_pedido="PD-1", canal="autenticado", id_usuario="USR-1", email="otro@test.dev"),
                _pedido(id_pedido="PD-2", canal="invitado", id_usuario=None, email="lore@test.dev"),
                _pedido(id_pedido="PD-3", canal="autenticado", id_usuario="USR-otro", email="x@test.dev"),
            )
        )
        caso = ObtenerHistorialPedidosDemoCuenta(
            repositorio_cuentas_demo=repositorio,
            proveedor_historial_pedidos_demo=historial,
        )

        pedidos = caso.ejecutar(id_usuario="USR-1")

        self.assertEqual(len(pedidos), 2)
        self.assertEqual({pedido.id_pedido for pedido in pedidos}, {"PD-1", "PD-2"})

    def test_historial_falla_si_no_existe_cuenta(self) -> None:
        caso = ObtenerHistorialPedidosDemoCuenta(
            repositorio_cuentas_demo=RepositorioCuentasDemoMemoria(),
            proveedor_historial_pedidos_demo=ProveedorHistorialPedidosDemoMemoria(pedidos=()),
        )

        with self.assertRaisesRegex(ErrorAplicacionLookup, "no encontrada"):
            caso.ejecutar(id_usuario="USR-falta")


class RepositorioCuentasDemoMemoria(RepositorioCuentasDemo):
    def __init__(self) -> None:
        self._cuentas_por_id: dict[str, CuentaDemo] = {}
        self._cuentas_por_email: dict[str, CuentaDemo] = {}

    def guardar(self, cuenta: CuentaDemo) -> CuentaDemo:
        self._cuentas_por_id[cuenta.id_usuario] = cuenta
        self._cuentas_por_email[cuenta.email.strip().lower()] = cuenta
        return cuenta

    def obtener_por_email(self, email: str) -> CuentaDemo | None:
        return self._cuentas_por_email.get(email.strip().lower())

    def obtener_por_id_usuario(self, id_usuario: str) -> CuentaDemo | None:
        return self._cuentas_por_id.get(id_usuario)


class ProveedorHistorialPedidosDemoMemoria(ProveedorHistorialPedidosDemo):
    def __init__(self, pedidos: tuple[PedidoDemo, ...]) -> None:
        self._pedidos = pedidos

    def listar_por_vinculo_cuenta(
        self,
        *,
        id_usuario: str,
        email_contacto: str,
    ) -> tuple[PedidoDemo, ...]:
        return tuple(
            pedido
            for pedido in self._pedidos
            if pedido.id_usuario == id_usuario or pedido.email_contacto == email_contacto
        )



def _repositorio_con_cuenta() -> RepositorioCuentasDemoMemoria:
    repo = RepositorioCuentasDemoMemoria()
    repo.guardar(
        CuentaDemo(
            id_usuario="USR-1",
            email="lore@test.dev",
            perfil=PerfilCuentaDemo(nombre_visible="Lore"),
            credencial=CredencialCuentaDemo(clave_acceso_demo="clave-demo"),
        )
    )
    return repo



def _pedido(id_pedido: str, canal: str, id_usuario: str | None, email: str) -> PedidoDemo:
    return PedidoDemo(
        id_pedido=id_pedido,
        email_contacto=email,
        canal_compra=canal,
        lineas=(
            LineaPedido(
                id_producto="prod-1",
                slug_producto="melisa-a-granel-50g",
                nombre_producto="Melisa",
                cantidad=1,
                precio_unitario_demo=Decimal("5.00"),
            ),
        ),
        id_usuario=id_usuario,
    )


if __name__ == "__main__":
    unittest.main()
