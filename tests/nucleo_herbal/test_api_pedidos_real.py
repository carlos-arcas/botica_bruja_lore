import json
import unittest

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    PedidoRealModelo = None
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestApiPedidosReal(DjangoTestCase):
    def setUp(self) -> None:
        super().setUp()
        _crear_producto_con_inventario()

    def test_crear_pedido_real_valido_persiste_y_nace_pendiente_pago(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos/",
            data=json.dumps(_payload_base()),
            content_type="application/json",
            HTTP_X_OPERATION_ID="op-real-001",
        )

        self.assertEqual(response.status_code, 201)
        pedido = response.json()["pedido"]
        self.assertTrue(pedido["id_pedido"].startswith("PED-"))
        self.assertEqual(pedido["estado"], "pendiente_pago")
        self.assertEqual(pedido["estado_pago"], "pendiente")
        self.assertEqual(pedido["metodo_envio"], "envio_estandar")
        self.assertEqual(pedido["importe_envio"], "4.90")
        self.assertEqual(pedido["total"], "22.90")
        self.assertEqual(pedido["direccion_entrega"]["ciudad"], "Madrid")
        self.assertEqual(pedido["cliente"]["es_invitado"], True)
        self.assertEqual(pedido["lineas"][0]["cantidad_comercial"], 2)
        self.assertEqual(pedido["lineas"][0]["unidad_comercial"], "ud")
        self.assertTrue(PedidoRealModelo.objects.filter(id_pedido=pedido["id_pedido"]).exists())

    def test_detalle_pedido_real_devuelve_pedido_persistido(self) -> None:
        crear = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_base()), content_type="application/json")
        id_pedido = crear.json()["pedido"]["id_pedido"]

        detalle = self.client.get(f"/api/v1/pedidos/{id_pedido}/")

        self.assertEqual(detalle.status_code, 200)
        pedido = detalle.json()["pedido"]
        self.assertEqual(pedido["id_pedido"], id_pedido)
        self.assertEqual(pedido["resumen"]["subtotal"], "18.00")
        self.assertEqual(pedido["resumen"]["importe_envio"], "4.90")
        self.assertEqual(pedido["resumen"]["total"], "22.90")
        self.assertEqual(pedido["pago"]["id_externo_pago"], None)
        self.assertFalse(pedido["email_post_pago_enviado"])
        self.assertEqual(pedido["expedicion"]["transportista"], "")
        self.assertEqual(pedido["expedicion"]["fecha_envio"], None)
        self.assertEqual(
            pedido["estado_cliente"],
            {
                "cancelado_operativamente": False,
                "estado_reembolso": "no_iniciado",
                "fecha_reembolso": None,
            },
        )

    def test_direccion_entrega_es_obligatoria(self) -> None:
        payload = _payload_base()
        payload.pop("direccion_entrega")

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("direccion_entrega", response.json()["detalle"])

    def test_checkout_real_puede_funcionar_como_invitado(self) -> None:
        response = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_base()), content_type="application/json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["pedido"]["cliente"]["id_usuario"], None)

    def test_rechaza_producto_sin_inventario_registrado(self) -> None:
        InventarioProductoModelo.objects.filter(producto_id="prod-1").delete()

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_base()), content_type="application/json")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["codigo"], "stock_no_disponible")
        self.assertEqual(response.json()["lineas"][0]["codigo"], "inventario_no_registrado")
        self.assertFalse(PedidoRealModelo.objects.exists())

    def test_rechaza_producto_con_stock_insuficiente(self) -> None:
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.cantidad_disponible = 1
        inventario.save(update_fields=["cantidad_disponible", "fecha_actualizacion"])

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_base()), content_type="application/json")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["codigo"], "stock_no_disponible")
        self.assertEqual(response.json()["lineas"][0]["codigo"], "stock_insuficiente")
        self.assertEqual(response.json()["lineas"][0]["cantidad_disponible"], 1)
        self.assertFalse(PedidoRealModelo.objects.exists())

    def test_rechaza_unidad_comercial_invalida(self) -> None:
        payload = _payload_base()
        payload["lineas"][0]["unidad_comercial"] = "kg"

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("unidad comercial válida", response.json()["detalle"].lower())

    def test_rechaza_cantidad_no_entera(self) -> None:
        payload = _payload_base()
        payload["lineas"][0]["cantidad_comercial"] = "2"
        payload["lineas"][0].pop("cantidad")

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("entero", response.json()["detalle"].lower())

    def test_rechaza_cantidad_no_multiple_incremento_minimo_producto(self) -> None:
        producto = ProductoModelo.objects.get(id="prod-1")
        producto.unidad_comercial = "g"
        producto.incremento_minimo_venta = 50
        producto.cantidad_minima_compra = 100
        producto.save(update_fields=["unidad_comercial", "incremento_minimo_venta", "cantidad_minima_compra"])
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.unidad_base = "g"
        inventario.cantidad_disponible = 1000
        inventario.save(update_fields=["unidad_base", "cantidad_disponible", "fecha_actualizacion"])
        payload = _payload_base()
        payload["lineas"][0]["cantidad_comercial"] = 125
        payload["lineas"][0]["unidad_comercial"] = "g"
        payload["lineas"][0].pop("cantidad")

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("incremento mínimo", response.json()["detalle"].lower())

    def test_rechaza_cantidad_menor_minimo_compra_producto(self) -> None:
        producto = ProductoModelo.objects.get(id="prod-1")
        producto.unidad_comercial = "g"
        producto.incremento_minimo_venta = 50
        producto.cantidad_minima_compra = 100
        producto.save(update_fields=["unidad_comercial", "incremento_minimo_venta", "cantidad_minima_compra"])
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.unidad_base = "g"
        inventario.cantidad_disponible = 1000
        inventario.save(update_fields=["unidad_base", "cantidad_disponible", "fecha_actualizacion"])
        payload = _payload_base()
        payload["lineas"][0]["cantidad_comercial"] = 50
        payload["lineas"][0]["unidad_comercial"] = "g"
        payload["lineas"][0].pop("cantidad")

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("cantidad mínima", response.json()["detalle"].lower())

    def test_rechaza_unidad_linea_distinta_unidad_comercial_producto(self) -> None:
        producto = ProductoModelo.objects.get(id="prod-1")
        producto.unidad_comercial = "g"
        producto.incremento_minimo_venta = 50
        producto.cantidad_minima_compra = 100
        producto.save(update_fields=["unidad_comercial", "incremento_minimo_venta", "cantidad_minima_compra"])
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.unidad_base = "g"
        inventario.cantidad_disponible = 1000
        inventario.save(update_fields=["unidad_base", "cantidad_disponible", "fecha_actualizacion"])
        payload = _payload_base()
        payload["lineas"][0]["cantidad_comercial"] = 100
        payload["lineas"][0]["unidad_comercial"] = "ud"
        payload["lineas"][0].pop("cantidad")

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("unidad de línea", response.json()["detalle"].lower())

    def test_crear_pedido_real_granel_valido(self) -> None:
        producto = ProductoModelo.objects.get(id="prod-1")
        producto.unidad_comercial = "g"
        producto.incremento_minimo_venta = 50
        producto.cantidad_minima_compra = 100
        producto.save(update_fields=["unidad_comercial", "incremento_minimo_venta", "cantidad_minima_compra"])
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.unidad_base = "g"
        inventario.cantidad_disponible = 1000
        inventario.save(update_fields=["unidad_base", "cantidad_disponible", "fecha_actualizacion"])
        payload = _payload_base()
        payload["lineas"][0]["cantidad_comercial"] = 150
        payload["lineas"][0]["unidad_comercial"] = "g"
        payload["lineas"][0].pop("cantidad")

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["pedido"]["lineas"][0]["cantidad_comercial"], 150)
        self.assertEqual(response.json()["pedido"]["lineas"][0]["unidad_comercial"], "g")

    def test_rechaza_pedido_completo_si_una_linea_falla_stock(self) -> None:
        ProductoModelo.objects.create(
            id="prod-2",
            sku="SKU-PROD-2",
            slug="vela-intencion-clara",
            nombre="Vela intención clara",
            tipo_producto="ritual",
            categoria_comercial="velas",
        )
        InventarioProductoModelo.objects.create(producto_id="prod-2", cantidad_disponible=0)
        payload = _payload_base()
        payload["lineas"].append(
            {
                "id_producto": "prod-2",
                "slug_producto": "vela-intencion-clara",
                "nombre_producto": "Vela intención clara",
                "cantidad": 1,
                "precio_unitario": "12.00",
                "moneda": "EUR",
            }
        )

        response = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(len(response.json()["lineas"]), 1)
        self.assertEqual(response.json()["lineas"][0]["id_producto"], "prod-2")
        self.assertFalse(PedidoRealModelo.objects.exists())

    def test_flujo_demo_legacy_sigue_operativo(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps(
                {
                    "email": "demo@legacy.test",
                    "canal": "invitado",
                    "lineas": [
                        {
                            "id_producto": "prod-legacy",
                            "slug_producto": "melisa-a-granel-50g",
                            "nombre_producto": "Melisa a granel 50g",
                            "cantidad": 1,
                            "precio_unitario_demo": "5.00",
                        }
                    ],
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["pedido"]["estado"], "creado")


def _payload_base() -> dict:
    return {
        "email_contacto": "real@test.dev",
        "nombre_contacto": "Lore",
        "telefono_contacto": "600111222",
        "canal_checkout": "web_invitado",
        "direccion_entrega": {
            "nombre_destinatario": "Lore",
            "linea_1": "Calle Luna 1",
            "codigo_postal": "28001",
            "ciudad": "Madrid",
            "provincia": "Madrid",
            "pais_iso": "ES",
            "observaciones": "Portal azul",
        },
        "notas_cliente": "Dejar en horario de tarde.",
        "moneda": "EUR",
        "lineas": [
            {
                "id_producto": "prod-1",
                "slug_producto": "tarot-bosque-interior",
                "nombre_producto": "Tarot bosque interior",
                "cantidad": 2,
                "precio_unitario": "9.00",
                "moneda": "EUR",
            }
        ],
    }


def _crear_producto_con_inventario() -> None:
    ProductoModelo.objects.create(
        id="prod-1",
        sku="SKU-PROD-1",
        slug="tarot-bosque-interior",
        nombre="Tarot bosque interior",
        tipo_producto="tarot",
        categoria_comercial="oraculos",
    )
    InventarioProductoModelo.objects.create(producto_id="prod-1", cantidad_disponible=5)
