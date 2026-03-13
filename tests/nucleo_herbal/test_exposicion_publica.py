import unittest

try:
    from django.test import TestCase as DjangoTestCase
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
        RitualModelo,
        ReglaCalendarioModelo,
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
        cls.producto_herbal = ProductoModelo.objects.create(
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

        cls.ritual_publico = RitualModelo.objects.create(
            id="rit-1",
            slug="cierre-sereno",
            nombre="Cierre sereno",
            contexto_breve="Secuencia breve para descanso.",
            publicado=True,
        )
        cls.ritual_publico.intenciones.set([cls.intencion_calma])
        cls.ritual_publico.plantas_relacionadas.set([cls.planta_melisa])
        cls.ritual_publico.productos_relacionados.set([cls.producto_herbal])

        cls.ritual_oculto = RitualModelo.objects.create(
            id="rit-2",
            slug="ritual-oculto",
            nombre="Ritual oculto",
            contexto_breve="No debe salir en API pública.",
            publicado=False,
        )
        cls.ritual_oculto.intenciones.set([cls.intencion_calma])

        ReglaCalendarioModelo.objects.create(
            id="reg-1",
            ritual=cls.ritual_publico,
            nombre="Equinoccio de calma",
            fecha_inicio="2026-03-20",
            fecha_fin="2026-03-25",
            prioridad=8,
            activa=True,
        )
        ReglaCalendarioModelo.objects.create(
            id="reg-2",
            ritual=cls.ritual_publico,
            nombre="Ventana prioritaria",
            fecha_inicio="2026-03-22",
            fecha_fin="2026-03-23",
            prioridad=1,
            activa=True,
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

    def test_listado_productos_por_seccion_botica_natural_limita_a_cinco_publicos(self) -> None:
        for idx in range(6):
            ProductoModelo.objects.create(
                id=f"pro-bn-{idx}",
                sku=f"BN-{idx:03d}",
                slug=f"botica-natural-demo-{idx}",
                nombre=f"Producto Botica {idx}",
                tipo_producto="herramientas-rituales",
                categoria_comercial="botica",
                seccion_publica="botica-natural",
                descripcion_corta="demo",
                precio_visible="10,00 €",
                imagen_url="",
                publicado=True,
            )
        ProductoModelo.objects.create(
            id="pro-bn-oculto",
            sku="BN-900",
            slug="botica-natural-oculto",
            nombre="Producto oculto",
            tipo_producto="herramientas-rituales",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            descripcion_corta="demo",
            precio_visible="10,00 €",
            imagen_url="",
            publicado=False,
        )
        ProductoModelo.objects.create(
            id="pro-otra-seccion",
            sku="OTR-001",
            slug="otra-seccion-demo",
            nombre="Otra sección",
            tipo_producto="herramientas-rituales",
            categoria_comercial="botica",
            seccion_publica="velas-e-incienso",
            descripcion_corta="demo",
            precio_visible="10,00 €",
            imagen_url="",
            publicado=True,
        )

        response = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["seccion_slug"], "botica-natural")
        self.assertEqual(len(data["productos"]), 5)
        self.assertTrue(all(item["seccion_publica"] == "botica-natural" for item in data["productos"]))
        self.assertTrue(all(item["slug"].startswith("botica-natural-demo-") for item in data["productos"]))
        slugs = [item["slug"] for item in data["productos"]]
        self.assertEqual(slugs, sorted(slugs))

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


    def test_rituales_relacionados_por_planta(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/melisa/rituales/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["planta_slug"], "melisa")
        self.assertEqual(len(data["rituales"]), 1)
        self.assertEqual(data["rituales"][0]["slug"], "cierre-sereno")

    def test_rituales_relacionados_por_planta_inexistente_devuelve_404(self) -> None:
        response = self.client.get("/api/v1/herbal/plantas/inexistente/rituales/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("Planta no encontrada", response.json()["detalle"])

    def test_listado_rituales_publica_solo_rituales_navegables(self) -> None:
        response = self.client.get("/api/v1/rituales/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["rituales"]), 1)
        self.assertEqual(data["rituales"][0]["slug"], "cierre-sereno")

    def test_detalle_ritual_resuelve_slug_existente(self) -> None:
        response = self.client.get("/api/v1/rituales/cierre-sereno/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["ritual"]["slug"], "cierre-sereno")
        self.assertEqual(data["ritual"]["ids_plantas_relacionadas"], ["pla-1"])

    def test_detalle_ritual_inexistente_devuelve_404(self) -> None:
        response = self.client.get("/api/v1/rituales/no-existe/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("Ritual no encontrado", response.json()["detalle"])

    def test_plantas_relacionadas_por_ritual(self) -> None:
        response = self.client.get("/api/v1/rituales/cierre-sereno/plantas/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["ritual_slug"], "cierre-sereno")
        self.assertEqual(len(data["plantas"]), 1)
        self.assertEqual(data["plantas"][0]["slug"], "melisa")

    def test_productos_relacionados_por_ritual(self) -> None:
        response = self.client.get("/api/v1/rituales/cierre-sereno/productos/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["ritual_slug"], "cierre-sereno")
        self.assertEqual(len(data["productos"]), 1)
        self.assertEqual(data["productos"][0]["sku"], "HERB-001")

    def test_rituales_por_intencion(self) -> None:
        response = self.client.get("/api/v1/rituales/intenciones/calma/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intencion"]["slug"], "calma")
        self.assertEqual(len(data["rituales"]), 1)
        self.assertEqual(data["rituales"][0]["slug"], "cierre-sereno")

    def test_rituales_por_intencion_inexistente_devuelve_404(self) -> None:
        response = self.client.get("/api/v1/rituales/intenciones/inexistente/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("Intención", response.json()["detalle"])


    def test_calendario_ritual_por_fecha_devuelve_rituales_aplicables(self) -> None:
        response = self.client.get("/api/v1/calendario-ritual/?fecha=2026-03-22")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["fecha_consulta"], "2026-03-22")
        self.assertEqual(len(data["rituales"]), 1)
        self.assertEqual(data["rituales"][0]["slug"], "cierre-sereno")
        self.assertEqual(data["rituales"][0]["nombre_regla"], "Ventana prioritaria")

    def test_calendario_ritual_por_fecha_sin_resultados(self) -> None:
        response = self.client.get("/api/v1/calendario-ritual/?fecha=2026-04-10")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["fecha_consulta"], "2026-04-10")
        self.assertEqual(data["rituales"], [])

    def test_calendario_ritual_por_fecha_invalida_devuelve_400(self) -> None:
        response = self.client.get("/api/v1/calendario-ritual/?fecha=10-04-2026")

        self.assertEqual(response.status_code, 400)
        self.assertIn("Formato de fecha inválido", response.json()["detalle"])
