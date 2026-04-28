import unittest

try:
    from django.core.management import call_command
    from django.test import TestCase as DjangoTestCase
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
        ReglaCalendarioModelo,
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

        self.assertEqual(IntencionModelo.objects.filter(es_publica=True).count(), 4)
        self.assertEqual(PlantaModelo.objects.filter(publicada=True).count(), 4)
        self.assertGreaterEqual(ProductoModelo.objects.filter(publicado=True).count(), 14)
        self.assertEqual(RitualModelo.objects.filter(publicado=True).count(), 5)
        self.assertEqual(ReglaCalendarioModelo.objects.filter(activa=True).count(), 5)

        ritual = RitualModelo.objects.get(slug="limpieza-umbral-romero-ruda")
        self.assertEqual(ritual.intenciones.count(), 2)
        self.assertEqual(ritual.plantas_relacionadas.count(), 1)
        self.assertEqual(ritual.productos_relacionados.count(), 4)

        producto_melisa = ProductoModelo.objects.get(slug="melisa-a-granel-50g")
        self.assertIsNotNone(producto_melisa.planta)
        self.assertEqual(producto_melisa.planta.slug, "melisa")

        producto_lavanda = ProductoModelo.objects.get(slug="lavanda-flores-40g")
        self.assertIsNotNone(producto_lavanda.planta)
        self.assertEqual(producto_lavanda.planta.slug, "lavanda")

        respuesta = self.client.get("/api/v1/calendario-ritual/?fecha=2026-03-28")
        self.assertEqual(respuesta.status_code, 200)
        self.assertGreaterEqual(len(respuesta.json()["rituales"]), 4)

    def test_seed_demo_publico_reutiliza_producto_existente_por_slug_sin_reescribir_pk(self) -> None:
        producto = ProductoModelo.objects.create(
            id="pro-demo-manazanilla",
            sku="HERB-LEGACY-004",
            slug="manzanilla-dulce-60g",
            nombre="Manzanilla previa",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            seccion_publica="botica-natural",
            descripcion_corta="Version previa",
            precio_visible="7,10 EUR",
            publicado=True,
        )

        call_command("seed_demo_publico")

        producto.refresh_from_db()
        self.assertEqual(producto.id, "pro-demo-manazanilla")
        self.assertEqual(producto.sku, "HERB-DEMO-004")
        self.assertEqual(producto.nombre, "Manzanilla dulce 60g")
        self.assertEqual(
            ProductoModelo.objects.filter(slug="manzanilla-dulce-60g").count(),
            1,
        )

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
