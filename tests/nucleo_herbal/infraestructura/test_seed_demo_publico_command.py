import unittest

try:
    from django.core.management import call_command
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
class TestSeedDemoPublicoCommand(DjangoTestCase):
    def test_seed_demo_publico_es_idempotente_y_relacional(self) -> None:
        call_command("seed_demo_publico")
        call_command("seed_demo_publico")

        self.assertEqual(IntencionModelo.objects.filter(es_publica=True).count(), 2)
        self.assertEqual(PlantaModelo.objects.filter(publicada=True).count(), 2)
        self.assertEqual(ProductoModelo.objects.filter(publicado=True).count(), 2)
        self.assertEqual(RitualModelo.objects.filter(publicado=True).count(), 1)

        ritual = RitualModelo.objects.get(slug="cierre-sereno")
        self.assertEqual(ritual.intenciones.count(), 1)
        self.assertEqual(ritual.plantas_relacionadas.count(), 1)
        self.assertEqual(ritual.productos_relacionados.count(), 1)

        producto_melisa = ProductoModelo.objects.get(slug="melisa-a-granel-50g")
        self.assertIsNotNone(producto_melisa.planta)
        self.assertEqual(producto_melisa.planta.slug, "melisa")
