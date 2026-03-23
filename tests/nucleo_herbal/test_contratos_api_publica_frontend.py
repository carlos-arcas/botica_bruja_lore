import unittest

try:
    from django.test import TestCase as DjangoTestCase
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
        RitualModelo,
    )

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestContratosApiPublicaConsumidaFrontend(DjangoTestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        intencion = IntencionModelo.objects.create(
            id="int-1",
            slug="calma",
            nombre="Calma",
            descripcion="Foco editorial",
            es_publica=True,
        )
        cls.planta = PlantaModelo.objects.create(
            id="pla-1",
            slug="melisa",
            nombre="Melisa",
            descripcion_breve="Planta aromática tradicional.",
            publicada=True,
        )
        cls.planta.intenciones.set([intencion])
        cls.producto = ProductoModelo.objects.create(
            id="pro-1",
            sku="HERB-001",
            slug="melisa-a-granel-50g",
            nombre="Melisa a granel 50g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=cls.planta,
            publicado=True,
        )
        cls.ritual = RitualModelo.objects.create(
            id="rit-1",
            slug="cierre-sereno",
            nombre="Cierre sereno",
            contexto_breve="Secuencia breve para descanso.",
            publicado=True,
        )
        cls.ritual.intenciones.set([intencion])
        cls.ritual.plantas_relacionadas.set([cls.planta])
        cls.ritual.productos_relacionados.set([cls.producto])

    def test_contrato_listado_herbal(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"plantas"})
        self.assertIsInstance(payload["plantas"], list)
        planta = payload["plantas"][0]
        self.assertTrue({"slug", "nombre", "descripcion_breve", "intenciones"}.issubset(planta.keys()))
        self.assertIsInstance(planta["intenciones"], list)

    def test_contrato_detalle_herbal(self) -> None:
        response = self.client.get(f"/api/v1/herbal/plantas/{self.planta.slug}/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"planta"})
        planta = payload["planta"]
        self.assertTrue({"slug", "nombre", "descripcion_breve", "intenciones"}.issubset(planta.keys()))
        self.assertEqual(planta["slug"], self.planta.slug)

    def test_contrato_productos_por_planta(self) -> None:
        response = self.client.get(f"/api/v1/herbal/plantas/{self.planta.slug}/productos/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"planta_slug", "productos"})
        self.assertEqual(payload["planta_slug"], self.planta.slug)
        self.assertIsInstance(payload["productos"], list)
        producto = payload["productos"][0]
        self.assertTrue(
            {"sku", "slug", "nombre", "tipo_producto", "categoria_comercial", "disponible", "estado_disponibilidad"}.issubset(producto.keys())
        )

    def test_contrato_rituales_por_planta(self) -> None:
        response = self.client.get(f"/api/v1/herbal/plantas/{self.planta.slug}/rituales/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"planta_slug", "rituales"})
        self.assertEqual(payload["planta_slug"], self.planta.slug)
        self.assertIsInstance(payload["rituales"], list)
        ritual = payload["rituales"][0]
        self.assertTrue({"slug", "nombre", "contexto_breve", "intenciones"}.issubset(ritual.keys()))

    def test_contrato_listado_rituales(self) -> None:
        response = self.client.get("/api/v1/rituales/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"rituales"})
        self.assertIsInstance(payload["rituales"], list)
        ritual = payload["rituales"][0]
        self.assertTrue({"slug", "nombre", "contexto_breve", "intenciones"}.issubset(ritual.keys()))

    def test_contrato_detalle_ritual(self) -> None:
        response = self.client.get(f"/api/v1/rituales/{self.ritual.slug}/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"ritual"})
        ritual = payload["ritual"]
        self.assertTrue(
            {
                "slug",
                "nombre",
                "contexto_breve",
                "intenciones",
                "ids_plantas_relacionadas",
                "ids_productos_relacionados",
            }.issubset(ritual.keys())
        )
        self.assertIsInstance(ritual["ids_plantas_relacionadas"], list)
        self.assertIsInstance(ritual["ids_productos_relacionados"], list)

    def test_contrato_plantas_por_ritual(self) -> None:
        response = self.client.get(f"/api/v1/rituales/{self.ritual.slug}/plantas/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"ritual_slug", "plantas"})
        self.assertEqual(payload["ritual_slug"], self.ritual.slug)
        self.assertIsInstance(payload["plantas"], list)
        planta = payload["plantas"][0]
        self.assertTrue({"slug", "nombre", "descripcion_breve", "intenciones"}.issubset(planta.keys()))

    def test_contrato_productos_por_ritual(self) -> None:
        response = self.client.get(f"/api/v1/rituales/{self.ritual.slug}/productos/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(set(payload.keys()), {"ritual_slug", "productos"})
        self.assertEqual(payload["ritual_slug"], self.ritual.slug)
        self.assertIsInstance(payload["productos"], list)
        producto = payload["productos"][0]
        self.assertTrue(
            {"sku", "slug", "nombre", "tipo_producto", "categoria_comercial", "disponible", "estado_disponibilidad"}.issubset(producto.keys())
        )
    def test_contrato_errores_404_publicos_shape_y_content_type(self) -> None:
        endpoints = [
            "/api/v1/herbal/plantas/no-existe/",
            "/api/v1/herbal/plantas/no-existe/productos/",
            "/api/v1/herbal/plantas/no-existe/rituales/",
            "/api/v1/herbal/intenciones/no-existe/plantas/",
            "/api/v1/rituales/no-existe/",
            "/api/v1/rituales/no-existe/plantas/",
            "/api/v1/rituales/no-existe/productos/",
            "/api/v1/rituales/intenciones/no-existe/",
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 404)
                self.assertTrue(response["Content-Type"].startswith("application/json"))
                payload = response.json()
                self.assertEqual(set(payload.keys()), {"detalle"})
                self.assertIsInstance(payload["detalle"], str)


