import json
import unittest

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    PedidoRealModelo = None
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestApiPedidosReal(DjangoTestCase):
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
        self.assertEqual(pedido["direccion_entrega"]["ciudad"], "Madrid")
        self.assertEqual(pedido["cliente"]["es_invitado"], True)
        self.assertTrue(PedidoRealModelo.objects.filter(id_pedido=pedido["id_pedido"]).exists())

    def test_detalle_pedido_real_devuelve_pedido_persistido(self) -> None:
        crear = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_base()), content_type="application/json")
        id_pedido = crear.json()["pedido"]["id_pedido"]

        detalle = self.client.get(f"/api/v1/pedidos/{id_pedido}/")

        self.assertEqual(detalle.status_code, 200)
        pedido = detalle.json()["pedido"]
        self.assertEqual(pedido["id_pedido"], id_pedido)
        self.assertEqual(pedido["resumen"]["subtotal"], "18.00")
        self.assertEqual(pedido["pago"]["id_externo_pago"], None)
        self.assertFalse(pedido["email_post_pago_enviado"])

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
