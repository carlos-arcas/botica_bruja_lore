import unittest
from unittest.mock import patch

try:
    from django.db.utils import OperationalError
    from django.test import TestCase as DjangoTestCase

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
