import unittest
from unittest.mock import patch

try:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
        RitualModelo,
    )
    from django.db.utils import OperationalError
    from django.test import TestCase as DjangoTestCase, override_settings

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


class _FailingConnections:
    def __getitem__(self, _alias):
        raise OperationalError("DB caída")


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestHealthcheckReadiness(DjangoTestCase):
    def test_healthcheck_devuelve_200_cuando_db_esta_disponible(self) -> None:
        response = self.client.get("/healthz")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "database": "available"})

    def test_healthcheck_devuelve_503_cuando_db_falla(self) -> None:
        with patch("backend.configuracion_django.urls.connections", new=_FailingConnections()):
            response = self.client.get("/healthz")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"status": "error", "database": "unavailable"})


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestRobotsTxt(DjangoTestCase):
    def test_robots_txt_publico_con_reglas_seo_base(self) -> None:
        response = self.client.get("/robots.txt")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response["Content-Type"].startswith("text/plain"))

        contenido = response.content.decode("utf-8")
        self.assertIn("User-agent: *", contenido)
        self.assertIn("Allow: /", contenido)
        self.assertNotIn("Disallow: /\n", contenido)
        self.assertIn("Disallow: /admin/", contenido)
        self.assertIn("Disallow: /api/", contenido)
        self.assertIn("Sitemap: http://testserver/sitemap.xml", contenido)

    @override_settings(PUBLIC_SITE_URL="https://laboticabrujalore.com")
    def test_robots_txt_usa_dominio_canonico_configurado(self) -> None:
        response = self.client.get("/robots.txt")

        self.assertEqual(response.status_code, 200)
        contenido = response.content.decode("utf-8")
        self.assertIn("Sitemap: https://laboticabrujalore.com/sitemap.xml", contenido)


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestSitemapXml(DjangoTestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        intencion = IntencionModelo.objects.create(
            id="int-sitemap",
            slug="calma-sitemap",
            nombre="Calma",
            descripcion="Intención para pruebas de sitemap.",
            es_publica=True,
        )
        cls.planta_publica = PlantaModelo.objects.create(
            id="pla-sitemap-publica",
            slug="melisa-sitemap",
            nombre="Melisa Sitemap",
            descripcion_breve="Planta visible en sitemap.",
            publicada=True,
        )
        cls.planta_publica.intenciones.set([intencion])

        cls.planta_privada = PlantaModelo.objects.create(
            id="pla-sitemap-privada",
            slug="planta-oculta-sitemap",
            nombre="Planta oculta",
            descripcion_breve="No debe aparecer.",
            publicada=False,
        )

        cls.producto_publico = ProductoModelo.objects.create(
            id="pro-sitemap-publico",
            sku="SITEMAP-001",
            slug="mezcla-sitemap",
            nombre="Mezcla sitemap",
            tipo_producto="mezcla-herbal",
            categoria_comercial="mezclas",
            planta=cls.planta_publica,
            publicado=True,
        )

        ProductoModelo.objects.create(
            id="pro-sitemap-privado",
            sku="SITEMAP-002",
            slug="producto-oculto-sitemap",
            nombre="Producto oculto",
            tipo_producto="mezcla-herbal",
            categoria_comercial="mezclas",
            planta=cls.planta_publica,
            publicado=False,
        )

        cls.ritual_publico = RitualModelo.objects.create(
            id="rit-sitemap-publico",
            slug="ritual-sitemap",
            nombre="Ritual sitemap",
            contexto_breve="Ritual visible en sitemap.",
            publicado=True,
        )
        cls.ritual_publico.intenciones.set([intencion])
        cls.ritual_publico.plantas_relacionadas.set([cls.planta_publica])
        cls.ritual_publico.productos_relacionados.set([cls.producto_publico])

        cls.ritual_privado = RitualModelo.objects.create(
            id="rit-sitemap-privado",
            slug="ritual-oculto-sitemap",
            nombre="Ritual oculto",
            contexto_breve="No debe aparecer.",
            publicado=False,
        )
        cls.ritual_privado.intenciones.set([intencion])

    def test_sitemap_xml_responde_contenido_xml(self) -> None:
        response = self.client.get("/sitemap.xml")

        self.assertEqual(response.status_code, 200)
        self.assertIn("xml", response["Content-Type"])
        contenido = response.content.decode("utf-8")
        self.assertIn("<urlset", contenido)
        self.assertIn("<url>", contenido)

    def test_sitemap_xml_incluye_urls_publicas_y_excluye_privadas(self) -> None:
        response = self.client.get("/sitemap.xml")
        contenido = response.content.decode("utf-8")

        self.assertIn("<loc>http://testserver/</loc>", contenido)
        self.assertIn("<loc>http://testserver/hierbas/melisa-sitemap</loc>", contenido)
        self.assertIn("<loc>http://testserver/rituales/ritual-sitemap</loc>", contenido)
        self.assertIn("<loc>http://testserver/colecciones/mezcla-sitemap</loc>", contenido)

        self.assertNotIn("/admin/", contenido)
        self.assertNotIn("/api/", contenido)
        self.assertNotIn("planta-oculta-sitemap", contenido)
        self.assertNotIn("ritual-oculto-sitemap", contenido)
        self.assertNotIn("producto-oculto-sitemap", contenido)

    @override_settings(PUBLIC_SITE_URL="https://laboticabrujalore.com")
    def test_sitemap_xml_usa_dominio_canonico_configurado(self) -> None:
        response = self.client.get("/sitemap.xml")
        contenido = response.content.decode("utf-8")

        self.assertIn("<loc>https://laboticabrujalore.com/</loc>", contenido)
        self.assertIn("<loc>https://laboticabrujalore.com/hierbas/melisa-sitemap</loc>", contenido)

    def test_sitemap_xml_no_muestra_urls_duplicadas(self) -> None:
        response = self.client.get("/sitemap.xml")
        contenido = response.content.decode("utf-8")
        locs = [line.strip() for line in contenido.splitlines() if "<loc>" in line]

        self.assertEqual(len(locs), len(set(locs)))
