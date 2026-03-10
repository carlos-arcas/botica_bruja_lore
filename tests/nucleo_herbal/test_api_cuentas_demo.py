import json
import unittest
from datetime import UTC, datetime
from decimal import Decimal

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        CuentaDemoModelo,
        LineaPedidoModelo,
        PedidoDemoModelo,
    )

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestApiCuentasDemo(DjangoTestCase):
    def test_registro_cuenta_demo_valido(self) -> None:
        response = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "lore@cuenta.test",
                    "nombre_visible": "Lore",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        cuenta = response.json()["cuenta"]
        self.assertEqual(cuenta["email"], "lore@cuenta.test")
        self.assertEqual(cuenta["nombre_visible"], "Lore")

    def test_autenticacion_demo_valida(self) -> None:
        cuenta = CuentaDemoModelo.objects.create(
            id_usuario="USR-API-1",
            email="lore@auth.test",
            nombre_visible="Lore",
            clave_acceso_demo="clave-demo",
        )

        response = self.client.post(
            "/api/v1/cuentas-demo/autenticacion/",
            data=json.dumps(
                {
                    "email": cuenta.email,
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()["cuenta"]
        self.assertEqual(data["id_usuario"], cuenta.id_usuario)

    def test_autenticacion_demo_invalida(self) -> None:
        CuentaDemoModelo.objects.create(
            id_usuario="USR-API-2",
            email="lore@invalida.test",
            nombre_visible="Lore",
            clave_acceso_demo="clave-real",
        )

        response = self.client.post(
            "/api/v1/cuentas-demo/autenticacion/",
            data=json.dumps(
                {
                    "email": "lore@invalida.test",
                    "clave_acceso_demo": "clave-mala",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)

    def test_perfil_existente_e_inexistente(self) -> None:
        CuentaDemoModelo.objects.create(
            id_usuario="USR-PERFIL",
            email="perfil@demo.test",
            nombre_visible="Perfil",
            clave_acceso_demo="clave-demo",
        )

        response_ok = self.client.get("/api/v1/cuentas-demo/USR-PERFIL/perfil/")
        response_no = self.client.get("/api/v1/cuentas-demo/USR-FALTA/perfil/")

        self.assertEqual(response_ok.status_code, 200)
        self.assertEqual(response_ok.json()["perfil"]["email"], "perfil@demo.test")
        self.assertEqual(response_no.status_code, 404)

    def test_historial_vacio_y_con_pedidos_asociados(self) -> None:
        CuentaDemoModelo.objects.create(
            id_usuario="USR-HIST",
            email="historial@demo.test",
            nombre_visible="Historial",
            clave_acceso_demo="clave-demo",
        )

        response_vacio = self.client.get("/api/v1/cuentas-demo/USR-HIST/historial-pedidos/")
        self.assertEqual(response_vacio.status_code, 200)
        self.assertEqual(response_vacio.json()["pedidos"], [])

        pedido_1 = PedidoDemoModelo.objects.create(
            id_pedido="PD-HIST-1",
            fecha_creacion=datetime(2026, 1, 1, tzinfo=UTC),
            email_contacto="otra@demo.test",
            canal_compra="autenticado",
            estado="creado",
            id_usuario="USR-HIST",
        )
        pedido_2 = PedidoDemoModelo.objects.create(
            id_pedido="PD-HIST-2",
            fecha_creacion=datetime(2026, 1, 2, tzinfo=UTC),
            email_contacto="historial@demo.test",
            canal_compra="invitado",
            estado="confirmado",
        )
        for pedido in (pedido_1, pedido_2):
            LineaPedidoModelo.objects.create(
                pedido=pedido,
                id_producto="prod-1",
                slug_producto="melisa-a-granel-50g",
                nombre_producto="Melisa",
                cantidad=1,
                precio_unitario_demo=Decimal("5.00"),
            )

        response = self.client.get("/api/v1/cuentas-demo/USR-HIST/historial-pedidos/")

        self.assertEqual(response.status_code, 200)
        pedidos = response.json()["pedidos"]
        self.assertEqual(len(pedidos), 2)
        self.assertEqual({item["id_pedido"] for item in pedidos}, {"PD-HIST-1", "PD-HIST-2"})

    def test_payload_invalido_en_registro(self) -> None:
        response = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps({"email": "sin-nombre@test.dev"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("nombre_visible", response.json()["detalle"])
