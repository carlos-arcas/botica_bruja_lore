from decimal import Decimal
from unittest import TestCase
from unittest.mock import Mock

from backend.nucleo_herbal.aplicacion.casos_de_uso_backoffice_pedidos import DatosEnvioBackoffice, MarcarPedidoEnviado
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido


class OperacionPedidosRealTests(TestCase):
    def test_pagado_a_preparando_funciona(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado")
        actualizado = pedido.marcar_preparando(pedido.fecha_creacion)
        self.assertEqual(actualizado.estado, "preparando")
        self.assertIsNotNone(actualizado.fecha_preparacion)

    def test_preparando_a_enviado_exige_datos_operativos(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado").marcar_preparando(_pedido_base().fecha_creacion)
        actualizado = pedido.marcar_enviado(fecha_envio=pedido.fecha_creacion, transportista="Correos", codigo_seguimiento="TRK-1")
        self.assertEqual(actualizado.estado, "enviado")
        self.assertEqual(actualizado.transportista, "Correos")
        self.assertEqual(actualizado.codigo_seguimiento, "TRK-1")

    def test_enviado_a_entregado_funciona(self) -> None:
        pedido = _pedido_enviado()
        actualizado = pedido.marcar_entregado(pedido.fecha_creacion)
        self.assertEqual(actualizado.estado, "entregado")
        self.assertIsNotNone(actualizado.fecha_entrega)

    def test_no_permite_transicion_invalida(self) -> None:
        with self.assertRaisesRegex(ErrorDominio, "Solo un pedido pagado"):
            _pedido_base().marcar_preparando(_pedido_base().fecha_creacion)

    def test_no_permite_enviar_sin_tracking_ni_politica_explicita(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado").marcar_preparando(_pedido_base().fecha_creacion)
        with self.assertRaisesRegex(ErrorDominio, "código de seguimiento"):
            pedido.marcar_enviado(fecha_envio=pedido.fecha_creacion, transportista="Correos")

    def test_email_envio_no_se_duplica(self) -> None:
        pedido = _pedido_enviado().marcar_email_envio_enviado(_pedido_enviado().fecha_creacion)
        repositorio = Mock(guardar=Mock(side_effect=lambda actual: actual))
        notificador = Mock()
        caso = MarcarPedidoEnviado(repositorio_pedidos=repositorio, notificador=notificador)
        resultado = caso._enviar_email_si_aplica(pedido, "op-1", "staff")
        self.assertTrue(resultado.email_envio_enviado)
        notificador.enviar_confirmacion_envio.assert_not_called()



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


def _pedido_enviado() -> Pedido:
    pedido = _pedido_base(estado="pagado", estado_pago="pagado").marcar_preparando(_pedido_base().fecha_creacion)
    return pedido.marcar_enviado(fecha_envio=pedido.fecha_creacion, transportista="Correos", codigo_seguimiento="TRK-1")
