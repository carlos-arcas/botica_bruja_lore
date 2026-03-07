import os
import unittest
from importlib.util import find_spec

DJANGO_DISPONIBLE = find_spec("django") is not None


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno de pruebas.")
class TestRepositoriosDjango(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")

        import django
        from django.core.management import call_command

        django.setup()
        call_command("migrate", run_syncdb=True, verbosity=0)

        from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
            IntencionModelo,
            PlantaModelo,
            ProductoModelo,
        )

        cls.IntencionModelo = IntencionModelo
        cls.PlantaModelo = PlantaModelo
        cls.ProductoModelo = ProductoModelo

    def setUp(self) -> None:
        from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios import (
            RepositorioPlantasORM,
            RepositorioProductosORM,
        )

        self.IntencionModelo.objects.all().delete()
        self.PlantaModelo.objects.all().delete()
        self.ProductoModelo.objects.all().delete()

        intencion_calma = self.IntencionModelo.objects.create(
            id="int-1",
            slug="calma",
            nombre="Calma",
            descripcion="Equilibrio suave",
        )
        self.IntencionModelo.objects.create(
            id="int-2",
            slug="descanso",
            nombre="Descanso",
            descripcion="Intención nocturna",
            es_publica=False,
        )
        planta = self.PlantaModelo.objects.create(
            id="pla-1",
            slug="melisa",
            nombre="Melisa",
            descripcion_breve="Planta aromática de tradición herbal.",
            publicada=True,
        )
        planta.intenciones.add(intencion_calma)

        self.ProductoModelo.objects.create(
            id="prod-1",
            sku="HERB-001",
            slug="melisa-a-granel-50g",
            nombre="Melisa a granel 50g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=planta,
            publicado=True,
        )
        self.ProductoModelo.objects.create(
            id="prod-2",
            sku="HERB-002",
            slug="melisa-a-granel-100g",
            nombre="Melisa a granel 100g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=planta,
            publicado=False,
        )
        self.ProductoModelo.objects.create(
            id="prod-3",
            sku="ESC-001",
            slug="vela-ritual",
            nombre="Vela ritual",
            tipo_producto="herramientas-rituales",
            categoria_comercial="herramientas-esotericas",
            planta=None,
            publicado=True,
        )

        self.repo_plantas = RepositorioPlantasORM()
        self.repo_productos = RepositorioProductosORM()

    def test_listar_navegables(self) -> None:
        plantas = self.repo_plantas.listar_navegables()

        self.assertEqual(len(plantas), 1)
        self.assertEqual(plantas[0].slug, "melisa")
        self.assertEqual(plantas[0].intenciones[0].slug, "calma")

    def test_obtener_por_slug(self) -> None:
        planta = self.repo_plantas.obtener_por_slug("melisa")

        self.assertIsNotNone(planta)
        assert planta is not None
        self.assertEqual(planta.nombre, "Melisa")

    def test_listar_por_intencion(self) -> None:
        plantas = self.repo_plantas.listar_por_intencion("calma")

        self.assertEqual(len(plantas), 1)
        self.assertEqual(plantas[0].slug, "melisa")

    def test_listar_herbales_por_planta(self) -> None:
        productos = self.repo_productos.listar_herbales_por_planta("pla-1")

        self.assertEqual(len(productos), 1)
        self.assertEqual(productos[0].sku, "HERB-001")


if __name__ == "__main__":
    unittest.main()
