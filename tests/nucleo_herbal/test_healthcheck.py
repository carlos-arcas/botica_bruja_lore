import unittest
from unittest.mock import patch

try:
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
