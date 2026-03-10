import json
from decimal import Decimal

from django.test import TestCase

from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo
from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios import RepositorioPedidosDemoORM


class TestApiCuentasDemo(TestCase):
    def test_registro_cuenta_demo_valido(self) -> None:
        response = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        cuenta = response.json()["cuenta"]
        self.assertEqual(cuenta["email"], "lore@test.dev")
        self.assertEqual(cuenta["nombre_visible"], "Lore")
        self.assertTrue(cuenta["id_usuario"].startswith("USR-"))

    def test_registro_cuenta_demo_payload_invalido(self) -> None:
        response = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data="[]",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("payload", response.json()["detalle"].lower())

    def test_autenticacion_demo_valida(self) -> None:
        registro = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(registro.status_code, 201)

        response = self.client.post(
            "/api/v1/cuentas-demo/autenticacion/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        cuenta = response.json()["cuenta"]
        self.assertEqual(cuenta["email"], "lore@test.dev")

    def test_autenticacion_demo_invalida(self) -> None:
        self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )

        response = self.client.post(
            "/api/v1/cuentas-demo/autenticacion/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "clave_acceso_demo": "clave-incorrecta",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)

    def test_perfil_existente_e_inexistente(self) -> None:
        registro = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )
        id_usuario = registro.json()["cuenta"]["id_usuario"]

        response_ok = self.client.get(f"/api/v1/cuentas-demo/{id_usuario}/perfil/")
        self.assertEqual(response_ok.status_code, 200)
        self.assertEqual(response_ok.json()["perfil"]["id_usuario"], id_usuario)

        response_not_found = self.client.get("/api/v1/cuentas-demo/USR-no-existe/perfil/")
        self.assertEqual(response_not_found.status_code, 404)

    def test_historial_vacio(self) -> None:
        registro = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )
        id_usuario = registro.json()["cuenta"]["id_usuario"]

        response = self.client.get(f"/api/v1/cuentas-demo/{id_usuario}/pedidos-demo/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pedidos"], [])

    def test_historial_con_pedidos_asociados_por_usuario_y_email(self) -> None:
        registro = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@test.dev",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )
        id_usuario = registro.json()["cuenta"]["id_usuario"]

        repo = RepositorioPedidosDemoORM()
        repo.guardar(
            PedidoDemo(
                id_pedido="PD-HIST-1",
                email_contacto="otro@test.dev",
                canal_compra="autenticado",
                id_usuario=id_usuario,
                lineas=(
                    LineaPedido(
                        id_producto="prod-1",
                        slug_producto="melisa-a-granel-50g",
                        nombre_producto="Melisa",
                        cantidad=2,
                        precio_unitario_demo=Decimal("5.00"),
                    ),
                ),
            )
        )
        repo.guardar(
            PedidoDemo(
                id_pedido="PD-HIST-2",
                email_contacto="lore@test.dev",
                canal_compra="invitado",
                lineas=(
                    LineaPedido(
                        id_producto="prod-2",
                        slug_producto="lavanda-a-granel-50g",
                        nombre_producto="Lavanda",
                        cantidad=1,
                        precio_unitario_demo=Decimal("7.00"),
                    ),
                ),
            )
        )

        response = self.client.get(f"/api/v1/cuentas-demo/{id_usuario}/pedidos-demo/")

        self.assertEqual(response.status_code, 200)
        pedidos = response.json()["pedidos"]
        self.assertEqual(len(pedidos), 2)
        self.assertEqual({item["id_pedido"] for item in pedidos}, {"PD-HIST-1", "PD-HIST-2"})
