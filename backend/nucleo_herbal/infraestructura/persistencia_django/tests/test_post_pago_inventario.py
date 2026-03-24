from __future__ import annotations

from decimal import Decimal

from django.test import TestCase

from backend.nucleo_herbal.aplicacion.casos_de_uso_pago_pedidos import ProcesarWebhookPagoPedido
from backend.nucleo_herbal.aplicacion.casos_de_uso_post_pago_pedidos import ProcesarPostPagoPedido
from backend.nucleo_herbal.aplicacion.dto_pago_pedidos import EventoPagoNormalizadoDTO
from backend.nucleo_herbal.aplicacion.puertos.notificador_pedidos import NotificadorPostPagoPedido
from backend.nucleo_herbal.aplicacion.puertos.pasarela_pago import PuertoPasarelaPago
from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios_inventario import RepositorioInventarioORM
from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios_pedidos import RepositorioPedidosORM
from backend.nucleo_herbal.infraestructura.persistencia_django.transacciones import TransaccionesDjango


class PostPagoInventarioTests(TestCase):
    def setUp(self) -> None:
        self.repo_pedidos = RepositorioPedidosORM()
        self.repo_inventario = RepositorioInventarioORM()
        self.notificador = NotificadorFalso()
        self.procesador = ProcesarPostPagoPedido(
            repositorio_pedidos=self.repo_pedidos,
            repositorio_inventario=self.repo_inventario,
            transacciones=TransaccionesDjango(),
            notificador=self.notificador,
        )
        self.producto_1 = self._crear_producto("prod-1", "rosa-seca")
        self.producto_2 = self._crear_producto("prod-2", "sal-negra")

    def test_confirmar_pago_con_stock_suficiente_descuenta_inventario(self):
        self._crear_inventario(self.producto_1.id, 5)
        pedido = self._crear_pedido("pedido-1", [(self.producto_1.id, "rosa-seca", "Rosa seca", 2)])

        resultado = self.procesador.ejecutar(pedido, "op-1", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 3)
        self.assertTrue(resultado.inventario_descontado)
        self.assertFalse(resultado.incidencia_stock_confirmacion)
        self.assertEqual(resultado.estado, "pagado")
        self.assertEqual(self.notificador.pedidos_enviados, ["pedido-1"])

    def test_confirmar_pago_granel_descuenta_por_cantidad_comercial_en_unidad_base(self):
        self._crear_inventario(self.producto_1.id, 1000, unidad_base="g")
        pedido = self._crear_pedido("pedido-1b", [(self.producto_1.id, "rosa-seca", "Rosa seca", 250, "g")])

        resultado = self.procesador.ejecutar(pedido, "op-1b", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 750)
        self.assertTrue(resultado.inventario_descontado)
        self.assertFalse(resultado.incidencia_stock_confirmacion)
        self.assertEqual(self.notificador.pedidos_enviados, ["pedido-1b"])

    def test_repetir_confirmacion_no_vuelve_a_descontar(self):
        self._crear_inventario(self.producto_1.id, 4)
        pedido = self._crear_pedido("pedido-2", [(self.producto_1.id, "rosa-seca", "Rosa seca", 1)])

        self.procesador.ejecutar(pedido, "op-2", "checkout.session.completed")
        persistido = self.repo_pedidos.obtener_por_id("pedido-2")
        assert persistido is not None
        self.procesador.ejecutar(persistido, "op-3", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 3)
        self.assertEqual(self.notificador.pedidos_enviados, ["pedido-2"])

    def test_pedido_con_varias_lineas_descuenta_todas(self):
        self._crear_inventario(self.producto_1.id, 5)
        self._crear_inventario(self.producto_2.id, 8)
        pedido = self._crear_pedido(
            "pedido-3",
            [
                (self.producto_1.id, "rosa-seca", "Rosa seca", 2),
                (self.producto_2.id, "sal-negra", "Sal negra", 3),
            ],
        )

        self.procesador.ejecutar(pedido, "op-4", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 3)
        self.assertEqual(self._stock(self.producto_2.id), 5)

    def test_stock_insuficiente_no_deja_descuento_parcial_ni_negativo(self):
        self._crear_inventario(self.producto_1.id, 2)
        self._crear_inventario(self.producto_2.id, 1)
        pedido = self._crear_pedido(
            "pedido-4",
            [
                (self.producto_1.id, "rosa-seca", "Rosa seca", 1),
                (self.producto_2.id, "sal-negra", "Sal negra", 2),
            ],
        )

        resultado = self.procesador.ejecutar(pedido, "op-5", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 2)
        self.assertEqual(self._stock(self.producto_2.id), 1)
        self.assertEqual(resultado.estado, "pagado")
        self.assertFalse(resultado.inventario_descontado)
        self.assertTrue(resultado.incidencia_stock_confirmacion)
        self.assertTrue(resultado.requiere_revision_manual)
        self.assertFalse(resultado.incidencia_stock_revisada)
        self.assertIsNone(resultado.fecha_revision_incidencia_stock)
        self.assertIn("requiere revisión manual", resultado.observaciones_operativas)
        self.assertEqual(self.notificador.pedidos_enviados, [])

    def test_unidad_incompatible_genera_incidencia_sin_tocar_inventario(self):
        self._crear_inventario(self.producto_1.id, 1000, unidad_base="g")
        pedido = self._crear_pedido("pedido-4b", [(self.producto_1.id, "rosa-seca", "Rosa seca", 250, "ml")])

        resultado = self.procesador.ejecutar(pedido, "op-5b", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 1000)
        self.assertEqual(resultado.estado, "pagado")
        self.assertFalse(resultado.inventario_descontado)
        self.assertTrue(resultado.incidencia_stock_confirmacion)
        self.assertTrue(resultado.requiere_revision_manual)
        self.assertIn("requiere revisión manual", resultado.observaciones_operativas)
        self.assertEqual(self.notificador.pedidos_enviados, [])

    def test_unidad_incompatible_en_multilinea_evita_descuento_parcial(self):
        self._crear_inventario(self.producto_1.id, 10, unidad_base="ud")
        self._crear_inventario(self.producto_2.id, 1000, unidad_base="g")
        pedido = self._crear_pedido(
            "pedido-4c",
            [
                (self.producto_1.id, "rosa-seca", "Rosa seca", 2, "ud"),
                (self.producto_2.id, "sal-negra", "Sal negra", 250, "ml"),
            ],
        )

        resultado = self.procesador.ejecutar(pedido, "op-5c", "checkout.session.completed")

        self.assertEqual(self._stock(self.producto_1.id), 10)
        self.assertEqual(self._stock(self.producto_2.id), 1000)
        self.assertFalse(resultado.inventario_descontado)
        self.assertTrue(resultado.incidencia_stock_confirmacion)
        self.assertTrue(resultado.requiere_revision_manual)
        self.assertEqual(self.notificador.pedidos_enviados, [])

    def test_webhook_duplicado_no_reprocesa_descuento(self):
        self._crear_inventario(self.producto_1.id, 6)
        self._crear_pedido("pedido-5", [(self.producto_1.id, "rosa-seca", "Rosa seca", 2)], id_externo_pago="cs_123")
        webhook = ProcesarWebhookPagoPedido(
            repositorio_pedidos=self.repo_pedidos,
            pasarela_pago=PasarelaPagoFalsa(),
            procesador_post_pago=self.procesador,
        )

        primero = webhook.ejecutar(b"{}", "firma", "op-6")
        segundo = webhook.ejecutar(b"{}", "firma", "op-7")

        self.assertEqual(primero["resultado"], "pagado")
        self.assertEqual(segundo["resultado"], "duplicado")
        self.assertEqual(self._stock(self.producto_1.id), 4)

    def _crear_producto(self, id_producto: str, slug: str) -> ProductoModelo:
        return ProductoModelo.objects.create(
            id=id_producto,
            sku=f"sku-{id_producto}",
            slug=slug,
            nombre=slug.replace("-", " ").title(),
            tipo_producto="herbal",
            categoria_comercial="hierbas",
            descripcion_corta="",
            precio_visible="10,00 €",
            precio_numerico=Decimal("10.00"),
            publicado=True,
        )

    def _crear_inventario(self, id_producto: str, cantidad: int, unidad_base: str = "ud") -> None:
        InventarioProductoModelo.objects.create(
            producto_id=id_producto,
            cantidad_disponible=cantidad,
            unidad_base=unidad_base,
        )

    def _crear_pedido(
        self,
        id_pedido: str,
        lineas: list[tuple[str, str, str, int, str] | tuple[str, str, str, int]],
        id_externo_pago: str = "",
    ) -> Pedido:
        pedido = Pedido(
            id_pedido=id_pedido,
            estado="pendiente_pago",
            estado_pago="pendiente",
            canal_checkout="web_invitado",
            cliente=ClientePedido(id_cliente=None, email="cliente@test.dev", nombre_contacto="Lore", telefono_contacto="600000000"),
            direccion_entrega=DireccionEntrega(
                nombre_destinatario="Lore",
                linea_1="Calle Luna 13",
                codigo_postal="28013",
                ciudad="Madrid",
                provincia="Madrid",
                pais_iso="ES",
            ),
            lineas=tuple(
                LineaPedido(
                    id_producto=linea[0],
                    slug_producto=linea[1],
                    nombre_producto=linea[2],
                    cantidad_comercial=linea[3],
                    unidad_comercial=linea[4] if len(linea) == 5 else "ud",
                    precio_unitario=Decimal("10.00"),
                )
                for linea in lineas
            ),
            proveedor_pago="stripe",
            id_externo_pago=id_externo_pago or f"pi_{id_pedido}",
        )
        return self.repo_pedidos.guardar(pedido)

    def _stock(self, id_producto: str) -> int:
        return InventarioProductoModelo.objects.get(producto_id=id_producto).cantidad_disponible


