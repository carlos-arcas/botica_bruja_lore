import unittest

try:
    from django.test import TestCase as DjangoTestCase
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
    )

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestExposicionPublicaNucleoHerbal(DjangoTestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        cls.intencion_calma = IntencionModelo.objects.create(
            id="int-1",
            slug="calma",
            nombre="Calma",
            descripcion="Foco editorial",
            es_publica=True,
        )
        cls.intencion_privada = IntencionModelo.objects.create(
            id="int-2",
            slug="secreto",
            nombre="Secreto",
            descripcion="No debe salir",
            es_publica=False,
        )
        cls.planta_melisa = PlantaModelo.objects.create(
            id="pla-1",
            slug="melisa",
            nombre="Melisa",
            descripcion_breve="Planta aromática tradicional.",
            publicada=True,
        )
        cls.planta_melisa.intenciones.set([cls.intencion_calma, cls.intencion_privada])
        cls.planta_oculta = PlantaModelo.objects.create(
            id="pla-2",
            slug="oculta",
            nombre="Oculta",
            descripcion_breve="No publicada.",
            publicada=False,
        )
        cls.planta_oculta.intenciones.set([cls.intencion_calma])
        ProductoModelo.objects.create(
            id="pro-1",
            sku="HERB-001",
            slug="melisa-a-granel-50g",
            nombre="Melisa a granel 50g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=cls.planta_melisa,
            publicado=True,
        )
        ProductoModelo.objects.create(
            id="pro-2",
            sku="HERB-002",
            slug="melisa-a-granel-100g",
            nombre="Melisa a granel 100g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=cls.planta_melisa,
            publicado=False,
        )
        ProductoModelo.objects.create(
            id="pro-3",
            sku="RIT-001",
            slug="vela-ritual",
            nombre="Vela ritual",
            tipo_producto="herramientas-rituales",
            categoria_comercial="herramientas-esotericas",
            planta=None,
            publicado=True,
        )

    def test_listado_herbal_publica_solo_plantas_navegables(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["plantas"]), 1)
        self.assertEqual(data["plantas"][0]["slug"], "melisa")
        self.assertEqual(data["plantas"][0]["descripcion_breve"], "Planta aromática tradicional.")
        self.assertEqual(len(data["plantas"][0]["intenciones"]), 1)
        self.assertEqual(data["plantas"][0]["intenciones"][0]["slug"], "calma")

    def test_detalle_planta_resuelve_slug_existente(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/melisa/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["planta"]["nombre"], "Melisa")
        self.assertEqual(data["planta"]["slug"], "melisa")

    def test_detalle_planta_inexistente_devuelve_404(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/inexistente/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("Planta no encontrada", response.json()["detalle"])

    def test_productos_por_planta_filtra_publicados_y_tipo_herbal(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/melisa/productos/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["planta_slug"], "melisa")
        self.assertEqual(len(data["productos"]), 1)
        self.assertEqual(data["productos"][0]["sku"], "HERB-001")

    def test_relaciones_por_intencion_expone_plantas_asociadas(self) -> None:
        response = self.client.get("/api/v1/herbal/intenciones/calma/plantas/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intencion"]["slug"], "calma")
        self.assertEqual(data["plantas"][0]["slug"], "melisa")

    def test_relaciones_por_intencion_sin_plantas_devuelve_404(self) -> None:
        response = self.client.get("/api/v1/herbal/intenciones/inexistente/plantas/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("Intención", response.json()["detalle"])
