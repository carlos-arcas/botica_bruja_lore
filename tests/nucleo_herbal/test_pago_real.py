from decimal import Decimal
from unittest import TestCase
from unittest.mock import Mock, patch

from django.test import override_settings

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_pago_pedidos import ConfirmarPagoSimuladoPedido, IniciarPagoPedido
from backend.nucleo_herbal.aplicacion.casos_de_uso_post_pago_pedidos import ProcesarPostPagoPedido
from backend.nucleo_herbal.aplicacion.errores_pedidos import ErrorStockPedido, LineaStockError
from backend.nucleo_herbal.aplicacion.puertos.pasarela_pago import PuertoPasarelaPago
from backend.nucleo_herbal.aplicacion.stock_preventivo_pedidos import ValidarStockPreventivoPedido
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
from backend.nucleo_herbal.infraestructura.pagos_simulados import PasarelaPagoSimuladaLocal
from backend.nucleo_herbal.infraestructura.pagos_stripe import ConfiguracionStripe, PasarelaPagoStripe
from backend.nucleo_herbal.presentacion.publica.dependencias import resolver_pasarela_pago_configurada


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

    def test_adaptador_simulado_local_implementa_el_puerto(self) -> None:
        self.assertTrue(issubclass(PasarelaPagoSimuladaLocal, PuertoPasarelaPago))
        self.assertEqual(PasarelaPagoSimuladaLocal().proveedor, "simulado_local")

    def test_adaptador_simulado_crea_intencion_auditable(self) -> None:
        pedido = _pedido_base()
        respuesta = PasarelaPagoSimuladaLocal().crear_intencion_pago(pedido, "op pay 1")

        self.assertEqual(respuesta["proveedor_pago"], "simulado_local")
        self.assertEqual(respuesta["id_externo_pago"], "SIM-PED-1-OP-PAY-1")
        self.assertEqual(respuesta["estado_pago"], "requiere_accion")
        self.assertEqual(
            respuesta["url_pago"],
            "/pedido/PED-1?pago=simulado&id_externo_pago=SIM-PED-1-OP-PAY-1",
        )

    def test_pedido_acepta_proveedor_simulado_local(self) -> None:
        pedido = _pedido_base().registrar_intencion_pago(
            "simulado_local",
            "SIM-PED-1-OP-1",
            "/pedido/PED-1?pago=simulado",
            "requiere_accion",
        )

        self.assertEqual(pedido.proveedor_pago, "simulado_local")
        self.assertEqual(pedido.id_externo_pago, "SIM-PED-1-OP-1")

    def test_confirmar_pago_simulado_delega_en_post_pago_real(self) -> None:
        pedido = _pedido_base().registrar_intencion_pago(
            "simulado_local",
            "SIM-PED-1-OP-1",
            "/pedido/PED-1?pago=simulado",
            "requiere_accion",
        )
        procesador = Mock(ejecutar=Mock(return_value=pedido))

        ConfirmarPagoSimuladoPedido(
            repositorio_pedidos=Mock(obtener_por_id=Mock(return_value=pedido)),
            procesador_post_pago=procesador,
            validador_stock_preventivo=_validador_stock_ok(),
        ).ejecutar("PED-1", "op-confirmar")

        procesador.ejecutar.assert_called_once_with(
            pedido,
            "op-confirmar",
            "pago_simulado.confirmado",
        )

    @override_settings(BOTICA_PAYMENT_PROVIDER="simulado_local")
    def test_wiring_selecciona_pasarela_simulada_local(self) -> None:
        self.assertIsInstance(resolver_pasarela_pago_configurada(), PasarelaPagoSimuladaLocal)

    @override_settings(BOTICA_PAYMENT_PROVIDER="no_soportado")
    def test_wiring_rechaza_proveedor_invalido(self) -> None:
        with self.assertRaisesRegex(ErrorDominio, "Proveedor de pago no soportado"):
            resolver_pasarela_pago_configurada()

    @override_settings(
        BOTICA_PAYMENT_PROVIDER="stripe",
        STRIPE_SECRET_KEY="sk_test_123",
        STRIPE_WEBHOOK_SECRET="whsec_123",
        PAYMENT_SUCCESS_URL="https://example.com/pedido/{ID_PEDIDO}",
        PAYMENT_CANCEL_URL="https://example.com/pedido/{ID_PEDIDO}/cancel",
    )
    def test_wiring_mantiene_stripe_disponible(self) -> None:
        self.assertIsInstance(resolver_pasarela_pago_configurada(), PasarelaPagoStripe)

    def test_iniciar_pago_sobre_pedido_inexistente_falla(self) -> None:
        caso = IniciarPagoPedido(
            repositorio_pedidos=Mock(obtener_por_id=Mock(return_value=None)),
            pasarela_pago=Mock(),
            validador_stock_preventivo=_validador_stock_ok(),
        )
        with self.assertRaises(ErrorAplicacionLookup):
            caso.ejecutar("PED-inexistente", "op-test")

    def test_iniciar_pago_sobre_pedido_ya_pagado_falla(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado")
        repositorio = Mock(obtener_por_id=Mock(return_value=pedido))
        with self.assertRaisesRegex(Exception, "ya está pagado"):
            IniciarPagoPedido(
                repositorio_pedidos=repositorio,
                pasarela_pago=Mock(),
                validador_stock_preventivo=_validador_stock_ok(),
            ).ejecutar(pedido.id_pedido, "op-test")

    def test_iniciar_pago_rechaza_stock_preventivo_sin_crear_intencion(self) -> None:
        pedido = _pedido_base()
        pasarela = Mock()
        validador = Mock()
        validador.validar.side_effect = _error_stock()

        with self.assertRaises(ErrorStockPedido):
            IniciarPagoPedido(
                repositorio_pedidos=Mock(obtener_por_id=Mock(return_value=pedido)),
                pasarela_pago=pasarela,
                validador_stock_preventivo=validador,
            ).ejecutar(pedido.id_pedido, "op-test")

        pasarela.crear_intencion_pago.assert_not_called()

    def test_confirmar_pago_simulado_revalida_stock_antes_de_post_pago(self) -> None:
        pedido = _pedido_base().registrar_intencion_pago(
            "simulado_local",
            "SIM-PED-1-OP-1",
            "/pedido/PED-1?pago=simulado",
            "requiere_accion",
        )
        procesador = Mock()
        validador = Mock()
        validador.validar.side_effect = _error_stock()

        with self.assertRaises(ErrorStockPedido):
            ConfirmarPagoSimuladoPedido(
                repositorio_pedidos=Mock(obtener_por_id=Mock(return_value=pedido)),
                procesador_post_pago=procesador,
                validador_stock_preventivo=validador,
            ).ejecutar("PED-1", "op-confirmar")

        procesador.ejecutar.assert_not_called()

    def test_stock_preventivo_detalla_producto_sin_inventario(self) -> None:
        validador = ValidarStockPreventivoPedido(
            repositorio_inventario=Mock(obtener_por_id_producto=Mock(return_value=None))
        )

        with self.assertRaises(ErrorStockPedido) as contexto:
            validador.validar(_pedido_base(), "op-stock")

        self.assertEqual(contexto.exception.lineas[0].codigo, "inventario_no_registrado")
        self.assertEqual(contexto.exception.lineas[0].id_producto, "PRO-1")

    def test_procesador_post_pago_no_duplica_email_si_ya_consta_enviado(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado")
        pedido = pedido.marcar_email_post_pago_enviado(pedido.fecha_creacion)
        repositorio = Mock(guardar=Mock(side_effect=lambda actual: actual))
        repositorio_inventario = Mock()
        transacciones = Mock()
        notificador = Mock()

        resultado = ProcesarPostPagoPedido(
            repositorio_pedidos=repositorio,
            repositorio_inventario=repositorio_inventario,
            repositorio_movimientos=Mock(),
            transacciones=transacciones,
            notificador=notificador,
        )._enviar_email_si_aplica(pedido, "op-test", "checkout.session.completed")

        self.assertTrue(resultado.email_post_pago_enviado)
        notificador.enviar_confirmacion_pago.assert_not_called()

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_pasarela_stripe_redondea_a_centimos_con_half_up(self, post_stripe: Mock) -> None:
        post_stripe.return_value = {"id": "cs_test_1", "url": "https://stripe.test/cs_test_1"}
        pedido = Pedido(
            id_pedido="PED-1",
            estado="pendiente_pago",
            estado_pago="pendiente",
            canal_checkout="web_invitado",
            cliente=ClientePedido(id_cliente=None, email="real@test.dev", nombre_contacto="Lore", telefono_contacto="600111222"),
            direccion_entrega=DireccionEntrega(nombre_destinatario="Lore", linea_1="Calle Luna 1", codigo_postal="28001", ciudad="Madrid", provincia="Madrid"),
            lineas=(LineaPedido(id_producto="PRO-1", slug_producto="bruma", nombre_producto="Bruma", cantidad_comercial=1, unidad_comercial="ud", precio_unitario=Decimal("9.995")),),
            moneda="EUR",
            importe_envio=Decimal("0"),
            tipo_impositivo=Decimal("0.21"),
        )
        adaptador = _adaptador()

        adaptador.crear_intencion_pago(pedido, "op-test")

        payload = post_stripe.call_args.args[1]
        self.assertEqual(payload["line_items[0][price_data][unit_amount]"], "1000")
        self.assertEqual(payload["line_items[1][price_data][unit_amount]"], "210")
        self.assertEqual(payload["line_items[2][price_data][unit_amount]"], "0")
        self.assertEqual(payload["line_items[3][price_data][unit_amount]"], "0")

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._get")
    def test_pasarela_stripe_consulta_estado_externo_sin_floats(self, get_stripe: Mock) -> None:
        get_stripe.return_value = {"payment_status": "paid", "amount_total": 1683, "currency": "eur"}
        adaptador = _adaptador()

        estado, importe, moneda = adaptador.consultar_estado_externo("cs_test_123")

        self.assertEqual(estado, "pagado")
        self.assertEqual(importe, Decimal("16.83"))
        self.assertEqual(moneda, "EUR")


def _pedido_base(estado: str = "pendiente_pago", estado_pago: str = "pendiente") -> Pedido:
    return Pedido(
        id_pedido="PED-1",
        estado=estado,
        estado_pago=estado_pago,
        canal_checkout="web_invitado",
        cliente=ClientePedido(id_cliente=None, email="real@test.dev", nombre_contacto="Lore", telefono_contacto="600111222"),
        direccion_entrega=DireccionEntrega(nombre_destinatario="Lore", linea_1="Calle Luna 1", codigo_postal="28001", ciudad="Madrid", provincia="Madrid"),
        lineas=(LineaPedido(id_producto="PRO-1", slug_producto="bruma", nombre_producto="Bruma", cantidad_comercial=1, unidad_comercial="ud", precio_unitario=Decimal("9.90")),),
        moneda="EUR",
    )


def _adaptador() -> PasarelaPagoStripe:
    return PasarelaPagoStripe(
        ConfiguracionStripe(
            api_key_secreta="sk_test_123",
            webhook_secret="whsec_123",
            public_key="pk_test_123",
            success_url="https://example.com/pedido/{ID_PEDIDO}?retorno_pago=success&session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://example.com/pedido/{ID_PEDIDO}?retorno_pago=cancel",
        )
    )


def _validador_stock_ok() -> Mock:
    return Mock(validar=Mock(return_value=None))


def _error_stock() -> ErrorStockPedido:
    return ErrorStockPedido(
        "No se puede continuar al pago porque una o mas lineas no tienen stock disponible.",
        lineas=(
            LineaStockError(
                id_producto="PRO-1",
                slug_producto="bruma",
                nombre_producto="Bruma",
                cantidad_solicitada=1,
                cantidad_disponible=0,
                codigo="stock_insuficiente",
                detalle="La cantidad solicitada supera el stock disponible en este momento.",
            ),
        ),
    )