class NotificadorFalso(NotificadorPostPagoPedido):
    def __init__(self) -> None:
        self.pedidos_enviados: list[str] = []

    def enviar_confirmacion_pago(self, pedido: Pedido, operation_id: str) -> None:
        self.pedidos_enviados.append(pedido.id_pedido)

    def enviar_confirmacion_envio(self, pedido: Pedido, operation_id: str) -> None:
        return None


class PasarelaPagoFalsa(PuertoPasarelaPago):
    def crear_intencion_pago(self, pedido: Pedido, operation_id: str) -> dict[str, object]:
        raise NotImplementedError

    def validar_webhook(self, payload: bytes, firma: str | None) -> EventoPagoNormalizadoDTO:
        return EventoPagoNormalizadoDTO(
            id_evento="evt_1",
            tipo_evento="checkout.session.completed",
            proveedor_pago="stripe",
            id_externo_pago="cs_123",
            id_pedido="pedido-5",
            estado_pago="pagado",
            moneda="EUR",
            importe=Decimal("20.00"),
            payload_crudo=payload.decode("utf-8"),
        )

    def consultar_estado_externo(self, id_externo_pago: str):
        raise NotImplementedError

    def ejecutar_reembolso_total(self, *, id_externo_pago: str, moneda: str, importe: Decimal, operation_id: str) -> dict[str, object]:
        raise NotImplementedError
