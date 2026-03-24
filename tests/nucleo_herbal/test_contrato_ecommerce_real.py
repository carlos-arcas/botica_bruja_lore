from decimal import Decimal
from pathlib import Path
from unittest import TestCase

from backend.nucleo_herbal.aplicacion.anti_corrupcion_pedidos_demo import adaptar_pedido_demo_a_detalle_pedido
from backend.nucleo_herbal.dominio.pedidos import (
    CANALES_CHECKOUT_VALIDOS,
    ESTRATEGIA_CONVIVENCIA_PEDIDOS,
    ESTADOS_PEDIDO_VALIDOS,
    ESTADOS_REEMBOLSO_VALIDOS,
    RUTA_API_PEDIDOS,
    ClientePedido,
    DireccionEntrega,
    LineaPedido,
    PayloadPedido,
    Pedido,
    ESTADOS_PAGO_VALIDOS,
)
from backend.nucleo_herbal.dominio.pedidos_demo import MARCA_CONTRATO_PEDIDO_DEMO, PedidoDemo, RUTA_API_PEDIDOS_DEMO
from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido as LineaPedidoDemo


class ContratoEcommerceRealTests(TestCase):
    def test_contrato_canonico_real_define_estados_canales_y_ruta(self) -> None:
        self.assertEqual(
            ESTADOS_PEDIDO_VALIDOS,
            ("pendiente_pago", "pagado", "preparando", "enviado", "entregado", "cancelado"),
        )
        self.assertEqual(CANALES_CHECKOUT_VALIDOS, ("web_invitado", "web_autenticado", "backoffice"))
        self.assertEqual(RUTA_API_PEDIDOS, "/api/v1/pedidos/")
        self.assertEqual(ESTADOS_PAGO_VALIDOS, ("pendiente", "requiere_accion", "pagado", "fallido", "cancelado"))
        self.assertEqual(ESTADOS_REEMBOLSO_VALIDOS, ("no_iniciado", "fallido", "ejecutado"))

    def test_payload_y_pedido_real_requieren_direccion_y_contacto(self) -> None:
        cliente = ClientePedido(
            id_cliente="USR-1",
            email="lore@test.dev",
            nombre_contacto="Lore",
            telefono_contacto="600111222",
            es_invitado=False,
        )
        direccion = DireccionEntrega(
            nombre_destinatario="Lore",
            linea_1="Calle Luna 1",
            codigo_postal="28001",
            ciudad="Madrid",
            provincia="Madrid",
        )
        linea = LineaPedido(
            id_producto="PRO-1",
            slug_producto="bruma-lunar",
            nombre_producto="Bruma lunar",
            cantidad=2,
            precio_unitario=Decimal("5.00"),
        )

        payload = PayloadPedido(
            canal_checkout="web_autenticado",
            cliente=cliente,
            direccion_entrega=direccion,
            lineas=(linea,),
            notas_cliente="Entregar por la tarde.",
        )
        pedido = Pedido(
            id_pedido="PED-1",
            estado="pendiente_pago",
            canal_checkout="web_autenticado",
            cliente=cliente,
            direccion_entrega=direccion,
            lineas=(linea,),
            notas_cliente="Entregar por la tarde.",
        )

        self.assertEqual(payload.direccion_entrega.ciudad, "Madrid")
        self.assertEqual(pedido.subtotal, Decimal("10.00"))
        self.assertEqual(pedido.total, Decimal("10.00"))
        self.assertEqual(pedido.cliente.telefono_contacto, "600111222")
        self.assertEqual(pedido.estado_pago, "pendiente")

    def test_pedido_real_no_admite_importe_envio_negativo(self) -> None:
        cliente = ClientePedido(
            id_cliente=None,
            email="lore@test.dev",
            nombre_contacto="Lore",
            telefono_contacto="600111222",
            es_invitado=True,
        )
        direccion = DireccionEntrega(
            nombre_destinatario="Lore",
            linea_1="Calle Luna 1",
            codigo_postal="28001",
            ciudad="Madrid",
            provincia="Madrid",
        )
        linea = LineaPedido(
            id_producto="PRO-1",
            slug_producto="bruma-lunar",
            nombre_producto="Bruma lunar",
            cantidad=1,
            precio_unitario=Decimal("5.00"),
        )

        with self.assertRaisesRegex(Exception, "importe de envío negativo"):
            Pedido(
                id_pedido="PED-NEG",
                estado="pendiente_pago",
                canal_checkout="web_invitado",
                cliente=cliente,
                direccion_entrega=direccion,
                lineas=(linea,),
                importe_envio=Decimal("-0.01"),
            )

    def test_adaptador_demo_convive_sin_romper_y_marca_origen_legacy(self) -> None:
        pedido_demo = PedidoDemo(
            id_pedido="PD-1",
            email_contacto="demo@test.dev",
            canal_compra="autenticado",
            id_usuario="USR-9",
            lineas=(
                LineaPedidoDemo(
                    id_producto="PRO-1",
                    slug_producto="bruma-lunar",
                    nombre_producto="Bruma lunar",
                    cantidad=1,
                    precio_unitario_demo=Decimal("7.50"),
                ),
            ),
        )

        detalle = adaptar_pedido_demo_a_detalle_pedido(pedido_demo)

        self.assertEqual(detalle.origen_contrato, "demo_legacy")
        self.assertEqual(detalle.pedido.canal_checkout, "web_autenticado")
        self.assertEqual(detalle.pedido.estado, "pendiente_pago")
        self.assertEqual(detalle.pedido.lineas[0].precio_unitario, Decimal("7.50"))

    def test_contrato_demo_queda_marcado_como_legado_controlado(self) -> None:
        self.assertEqual(MARCA_CONTRATO_PEDIDO_DEMO, "legado_controlado")
        self.assertEqual(RUTA_API_PEDIDOS_DEMO, "/api/v1/pedidos-demo/")
        self.assertEqual(ESTRATEGIA_CONVIVENCIA_PEDIDOS["modo"], "anti_corrupcion")
        self.assertEqual(ESTRATEGIA_CONVIVENCIA_PEDIDOS["ruta_objetivo"], "/api/v1/pedidos/")

    def test_documentacion_refleja_la_transicion_demo_a_real(self) -> None:
        migracion = Path("docs/17_migracion_ecommerce_real.md").read_text()
        estado = Path("docs/90_estado_implementacion.md").read_text()

        self.assertIn("Contrato canónico real", migracion)
        self.assertIn("`PedidoDemo` sigue operativo sólo como **legacy controlado**", migracion)
        self.assertIn("/api/v1/pedidos/", migracion)
        self.assertIn("Checkout real v1 en coexistencia", estado)
        self.assertIn("pago real v1", migracion.lower())
