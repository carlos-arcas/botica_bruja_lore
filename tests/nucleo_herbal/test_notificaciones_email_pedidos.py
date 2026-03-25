from decimal import Decimal
from unittest import TestCase
from unittest.mock import patch

from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
from backend.nucleo_herbal.infraestructura.notificaciones_email import NotificadorEmailPostPago


class NotificacionesEmailPedidosTests(TestCase):
    @patch("backend.nucleo_herbal.infraestructura.notificaciones_email.send_mail")
    def test_envia_email_cancelacion_operativa(self, send_mail_mock) -> None:
        pedido = _pedido_base(estado="pagado")
        pedido = pedido.cancelar_operativamente_por_incidencia_stock(
            fecha_cancelacion=pedido.fecha_creacion,
            motivo_cancelacion="Cancelación operativa por incidencia de stock",
        )

        NotificadorEmailPostPago().enviar_cancelacion_operativa_stock(pedido, "op-cancel-mail")

        kwargs = send_mail_mock.call_args.kwargs
        self.assertIn("cancelado", kwargs["subject"].lower())
        self.assertIn("incidencia de stock", kwargs["message"].lower())
        self.assertEqual(kwargs["recipient_list"], [pedido.cliente.email])

    @patch("backend.nucleo_herbal.infraestructura.notificaciones_email.send_mail")
    def test_envia_email_reembolso_ejecutado(self, send_mail_mock) -> None:
        pedido = _pedido_base(estado="pagado")
        pedido = pedido.cancelar_operativamente_por_incidencia_stock(
            fecha_cancelacion=pedido.fecha_creacion,
            motivo_cancelacion="Cancelación operativa por incidencia de stock",
        )
        pedido = pedido.registrar_reembolso_exitoso(
            fecha_reembolso=pedido.fecha_creacion,
            id_externo_reembolso="re_456",
        )

        NotificadorEmailPostPago().enviar_reembolso_manual_ejecutado(pedido, "op-refund-mail")

        kwargs = send_mail_mock.call_args.kwargs
        self.assertIn("reembolso", kwargs["subject"].lower())
        self.assertIn("re_456", kwargs["message"])
        self.assertEqual(kwargs["recipient_list"], [pedido.cliente.email])


def _pedido_base(*, estado: str) -> Pedido:
    return Pedido(
        id_pedido="PED-MAIL-1",
        estado=estado,
        estado_pago="pagado",
        canal_checkout="web_invitado",
        cliente=ClientePedido(id_cliente=None, email="real@test.dev", nombre_contacto="Lore", telefono_contacto="600111222"),
        direccion_entrega=DireccionEntrega(
            nombre_destinatario="Lore",
            linea_1="Calle Luna 7",
            codigo_postal="28001",
            ciudad="Madrid",
            provincia="Madrid",
            pais_iso="ES",
        ),
        lineas=(
            LineaPedido(
                id_producto="PRO-1",
                slug_producto="romero",
                nombre_producto="Romero",
                cantidad_comercial=1,
                unidad_comercial="ud",
                precio_unitario=Decimal("9.90"),
            ),
        ),
        id_externo_pago="cs_test_123",
        proveedor_pago="stripe",
        incidencia_stock_confirmacion=True,
    )
