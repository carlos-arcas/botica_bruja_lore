import os
import unittest
from datetime import UTC, datetime
from decimal import Decimal

try:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")

    import django

    django.setup()

    from django.contrib import admin
    from django.contrib.auth import get_user_model
    from django.test import TestCase
    from django.urls import reverse

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        CuentaDemoModelo,
        IntencionModelo,
        InventarioProductoModelo,
        LineaPedidoModelo,
        PedidoDemoModelo,
        PlantaModelo,
        ProductoModelo,
        RitualModelo,
    )

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    TestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestAdminNucleoHerbal(TestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        cls.superusuario = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@botica.dev",
            password="demo-admin",
        )
        cls.inventario = InventarioProductoModelo.objects.create(
            producto=ProductoModelo.objects.create(
                id="prod-admin-1",
                sku="INV-001",
                slug="producto-inventario-admin",
                nombre="Producto inventario admin",
                tipo_producto="herramientas-rituales",
                categoria_comercial="botica",
                publicado=True,
            ),
            cantidad_disponible=2,
            umbral_bajo_stock=3,
        )
        cls.pedido = PedidoDemoModelo.objects.create(
            id_pedido="PD-ADMIN-0001",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            estado="creado",
            fecha_creacion=datetime(2026, 1, 1, tzinfo=UTC),
        )
        LineaPedidoModelo.objects.create(
            pedido=cls.pedido,
            id_producto="prod-1",
            slug_producto="melisa-a-granel-50g",
            nombre_producto="Melisa a granel 50g",
            cantidad=2,
            precio_unitario_demo=Decimal("5.00"),
        )

    def test_admin_site_registra_modelos_ciclo_1_2_y_prompt_4(self) -> None:
        self.assertTrue(admin.site.is_registered(CuentaDemoModelo))
        self.assertTrue(admin.site.is_registered(IntencionModelo))
        self.assertTrue(admin.site.is_registered(PlantaModelo))
        self.assertTrue(admin.site.is_registered(ProductoModelo))
        self.assertTrue(admin.site.is_registered(RitualModelo))
        self.assertTrue(admin.site.is_registered(PedidoDemoModelo))
        self.assertTrue(admin.site.is_registered(InventarioProductoModelo))

    def test_superusuario_puede_abrir_index_admin(self) -> None:
        self.client.force_login(self.superusuario)

        response = self.client.get(reverse("admin:index"))

        self.assertEqual(response.status_code, 200)

    def test_superusuario_puede_abrir_changelists_minimos(self) -> None:
        self.client.force_login(self.superusuario)

        vistas = [
            reverse("admin:persistencia_django_cuentademomodelo_changelist"),
            reverse("admin:persistencia_django_intencionmodelo_changelist"),
            reverse("admin:persistencia_django_plantamodelo_changelist"),
            reverse("admin:persistencia_django_productomodelo_changelist"),
            reverse("admin:persistencia_django_inventarioproductomodelo_changelist"),
            reverse("admin:persistencia_django_pedidodemomodelo_changelist"),
        ]

        for vista in vistas:
            with self.subTest(vista=vista):
                response = self.client.get(vista)
                self.assertEqual(response.status_code, 200)

    def test_superusuario_puede_abrir_changelist_ritual(self) -> None:
        self.client.force_login(self.superusuario)

        response = self.client.get(reverse("admin:persistencia_django_ritualmodelo_changelist"))

        self.assertEqual(response.status_code, 200)

    def test_changelist_pedidos_demo_permita_busqueda_y_filtro(self) -> None:
        self.client.force_login(self.superusuario)

        response = self.client.get(
            reverse("admin:persistencia_django_pedidodemomodelo_changelist"),
            {"q": "PD-ADMIN-0001", "estado": "creado", "canal_compra": "invitado"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "PD-ADMIN-0001")

    def test_change_pedido_demo_muestra_lineas_y_permite_actualizar_estado(self) -> None:
        self.client.force_login(self.superusuario)
        url = reverse("admin:persistencia_django_pedidodemomodelo_change", args=["PD-ADMIN-0001"])

        respuesta_get = self.client.get(url)

        self.assertEqual(respuesta_get.status_code, 200)
        self.assertContains(respuesta_get, "Melisa a granel 50g")

        respuesta_post = self.client.post(
            url,
            {
                "email_contacto": "demo@lore.test",
                "canal_compra": "invitado",
                "estado": "confirmado",
                "fecha_creacion_0": "2026-01-01",
                "fecha_creacion_1": "00:00:00",
                "id_usuario": "",
                "lineas-TOTAL_FORMS": "1",
                "lineas-INITIAL_FORMS": "1",
                "lineas-MIN_NUM_FORMS": "0",
                "lineas-MAX_NUM_FORMS": "1000",
                "lineas-0-id": str(self.pedido.lineas.first().id),
                "lineas-0-pedido": "PD-ADMIN-0001",
                "lineas-0-id_producto": "prod-1",
                "lineas-0-slug_producto": "melisa-a-granel-50g",
                "lineas-0-nombre_producto": "Melisa a granel 50g",
                "lineas-0-cantidad": "2",
                "lineas-0-precio_unitario_demo": "5.00",
                "_save": "Guardar",
            },
        )

        self.assertEqual(respuesta_post.status_code, 302)
        self.pedido.refresh_from_db()
        self.assertEqual(self.pedido.estado, "confirmado")

    def test_changelist_inventario_permita_busqueda_y_filtro_visual_bajo_stock(self) -> None:
        self.client.force_login(self.superusuario)

        response = self.client.get(
            reverse("admin:persistencia_django_inventarioproductomodelo_changelist"),
            {"q": "INV-001"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Producto inventario admin")
        self.assertContains(response, "icon-yes.svg")
