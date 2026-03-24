from decimal import Decimal
from dataclasses import replace
from unittest import TestCase
from unittest.mock import Mock

from backend.nucleo_herbal.aplicacion.casos_de_uso_backoffice_pedidos import (
    CancelarPedidoOperativoPorIncidenciaStock,
    DatosEnvioBackoffice,
    MarcarPedidoEnviado,
    ReembolsarPedidoCanceladoPorIncidenciaStock,
    RestituirInventarioManualPedidoCancelado,
)
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.inventario import InventarioProducto
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

    def test_cancelacion_operativa_valida_en_pedido_pagado_con_incidencia(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado").registrar_incidencia_stock_confirmacion("Sin stock real")
        actualizado = pedido.cancelar_operativamente_por_incidencia_stock(
            fecha_cancelacion=pedido.fecha_creacion,
            motivo_cancelacion="Cancelación manual por incidencia de stock",
        )
        self.assertEqual(actualizado.estado, "cancelado")
        self.assertTrue(actualizado.cancelado_operativa_incidencia_stock)
        self.assertIsNotNone(actualizado.fecha_cancelacion_operativa)
        self.assertEqual(actualizado.motivo_cancelacion_operativa, "Cancelación manual por incidencia de stock")
        self.assertTrue(actualizado.incidencia_stock_confirmacion)

    def test_cancelacion_operativa_rechaza_sin_incidencia_stock(self) -> None:
        with self.assertRaisesRegex(ErrorDominio, "incidencia de stock"):
            _pedido_base(estado="pagado", estado_pago="pagado").cancelar_operativamente_por_incidencia_stock(
                fecha_cancelacion=_pedido_base().fecha_creacion,
                motivo_cancelacion="Sin incidencia previa",
            )

    def test_cancelacion_operativa_rechaza_estado_no_cancelable(self) -> None:
        pedido = _pedido_enviado().registrar_incidencia_stock_confirmacion("Incidencia tardía")
        with self.assertRaisesRegex(ErrorDominio, "pedido pagado"):
            pedido.cancelar_operativamente_por_incidencia_stock(
                fecha_cancelacion=pedido.fecha_creacion,
                motivo_cancelacion="Ya enviado",
            )

    def test_caso_uso_cancelacion_operativa_persiste_trazabilidad(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado").registrar_incidencia_stock_confirmacion("Sin stock")
        repositorio = Mock(
            obtener_por_id=Mock(return_value=pedido),
            guardar=Mock(side_effect=lambda actual: actual),
        )
        caso = CancelarPedidoOperativoPorIncidenciaStock(repositorio_pedidos=repositorio)

        resultado = caso.ejecutar(
            id_pedido=pedido.id_pedido,
            operation_id="op-cancel-1",
            actor="staff",
            motivo_cancelacion="Cancelación operativa manual",
        )

        self.assertEqual(resultado.estado, "cancelado")
        self.assertTrue(resultado.cancelado_operativa_incidencia_stock)
        self.assertEqual(resultado.estado_pago, "pagado")

    def test_caso_uso_cancelacion_operativa_registra_warning_en_rechazo(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado")
        repositorio = Mock(obtener_por_id=Mock(return_value=pedido), guardar=Mock())
        caso = CancelarPedidoOperativoPorIncidenciaStock(repositorio_pedidos=repositorio)

        with self.assertLogs("backend.nucleo_herbal.aplicacion.casos_de_uso_backoffice_pedidos", level="WARNING") as logs:
            with self.assertRaisesRegex(ErrorDominio, "incidencia de stock"):
                caso.ejecutar(
                    id_pedido=pedido.id_pedido,
                    operation_id="op-cancel-warning",
                    actor="staff",
                    motivo_cancelacion="Cancelación inválida",
                )

        self.assertTrue(any("backoffice_pedido_cancelacion_operativa_rechazada" in mensaje for mensaje in logs.output))

    def test_reembolso_manual_exitoso_en_cancelado_por_incidencia_stock(self) -> None:
        pedido = (
            _pedido_base(estado="pagado", estado_pago="pagado")
            .registrar_incidencia_stock_confirmacion("Sin stock")
            .cancelar_operativamente_por_incidencia_stock(_pedido_base().fecha_creacion, "Cancelación operativa")
        )
        pedido = replace(pedido, id_externo_pago="cs_test_1", proveedor_pago="stripe")
        repositorio = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock(side_effect=lambda actual: actual))
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))
        pasarela = Mock(ejecutar_reembolso_total=Mock(return_value={"resultado": "ejecutado", "id_externo_reembolso": "re_123", "detalle": ""}))

        caso = ReembolsarPedidoCanceladoPorIncidenciaStock(repositorio_pedidos=repositorio, pasarela_pago=pasarela, transacciones=transacciones)
        resultado = caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-refund-1", actor="staff")

        self.assertEqual(resultado.estado_reembolso, "ejecutado")
        self.assertEqual(resultado.id_externo_reembolso, "re_123")

    def test_reembolso_manual_reintento_idempotente_no_duplica_operacion(self) -> None:
        pedido = (
            _pedido_base(estado="pagado", estado_pago="pagado")
            .registrar_incidencia_stock_confirmacion("Sin stock")
            .cancelar_operativamente_por_incidencia_stock(_pedido_base().fecha_creacion, "Cancelación operativa")
        )
        pedido = replace(
            pedido,
            id_externo_pago="cs_test_1",
            estado_reembolso="ejecutado",
            fecha_reembolso=pedido.fecha_creacion,
            id_externo_reembolso="re_1",
        )
        repositorio = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock())
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))
        pasarela = Mock()
        caso = ReembolsarPedidoCanceladoPorIncidenciaStock(repositorio_pedidos=repositorio, pasarela_pago=pasarela, transacciones=transacciones)

        resultado = caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-refund-idem", actor="staff")

        self.assertEqual(resultado.estado_reembolso, "ejecutado")
        pasarela.ejecutar_reembolso_total.assert_not_called()

    def test_reembolso_manual_fallido_deja_estado_auditable(self) -> None:
        pedido = (
            _pedido_base(estado="pagado", estado_pago="pagado")
            .registrar_incidencia_stock_confirmacion("Sin stock")
            .cancelar_operativamente_por_incidencia_stock(_pedido_base().fecha_creacion, "Cancelación operativa")
        )
        pedido = replace(pedido, id_externo_pago="cs_test_1", proveedor_pago="stripe")
        repositorio = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock(side_effect=lambda actual: actual))
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))
        pasarela = Mock(ejecutar_reembolso_total=Mock(return_value={"resultado": "fallido", "id_externo_reembolso": "re_fail", "detalle": "insufficient_funds"}))
        caso = ReembolsarPedidoCanceladoPorIncidenciaStock(repositorio_pedidos=repositorio, pasarela_pago=pasarela, transacciones=transacciones)
        resultado = caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-refund-fail", actor="staff")

        guardado = repositorio.guardar.call_args.args[0]
        self.assertEqual(resultado.estado_reembolso, "fallido")
        self.assertEqual(guardado.estado_reembolso, "fallido")
        self.assertEqual(guardado.motivo_fallo_reembolso, "insufficient_funds")

    def test_reembolso_manual_rechaza_si_no_esta_cancelado_por_incidencia(self) -> None:
        pedido = replace(_pedido_base(estado="pagado", estado_pago="pagado"), id_externo_pago="cs_test_1", proveedor_pago="stripe")
        repositorio = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock())
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))
        caso = ReembolsarPedidoCanceladoPorIncidenciaStock(repositorio_pedidos=repositorio, pasarela_pago=Mock(), transacciones=transacciones)

        with self.assertRaisesRegex(ErrorDominio, "cancelado operativamente"):
            caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-refund-invalid-state", actor="staff")

    def test_reembolso_manual_rechaza_si_falta_referencia_externa_pago(self) -> None:
        pedido = (
            _pedido_base(estado="pagado", estado_pago="pagado")
            .registrar_incidencia_stock_confirmacion("Sin stock")
            .cancelar_operativamente_por_incidencia_stock(_pedido_base().fecha_creacion, "Cancelación operativa")
        )
        repositorio = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock())
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))
        caso = ReembolsarPedidoCanceladoPorIncidenciaStock(repositorio_pedidos=repositorio, pasarela_pago=Mock(), transacciones=transacciones)

        with self.assertRaisesRegex(ErrorDominio, "referencia externa de pago"):
            caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-refund-no-ref", actor="staff")

    def test_reembolso_manual_rechaza_si_pedido_no_esta_pagado(self) -> None:
        pedido = (
            _pedido_base(estado="pendiente_pago", estado_pago="pendiente")
            .registrar_incidencia_stock_confirmacion("Sin stock")
        )
        pedido = replace(
            pedido,
            estado="cancelado",
            cancelado_operativa_incidencia_stock=True,
            fecha_cancelacion_operativa=pedido.fecha_creacion,
            motivo_cancelacion_operativa="Cancelación operativa",
            id_externo_pago="cs_test_1",
        )
        repositorio = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock())
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))
        caso = ReembolsarPedidoCanceladoPorIncidenciaStock(repositorio_pedidos=repositorio, pasarela_pago=Mock(), transacciones=transacciones)

        with self.assertRaisesRegex(ErrorDominio, "pago confirmado"):
            caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-refund-not-paid", actor="staff")

    def test_restitucion_manual_valida_incrementa_stock_y_marca_pedido(self) -> None:
        pedido_base = (
            _pedido_base(estado="pagado", estado_pago="pagado")
            .registrar_incidencia_stock_confirmacion("Sin stock")
            .cancelar_operativamente_por_incidencia_stock(_pedido_base().fecha_creacion, "Cancelación operativa")
        )
        pedido = replace(
            pedido_base,
            inventario_descontado=True,
            incidencia_stock_confirmacion=False,
        )
        inventario = InventarioProducto(id_producto="PRO-1", cantidad_disponible=4, unidad_base="ud", umbral_bajo_stock=1)
        repo_pedidos = Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido), guardar=Mock(side_effect=lambda actual: actual))
        repo_inventario = Mock(
            obtener_por_id_producto=Mock(return_value=inventario),
            guardar=Mock(side_effect=lambda actual: actual),
        )
        repo_movimientos = Mock(registrar=Mock())
        transacciones = Mock(atomic=Mock(return_value=_ContextoNulo()))

        caso = RestituirInventarioManualPedidoCancelado(
            repositorio_pedidos=repo_pedidos,
            repositorio_inventario=repo_inventario,
            repositorio_movimientos=repo_movimientos,
            transacciones=transacciones,
        )
        resultado = caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-rest-1", actor="staff")

        self.assertTrue(resultado.inventario_restituido)
        self.assertIsNotNone(resultado.fecha_restitucion_inventario)
        inventario_guardado = repo_inventario.guardar.call_args.args[0]
        self.assertEqual(inventario_guardado.cantidad_disponible, 5)
        movimiento = repo_movimientos.registrar.call_args.args[0]
        self.assertEqual(movimiento.tipo_movimiento, "restitucion_manual")
        self.assertEqual(movimiento.cantidad, 1)

    def test_restitucion_manual_rechaza_si_no_hubo_descuento(self) -> None:
        pedido = (
            _pedido_base(estado="pagado", estado_pago="pagado")
            .registrar_incidencia_stock_confirmacion("Sin stock")
            .cancelar_operativamente_por_incidencia_stock(_pedido_base().fecha_creacion, "Cancelación operativa")
        )
        caso = RestituirInventarioManualPedidoCancelado(
            repositorio_pedidos=Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido)),
            repositorio_inventario=Mock(),
            repositorio_movimientos=Mock(),
            transacciones=Mock(atomic=Mock(return_value=_ContextoNulo())),
        )

        with self.assertRaisesRegex(ErrorDominio, "sin descuento previo"):
            caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-rest-no-discount", actor="staff")

    def test_restitucion_manual_rechaza_si_estado_no_cancelado(self) -> None:
        pedido = _pedido_base(estado="pagado", estado_pago="pagado").marcar_inventario_descontado()
        caso = RestituirInventarioManualPedidoCancelado(
            repositorio_pedidos=Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido)),
            repositorio_inventario=Mock(),
            repositorio_movimientos=Mock(),
            transacciones=Mock(atomic=Mock(return_value=_ContextoNulo())),
        )

        with self.assertRaisesRegex(ErrorDominio, "cancelados operativamente"):
            caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-rest-invalid-state", actor="staff")

    def test_restitucion_manual_reintento_idempotente_no_duplica_movimiento(self) -> None:
        pedido = replace(
            _pedido_base(estado="cancelado", estado_pago="pagado").marcar_inventario_descontado(),
            cancelado_operativa_incidencia_stock=True,
            fecha_cancelacion_operativa=_pedido_base().fecha_creacion,
            motivo_cancelacion_operativa="Cancelación operativa",
            inventario_restituido=True,
            fecha_restitucion_inventario=_pedido_base().fecha_creacion,
        )
        repo_movimientos = Mock()
        caso = RestituirInventarioManualPedidoCancelado(
            repositorio_pedidos=Mock(obtener_por_id_para_actualizar=Mock(return_value=pedido)),
            repositorio_inventario=Mock(),
            repositorio_movimientos=repo_movimientos,
            transacciones=Mock(atomic=Mock(return_value=_ContextoNulo())),
        )

        resultado = caso.ejecutar(id_pedido=pedido.id_pedido, operation_id="op-rest-idem", actor="staff")

        self.assertTrue(resultado.inventario_restituido)
        repo_movimientos.registrar.assert_not_called()



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


def _pedido_enviado() -> Pedido:
    pedido = _pedido_base(estado="pagado", estado_pago="pagado").marcar_preparando(_pedido_base().fecha_creacion)
    return pedido.marcar_enviado(fecha_envio=pedido.fecha_creacion, transportista="Correos", codigo_seguimiento="TRK-1")


class _ContextoNulo:
    def __enter__(self):
        return None

    def __exit__(self, exc_type, exc, tb):
        return False
