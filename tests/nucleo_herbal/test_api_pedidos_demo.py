import json
import unittest

try:
    from django.test import TestCase as DjangoTestCase

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestApiPedidosDemo(DjangoTestCase):
    def test_crear_pedido_demo_valido(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps(
                {
                    "email": "demo@lore.test",
                    "canal": "invitado",
                    "lineas": [
                        {
                            "id_producto": "prod-1",
                            "slug_producto": "melisa-a-granel-50g",
                            "nombre_producto": "Melisa a granel 50g",
                            "cantidad": 2,
                            "precio_unitario_demo": "5.50",
                        }
                    ],
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()["pedido"]
        self.assertTrue(data["id_pedido"].startswith("PD-"))
        self.assertEqual(data["estado"], "creado")
        self.assertEqual(data["resumen"]["cantidad_total_items"], 2)
        self.assertEqual(data["resumen"]["subtotal_demo"], "11.00")

    def test_crear_pedido_demo_payload_invalido(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data="[]",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("payload", response.json()["detalle"].lower())

    def test_crear_pedido_demo_linea_invalida(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps(
                {
                    "email": "demo@lore.test",
                    "canal": "invitado",
                    "lineas": [
                        {
                            "id_producto": "prod-1",
                            "slug_producto": "melisa-a-granel-50g",
                            "nombre_producto": "Melisa a granel 50g",
                            "cantidad": 0,
                            "precio_unitario_demo": "5.50",
                        }
                    ],
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("cantidad", response.json()["detalle"].lower())

    def test_crear_pedido_demo_canal_autenticado_sin_usuario(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps(
                {
                    "email": "demo@lore.test",
                    "canal": "autenticado",
                    "lineas": [
                        {
                            "id_producto": "prod-1",
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

        self.assertEqual(response.status_code, 400)
        self.assertIn("id de usuario", response.json()["detalle"].lower())

    def test_obtener_pedido_demo_existente(self) -> None:
        crear = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps(
                {
                    "email": "demo@lore.test",
                    "canal": "autenticado",
                    "id_usuario": "usr-001",
                    "lineas": [
                        {
                            "id_producto": "prod-1",
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
        id_pedido = crear.json()["pedido"]["id_pedido"]

        response = self.client.get(f"/api/v1/pedidos-demo/{id_pedido}/")

        self.assertEqual(response.status_code, 200)
        data = response.json()["pedido"]
        self.assertEqual(data["id_pedido"], id_pedido)
        self.assertEqual(data["canal"], "autenticado")

    def test_obtener_pedido_demo_inexistente(self) -> None:
        response = self.client.get("/api/v1/pedidos-demo/PD-no-existe/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("no encontrado", response.json()["detalle"].lower())
