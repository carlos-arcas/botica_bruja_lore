from datetime import UTC, datetime
from decimal import Decimal
import unittest

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
    from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios_pedidos import RepositorioPedidosORM

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestRepositorioPedidosReal(DjangoTestCase):
    def test_guardar_y_recuperar_pedido_real(self) -> None:
        repo = RepositorioPedidosORM()
        pedido = _pedido_base(id_pedido="PED-20260319010101-test0001", canal_checkout="web_autenticado", id_cliente="USR-1", es_invitado=False)

        repo.guardar(pedido)
        recuperado = repo.obtener_por_id(pedido.id_pedido)

        self.assertIsNotNone(recuperado)
        assert recuperado is not None
        self.assertEqual(recuperado.estado, "pendiente_pago")
        self.assertEqual(recuperado.estado_pago, "pendiente")
        self.assertEqual(recuperado.cliente.id_cliente, "USR-1")
        self.assertEqual(recuperado.direccion_entrega.codigo_postal, "28001")
        self.assertEqual(recuperado.subtotal, Decimal("18.00"))

    def test_persiste_datos_de_expedicion_real(self) -> None:
        repo = RepositorioPedidosORM()
        pedido = _pedido_base(id_pedido="PED-20260319010101-test0002", estado="pagado", estado_pago="pagado")
        pedido = pedido.marcar_preparando(datetime.now(tz=UTC))
        pedido = pedido.marcar_enviado(fecha_envio=datetime.now(tz=UTC), transportista="Correos", codigo_seguimiento="TRK-9")

        repo.guardar(pedido)
        recuperado = repo.obtener_por_id(pedido.id_pedido)

        assert recuperado is not None
        self.assertEqual(recuperado.transportista, "Correos")
        self.assertEqual(recuperado.codigo_seguimiento, "TRK-9")
        self.assertIsNotNone(recuperado.fecha_envio)



def _pedido_base(id_pedido: str, estado: str = "pendiente_pago", estado_pago: str = "pendiente", canal_checkout: str = "web_invitado", id_cliente: str | None = None, es_invitado: bool = True) -> Pedido:
    return Pedido(
        id_pedido=id_pedido,
        estado=estado,
        estado_pago=estado_pago,
        canal_checkout=canal_checkout,
        cliente=ClientePedido(id_cliente=id_cliente, email="real@test.dev", nombre_contacto="Lore", telefono_contacto="600111222", es_invitado=es_invitado),
        direccion_entrega=DireccionEntrega(nombre_destinatario="Lore", linea_1="Calle Luna 1", codigo_postal="28001", ciudad="Madrid", provincia="Madrid"),
        lineas=(LineaPedido(id_producto="prod-1", slug_producto="tarot-bosque-interior", nombre_producto="Tarot bosque interior", cantidad=2, precio_unitario=Decimal("9.00")),),
        notas_cliente="Sin prisa.",
        moneda="EUR",
    )
