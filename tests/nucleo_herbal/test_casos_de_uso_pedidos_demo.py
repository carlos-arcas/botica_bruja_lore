from decimal import Decimal
import unittest

from backend.nucleo_herbal.aplicacion.casos_de_uso_pedidos_demo import (
    CrearPedidoDemoDesdeLineas,
    RecalcularResumenPedidoDemo,
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
