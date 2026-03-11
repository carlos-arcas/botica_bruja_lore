import json
import unittest
from datetime import UTC, date, datetime
from decimal import Decimal

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        CuentaDemoModelo,
        IntencionModelo,
        LineaPedidoModelo,
        PedidoDemoModelo,
        ReglaCalendarioModelo,
        RitualModelo,
    )

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestContratosApiPublicaDemoConsumidaFrontend(DjangoTestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        cls.cuenta = CuentaDemoModelo.objects.create(
            id_usuario="USR-CONTRATO-1",
            email="contrato@lore.test",
            nombre_visible="Lore Contrato",
            clave_acceso_demo="clave-demo",
        )

        cls.pedido = PedidoDemoModelo.objects.create(
            id_pedido="PD-CONTRATO-1",
            fecha_creacion=datetime(2026, 3, 22, tzinfo=UTC),
            email_contacto=cls.cuenta.email,
            canal_compra="autenticado",
            estado="creado",
            id_usuario=cls.cuenta.id_usuario,
        )
        LineaPedidoModelo.objects.create(
            pedido=cls.pedido,
            id_producto="prod-1",
            slug_producto="melisa-a-granel-50g",
            nombre_producto="Melisa a granel 50g",
            cantidad=2,
            precio_unitario_demo=Decimal("5.50"),
        )

        intencion = IntencionModelo.objects.create(
            id="int-cal-contrato",
            slug="calma-calendario",
            nombre="Calma calendario",
            descripcion="Cobertura contractual calendario.",
            es_publica=True,
        )
        ritual = RitualModelo.objects.create(
            id="rit-cal-contrato",
            slug="ritual-calendario-contrato",
            nombre="Ritual calendario contrato",
            contexto_breve="Ritual activo para pruebas de contrato.",
            publicado=True,
        )
        ritual.intenciones.set([intencion])
        ReglaCalendarioModelo.objects.create(
            id="regla-cal-contrato",
            ritual=ritual,
            nombre="Ventana de prueba contractual",
            fecha_inicio=date(2026, 3, 20),
            fecha_fin=date(2026, 3, 25),
            prioridad=10,
            activa=True,
        )

    def test_contrato_crear_pedido_demo_publico_ok(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps(
                {
                    "email": "nuevo@lore.test",
                    "canal": "invitado",
                    "lineas": [
                        {
                            "id_producto": "prod-2",
                            "slug_producto": "romero-a-granel-50g",
                            "nombre_producto": "Romero a granel 50g",
                            "cantidad": 1,
                            "precio_unitario_demo": "4.50",
                        }
                    ],
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        pedido = response.json()["pedido"]
        self.assertTrue({"id_pedido", "estado", "canal", "email", "resumen", "lineas"}.issubset(pedido.keys()))
        self.assertTrue({"cantidad_total_items", "subtotal_demo"}.issubset(pedido["resumen"].keys()))
        self.assertTrue(
            {"id_producto", "slug_producto", "nombre_producto", "cantidad", "precio_unitario_demo", "subtotal_demo"}.issubset(
                pedido["lineas"][0].keys()
            )
        )

    def test_contrato_crear_pedido_demo_publico_error_detalle(self) -> None:
        response = self.client.post(
            "/api/v1/pedidos-demo/",
            data=json.dumps({"email": "sin-lineas@lore.test", "canal": "invitado"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(response["Content-Type"].startswith("application/json"))
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"detalle"})
        self.assertIsInstance(payload["detalle"], str)

    def test_contrato_detalle_pedido_demo_publico_ok_y_404(self) -> None:
        response_ok = self.client.get(f"/api/v1/pedidos-demo/{self.pedido.id_pedido}/")
        self.assertEqual(response_ok.status_code, 200)
        pedido = response_ok.json()["pedido"]
        self.assertTrue({"id_pedido", "estado", "canal", "email", "resumen", "lineas"}.issubset(pedido.keys()))

        response_404 = self.client.get("/api/v1/pedidos-demo/PD-NO-EXISTE/")
        self.assertEqual(response_404.status_code, 404)
        self.assertTrue(response_404["Content-Type"].startswith("application/json"))
        self.assertEqual(set(response_404.json().keys()), {"detalle"})

    def test_contrato_email_demo_pedido_publico_ok_y_404(self) -> None:
        response_ok = self.client.get(f"/api/v1/pedidos-demo/{self.pedido.id_pedido}/email-demo/")
        self.assertEqual(response_ok.status_code, 200)
        email_demo = response_ok.json()["email_demo"]
        self.assertTrue(
            {
                "id_pedido",
                "estado",
                "canal",
                "email_destino",
                "asunto",
                "cuerpo_texto",
                "subtotal_demo",
                "lineas",
                "es_simulacion",
            }.issubset(email_demo.keys())
        )

        response_404 = self.client.get("/api/v1/pedidos-demo/PD-NO-EXISTE/email-demo/")
        self.assertEqual(response_404.status_code, 404)
        self.assertTrue(response_404["Content-Type"].startswith("application/json"))
        self.assertEqual(set(response_404.json().keys()), {"detalle"})

    def test_contrato_cuenta_demo_registro_y_autenticacion_ok(self) -> None:
        registro = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps(
                {
                    "email": "nueva-cuenta@lore.test",
                    "nombre_visible": "Nueva Cuenta",
                    "clave_acceso_demo": "clave-demo",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(registro.status_code, 201)
        self.assertTrue({"id_usuario", "email", "nombre_visible"}.issubset(registro.json()["cuenta"].keys()))

        login = self.client.post(
            "/api/v1/cuentas-demo/autenticacion/",
            data=json.dumps({"email": self.cuenta.email, "clave_acceso_demo": "clave-demo"}),
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertTrue({"id_usuario", "email", "nombre_visible"}.issubset(login.json()["cuenta"].keys()))

    def test_contrato_cuenta_demo_errores_relevantes_para_frontend(self) -> None:
        auth_invalida = self.client.post(
            "/api/v1/cuentas-demo/autenticacion/",
            data=json.dumps({"email": self.cuenta.email, "clave_acceso_demo": "clave-incorrecta"}),
            content_type="application/json",
        )
        self.assertEqual(auth_invalida.status_code, 401)
        self.assertTrue(auth_invalida["Content-Type"].startswith("application/json"))
        self.assertEqual(set(auth_invalida.json().keys()), {"detalle"})

        perfil_404 = self.client.get("/api/v1/cuentas-demo/USR-NO-EXISTE/perfil/")
        self.assertEqual(perfil_404.status_code, 404)
        self.assertTrue(perfil_404["Content-Type"].startswith("application/json"))
        self.assertEqual(set(perfil_404.json().keys()), {"detalle"})

    def test_contrato_perfil_e_historial_cuenta_demo_ok(self) -> None:
        perfil = self.client.get(f"/api/v1/cuentas-demo/{self.cuenta.id_usuario}/perfil/")
        self.assertEqual(perfil.status_code, 200)
        self.assertTrue({"id_usuario", "email", "nombre_visible"}.issubset(perfil.json()["perfil"].keys()))

        historial = self.client.get(f"/api/v1/cuentas-demo/{self.cuenta.id_usuario}/historial-pedidos/")
        self.assertEqual(historial.status_code, 200)
        data = historial.json()
        self.assertTrue({"id_usuario", "pedidos"}.issubset(data.keys()))
        self.assertIsInstance(data["pedidos"], list)
        self.assertGreaterEqual(len(data["pedidos"]), 1)
        self.assertTrue({"id_pedido", "estado", "canal", "email", "resumen"}.issubset(data["pedidos"][0].keys()))

    def test_contrato_calendario_ritual_publico_ok_y_error_formato(self) -> None:
        response_ok = self.client.get("/api/v1/calendario-ritual/?fecha=2026-03-22")
        self.assertEqual(response_ok.status_code, 200)
        payload = response_ok.json()
        self.assertEqual(set(payload.keys()), {"fecha_consulta", "rituales"})
        self.assertIsInstance(payload["rituales"], list)
        self.assertGreaterEqual(len(payload["rituales"]), 1)
        self.assertTrue(
            {"slug", "nombre", "contexto_breve", "nombre_regla", "prioridad"}.issubset(payload["rituales"][0].keys())
        )

        response_error = self.client.get("/api/v1/calendario-ritual/?fecha=22-03-2026")
        self.assertEqual(response_error.status_code, 400)
        self.assertTrue(response_error["Content-Type"].startswith("application/json"))
        self.assertEqual(set(response_error.json().keys()), {"detalle"})

    def test_contrato_calendario_ritual_error_falta_fecha_json(self) -> None:
        response = self.client.get("/api/v1/calendario-ritual/")

        self.assertEqual(response.status_code, 400)
        self.assertTrue(response["Content-Type"].startswith("application/json"))
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"detalle"})
        self.assertIsInstance(payload["detalle"], str)

