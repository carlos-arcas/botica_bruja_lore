from decimal import Decimal
from unittest import TestCase
from unittest.mock import Mock

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_pago_pedidos import IniciarPagoPedido
from backend.nucleo_herbal.aplicacion.casos_de_uso_post_pago_pedidos import ProcesarPostPagoPedido
from backend.nucleo_herbal.aplicacion.puertos.pasarela_pago import PuertoPasarelaPago
from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
from backend.nucleo_herbal.infraestructura.pagos_stripe import ConfiguracionStripe, PasarelaPagoStripe


class PagoRealTests(TestCase):
    def test_existe_puerto_psp_desacoplado(self) -> None:
        self.assertTrue(issubclass(PasarelaPagoStripe, PuertoPasarelaPago))

    def test_adaptador_stripe_real_v1_implementa_el_puerto(self) -> None:
        adaptador = PasarelaPagoStripe(
            ConfiguracionStripe(
                api_key_secreta="sk_test_123",
                webhook_secret="whsec_123",
                public_key="pk_test_123",
                success_url="https://example.com/pedido/{ID_PEDIDO}?retorno_pago=success&session_id={CHECKOUT_SESSION_ID}",
                cancel_url="https://example.com/pedido/{ID_PEDIDO}?retorno_pago=cancel",
            )
        )
        self.assertEqual(adaptador.proveedor, "stripe")

    def test_iniciar_pago_sobre_pedido_inexistente_falla(self) -> None:
        caso = IniciarPagoPedido(repositorio_pedidos=Mock(obtener_por_id=Mock(return_value=None)), pasarela_pago=Mock())
        with self.assertRaises(ErrorAplicacionLookup):
            caso.ejecutar("PED-inexistente", "op-test")

    def test_iniciar_pago_sobre_pedido_ya_pagado_falla(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado")
        repositorio = Mock(obtener_por_id=Mock(return_value=pedido))
        with self.assertRaisesRegex(Exception, "ya está pagado"):
            IniciarPagoPedido(repositorio_pedidos=repositorio, pasarela_pago=Mock()).ejecutar(pedido.id_pedido, "op-test")

    def test_procesador_post_pago_no_duplica_email_si_ya_consta_enviado(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado")
        pedido = pedido.marcar_email_post_pago_enviado(pedido.fecha_creacion)
        repositorio = Mock(guardar=Mock(side_effect=lambda actual: actual))
        notificador = Mock()

        resultado = ProcesarPostPagoPedido(repositorio_pedidos=repositorio, notificador=notificador)._enviar_email_si_aplica(pedido, "op-test", "checkout.session.completed")

        self.assertTrue(resultado.email_post_pago_enviado)
        notificador.enviar_confirmacion_pago.assert_not_called()


def _pedido_base(estado: str = "pendiente_pago", estado_pago: str = "pendiente") -> Pedido:
    return Pedido(
        id_pedido="PED-1",
        estado=estado,
        estado_pago=estado_pago,
        canal_checkout="web_invitado",
        cliente=ClientePedido(id_cliente=None, email="real@test.dev", nombre_contacto="Lore", telefono_contacto="600111222"),
        direccion_entrega=DireccionEntrega(nombre_destinatario="Lore", linea_1="Calle Luna 1", codigo_postal="28001", ciudad="Madrid", provincia="Madrid"),
        lineas=(LineaPedido(id_producto="PRO-1", slug_producto="bruma", nombre_producto="Bruma", cantidad=1, precio_unitario=Decimal("9.90")),),
        moneda="EUR",
    )
