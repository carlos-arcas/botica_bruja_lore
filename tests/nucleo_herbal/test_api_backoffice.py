import json

from django.contrib.auth import get_user_model
from django.test import TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import LineaPedidoRealModelo, PedidoRealModelo


class ApiBackofficeTests(TestCase):
    def setUp(self) -> None:
        self.user_model = get_user_model()
        self.staff = self.user_model.objects.create_user(
            username="staff",
            password="clave-segura",
            is_staff=True,
        )
        ProductoModelo.objects.create(
            id="pro-1",
            sku="SKU-001",
            slug="producto-demo-1",
            nombre="Producto Demo 1",
            tipo_producto="hierba",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            precio_visible="8,90 €",
            publicado=True,
        )
        ProductoModelo.objects.create(
            id="pro-2",
            sku="SKU-002",
            slug="producto-demo-2",
            nombre="Producto Demo 2",
            tipo_producto="ritual",
            categoria_comercial="esoterico",
            seccion_publica="rituales",
            precio_visible="12,00 €",
            publicado=False,
        )
        pedido = PedidoRealModelo.objects.create(
            id_pedido="PED-ADMIN-1",
            estado="pagado",
            estado_pago="pagado",
            canal_checkout="web_invitado",
            email_contacto="pedidos@test.dev",
            nombre_contacto="Lore",
            telefono_contacto="600111222",
            es_invitado=True,
            moneda="EUR",
            subtotal="12.00",
            direccion_entrega={"nombre_destinatario": "Lore", "linea_1": "Calle", "codigo_postal": "28001", "ciudad": "Madrid", "provincia": "Madrid", "pais_iso": "ES"},
            fecha_creacion="2026-03-19T00:00:00Z",
            requiere_revision_manual=True,
        )
        LineaPedidoRealModelo.objects.create(
            pedido=pedido,
            id_producto="prod-1",
            slug_producto="tarot-bosque-interior",
            nombre_producto="Tarot bosque interior",
            cantidad=1,
            precio_unitario="12.00",
            moneda="EUR",
        )

    def test_estado_backoffice_rechaza_usuario_no_autenticado(self) -> None:
        response = self.client.get("/api/v1/backoffice/estado/")
        self.assertIn(response.status_code, (302, 403))

    def test_estado_backoffice_permite_staff(self) -> None:
        self.client.force_login(self.staff)
        response = self.client.get("/api/v1/backoffice/estado/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["autorizado"])

    def test_listado_productos_aplica_filtro_publicado(self) -> None:
        self.client.force_login(self.staff)
        response = self.client.get("/api/v1/backoffice/productos/?publicado=true")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["metricas"]["total"], 1)
        self.assertEqual(data["productos"][0]["slug"], "producto-demo-1")

    def test_listado_pedidos_reales_operativos(self) -> None:
        self.client.force_login(self.staff)
        response = self.client.get("/api/v1/backoffice/pedidos/")
        self.assertEqual(response.status_code, 200)
        pedido = response.json()["items"][0]
        self.assertEqual(pedido["id_pedido"], "PED-ADMIN-1")
        self.assertTrue(pedido["requiere_revision_manual"])

    def test_se_puede_marcar_primer_avance_administrativo(self) -> None:
        self.client.force_login(self.staff)
        response = self.client.post(
            "/api/v1/backoffice/pedidos/PED-ADMIN-1/preparando/",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        PedidoRealModelo.objects.get(id_pedido="PED-ADMIN-1", estado="preparando")

