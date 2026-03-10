from decimal import Decimal
import unittest

from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo, normalizar_lineas


class TestEntidadesPedidoDemo(unittest.TestCase):
    def test_linea_pedido_calcula_subtotal_demo(self) -> None:
        linea = LineaPedido(
            id_producto="prod-1",
            slug_producto="melisa-a-granel-50g",
            nombre_producto="Melisa a granel 50g",
            cantidad=2,
            precio_unitario_demo=Decimal("5.50"),
        )

        self.assertEqual(linea.subtotal_demo, Decimal("11.00"))

    def test_linea_pedido_rechaza_cantidad_invalida(self) -> None:
        with self.assertRaises(ErrorDominio):
            LineaPedido(
                id_producto="prod-1",
                slug_producto="melisa-a-granel-50g",
                nombre_producto="Melisa a granel 50g",
                cantidad=0,
                precio_unitario_demo=Decimal("5.50"),
            )

    def test_pedido_demo_requiere_lineas(self) -> None:
        with self.assertRaises(ErrorDominio):
            PedidoDemo(
                id_pedido="PD-001",
                email_contacto="demo@lore.test",
                canal_compra="invitado",
                lineas=(),
            )

    def test_pedido_demo_autenticado_requiere_id_usuario(self) -> None:
        linea = _linea_melisa(cantidad=1)

        with self.assertRaises(ErrorDominio):
            PedidoDemo(
                id_pedido="PD-001",
                email_contacto="demo@lore.test",
                canal_compra="autenticado",
                lineas=(linea,),
                id_usuario=None,
            )

    def test_pedido_demo_calcula_subtotal_demo(self) -> None:
        pedido = PedidoDemo(
            id_pedido="PD-001",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            lineas=(_linea_melisa(cantidad=2), _linea_lavanda(cantidad=1)),
        )

        self.assertEqual(pedido.subtotal_demo, Decimal("15.00"))

    def test_normalizar_lineas_agrega_cantidades_repetidas(self) -> None:
        lineas = (
            _linea_melisa(cantidad=1),
            _linea_melisa(cantidad=3),
            _linea_lavanda(cantidad=2),
        )

        normalizadas = normalizar_lineas(lineas)

        self.assertEqual(len(normalizadas), 2)
        self.assertEqual(normalizadas[0].cantidad, 4)
        self.assertEqual(normalizadas[1].cantidad, 2)



def _linea_melisa(cantidad: int) -> LineaPedido:
    return LineaPedido(
        id_producto="prod-1",
        slug_producto="melisa-a-granel-50g",
        nombre_producto="Melisa a granel 50g",
        cantidad=cantidad,
        precio_unitario_demo=Decimal("5.00"),
    )



def _linea_lavanda(cantidad: int) -> LineaPedido:
    return LineaPedido(
        id_producto="prod-2",
        slug_producto="lavanda-a-granel-50g",
        nombre_producto="Lavanda a granel 50g",
        cantidad=cantidad,
        precio_unitario_demo=Decimal("5.00"),
    )


if __name__ == "__main__":
    unittest.main()
