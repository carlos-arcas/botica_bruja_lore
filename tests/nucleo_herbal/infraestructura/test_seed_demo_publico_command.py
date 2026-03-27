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
        self.assertGreaterEqual(ProductoModelo.objects.filter(publicado=True).count(), 14)
        self.assertEqual(RitualModelo.objects.filter(publicado=True).count(), 1)

        ritual = RitualModelo.objects.get(slug="cierre-sereno")
        self.assertEqual(ritual.intenciones.count(), 1)
        self.assertEqual(ritual.plantas_relacionadas.count(), 1)
        self.assertEqual(ritual.productos_relacionados.count(), 1)

        producto_melisa = ProductoModelo.objects.get(slug="melisa-a-granel-50g")
        self.assertIsNotNone(producto_melisa.planta)
        self.assertEqual(producto_melisa.planta.slug, "melisa")


    def test_seed_demo_publico_garantiza_cinco_productos_botica_natural(self) -> None:
        call_command("seed_demo_publico")

        productos_botica = ProductoModelo.objects.filter(
            publicado=True,
            seccion_publica="botica-natural",
        )

        self.assertEqual(productos_botica.count(), 5)

    def test_seed_demo_publico_garantiza_tres_productos_velas_e_incienso(self) -> None:
        call_command("seed_demo_publico")

        productos_velas = ProductoModelo.objects.filter(
            publicado=True,
            seccion_publica="velas-e-incienso",
        )

        self.assertEqual(productos_velas.count(), 3)
        self.assertSetEqual(
            set(productos_velas.values_list("slug", flat=True)),
            {
                "incienso-ruda-proteccion",
                "vela-lunar-blanca",
                "vela-miel-dorada",
            },
        )

    def test_seed_demo_publico_garantiza_tres_productos_minerales_y_energia(self) -> None:
        call_command("seed_demo_publico")

        productos_minerales = ProductoModelo.objects.filter(
            publicado=True,
            seccion_publica="minerales-y-energia",
        )

        self.assertEqual(productos_minerales.count(), 3)
        self.assertSetEqual(
            set(productos_minerales.values_list("slug", flat=True)),
            {
                "amatista-punta-suave",
                "cuarzo-cristal-rodado",
                "obsidiana-negra-bruta",
            },
        )

    def test_seed_demo_publico_garantiza_tres_productos_herramientas_esotericas(self) -> None:
        call_command("seed_demo_publico")

        productos_herramientas = ProductoModelo.objects.filter(
            publicado=True,
            seccion_publica="herramientas-esotericas",
        )

        self.assertEqual(productos_herramientas.count(), 3)
        self.assertSetEqual(
            set(productos_herramientas.values_list("slug", flat=True)),
            {
                "caldero-hierro-mini",
                "cuenco-selenita-pulido",
                "pendulo-laton-dorado",
            },
        )
        self.assertTrue(
            all(
                producto.tipo_producto == "herramientas-rituales"
                for producto in productos_herramientas
            )
        )
