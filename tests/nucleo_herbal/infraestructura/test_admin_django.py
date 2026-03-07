import unittest

try:
    from django.contrib import admin
    from django.contrib.auth import get_user_model
    from django.test import TestCase
    from django.urls import reverse

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
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

    def test_admin_site_registra_modelos_ciclo_1(self) -> None:
        self.assertTrue(admin.site.is_registered(IntencionModelo))
        self.assertTrue(admin.site.is_registered(PlantaModelo))
        self.assertTrue(admin.site.is_registered(ProductoModelo))

    def test_superusuario_puede_abrir_index_admin(self) -> None:
        self.client.force_login(self.superusuario)

        response = self.client.get(reverse("admin:index"))

        self.assertEqual(response.status_code, 200)

    def test_superusuario_puede_abrir_changelists_minimos(self) -> None:
        self.client.force_login(self.superusuario)

        vistas = [
            reverse("admin:persistencia_django_intencionmodelo_changelist"),
            reverse("admin:persistencia_django_plantamodelo_changelist"),
            reverse("admin:persistencia_django_productomodelo_changelist"),
        ]

        for vista in vistas:
            with self.subTest(vista=vista):
                response = self.client.get(vista)
                self.assertEqual(response.status_code, 200)
