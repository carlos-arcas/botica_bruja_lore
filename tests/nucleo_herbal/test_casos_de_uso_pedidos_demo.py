from decimal import Decimal
import unittest

from backend.nucleo_herbal.aplicacion.casos_de_uso_email_demo import (
    ComponerEmailDemoPedido,
    ObtenerEmailDemoPedidoPorId,
)
from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_pedidos_demo import (
    CrearPedidoDemoDesdeLineas,
    RecalcularResumenPedidoDemo,
    RegistrarPedidoDemo,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios_pedidos_demo import (
    RepositorioPedidosDemo,
)
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo


class TestCasosDeUsoPedidosDemo(unittest.TestCase):
    def test_crear_pedido_demo_desde_lineas_es_valido(self) -> None:
        caso = CrearPedidoDemoDesdeLineas()

        pedido = caso.ejecutar(
            lineas=(_linea("prod-1", "melisa", 2, "5.00"),),
            email_contacto="demo@lore.test",
            canal_compra="invitado",
        )

        self.assertTrue(pedido.id_pedido.startswith("PD-"))
        self.assertEqual(pedido.estado, "creado")
        self.assertEqual(pedido.subtotal_demo, Decimal("10.00"))

    def test_crear_pedido_demo_normaliza_lineas_repetidas(self) -> None:
        caso = CrearPedidoDemoDesdeLineas()

        pedido = caso.ejecutar(
            lineas=(
                _linea("prod-1", "melisa", 1, "5.00"),
                _linea("prod-1", "melisa", 2, "5.00"),
            ),
            email_contacto="demo@lore.test",
            canal_compra="invitado",
        )

        self.assertEqual(len(pedido.lineas), 1)
        self.assertEqual(pedido.lineas[0].cantidad, 3)

    def test_crear_pedido_demo_con_cantidad_invalida_lanza_error(self) -> None:
        caso = CrearPedidoDemoDesdeLineas()

        with self.assertRaises(ErrorDominio):
            caso.ejecutar(
                lineas=(_linea("prod-1", "melisa", 0, "5.00"),),
                email_contacto="demo@lore.test",
                canal_compra="invitado",
            )

    def test_registrar_pedido_demo_persiste_en_repositorio(self) -> None:
        repositorio = RepositorioPedidosDemoMemoria()
        caso = RegistrarPedidoDemo(repositorio_pedidos_demo=repositorio)

        pedido = caso.ejecutar(
            lineas=(
                _linea("prod-1", "melisa", 2, "5.00"),
                _linea("prod-2", "lavanda", 1, "7.00"),
            ),
            email_contacto="demo@lore.test",
            canal_compra="autenticado",
            id_usuario="usr-1",
        )

        self.assertEqual(len(repositorio.pedidos), 1)
        self.assertEqual(pedido.subtotal_demo, Decimal("17.00"))
        self.assertEqual(pedido.canal_compra, "autenticado")


    def test_componer_email_demo_desde_pedido(self) -> None:
        pedido = PedidoDemo(
            id_pedido="PD-EMAIL",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            lineas=(_linea("prod-1", "melisa", 1, "5.00"),),
        )

        email_demo = ComponerEmailDemoPedido().ejecutar(pedido)

        self.assertIn("PD-EMAIL", email_demo.asunto)
        self.assertIn("entorno demo", email_demo.cuerpo_texto.lower())

    def test_obtener_email_demo_por_id_inexistente(self) -> None:
        repositorio = RepositorioPedidosDemoMemoria()
        caso = ObtenerEmailDemoPedidoPorId(
            repositorio_pedidos_demo=repositorio,
            componer_email_demo=ComponerEmailDemoPedido(),
        )

        with self.assertRaisesRegex(ErrorAplicacionLookup, "no encontrado"):
            caso.ejecutar("PD-no-existe")

    def test_recalcular_resumen_pedido_demo(self) -> None:
        pedido = PedidoDemo(
            id_pedido="PD-001",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            lineas=(
                _linea("prod-1", "melisa", 2, "5.00"),
                _linea("prod-2", "lavanda", 1, "7.00"),
            ),
        )
        caso = RecalcularResumenPedidoDemo()

        resumen = caso.ejecutar(pedido)

        self.assertEqual(resumen.cantidad_total_items, 3)
        self.assertEqual(resumen.subtotal_demo, Decimal("17.00"))


class RepositorioPedidosDemoMemoria(RepositorioPedidosDemo):
    def __init__(self) -> None:
        self.pedidos: dict[str, PedidoDemo] = {}

    def guardar(self, pedido: PedidoDemo) -> PedidoDemo:
        self.pedidos[pedido.id_pedido] = pedido
        return pedido

    def obtener_por_id(self, id_pedido: str) -> PedidoDemo | None:
        return self.pedidos.get(id_pedido)

    def actualizar_estado(self, id_pedido: str, estado: str) -> PedidoDemo | None:
        pedido = self.pedidos.get(id_pedido)
        if pedido is None:
            return None
        actualizado = PedidoDemo(
            id_pedido=pedido.id_pedido,
            email_contacto=pedido.email_contacto,
            canal_compra=pedido.canal_compra,
            lineas=pedido.lineas,
            estado=estado,
            fecha_creacion=pedido.fecha_creacion,
            id_usuario=pedido.id_usuario,
        )
        self.pedidos[id_pedido] = actualizado
        return actualizado


def _linea(id_producto: str, slug: str, cantidad: int, precio: str) -> LineaPedido:
    return LineaPedido(
        id_producto=id_producto,
        slug_producto=f"{slug}-a-granel-50g",
        nombre_producto=f"{slug.capitalize()} a granel 50g",
        cantidad=cantidad,
        precio_unitario_demo=Decimal(precio),
    )


if __name__ == "__main__":
    unittest.main()
