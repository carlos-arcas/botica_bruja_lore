import json
from pathlib import Path

from django.test import TestCase

CONTRATO_PATH = Path(__file__).resolve().parents[2] / "docs" / "seo_contrato.json"


class TestSeoContratoBackend(TestCase):
    def _cargar_contrato(self) -> dict:
        with CONTRATO_PATH.open("r", encoding="utf-8") as handler:
            return json.load(handler)

    def test_contrato_declara_bloques_obligatorios(self) -> None:
        contrato = self._cargar_contrato()
        rutas = contrato.get("rutas", {})

        for bloque in [
            "indexables_estrategicas",
            "fichas_publicas_condicionadas",
            "publicas_no_estrategicas",
            "transaccionales_noindex",
        ]:
            self.assertIn(
                bloque,
                rutas,
                msg=f"Contrato SEO incompleto: falta rutas.{bloque} en docs/seo_contrato.json",
            )

    def test_robots_txt_sigue_contrato(self) -> None:
        contrato = self._cargar_contrato()
        reglas = contrato["robots"]
        response = self.client.get("/robots.txt")
        contenido = response.content.decode("utf-8")

        self.assertEqual(response.status_code, 200)
        self.assertIn("Allow: /", contenido)

        for ruta in reglas["disallow"]:
            esperado = f"Disallow: {ruta}"
            self.assertIn(
                esperado,
                contenido,
                msg=f"Regresión robots.txt: se esperaba '{esperado}' según docs/seo_contrato.json",
            )

        self.assertIn(
            f"Sitemap: http://testserver{reglas['sitemap']}",
            contenido,
            msg="Regresión robots.txt: sitemap no coincide con docs/seo_contrato.json",
        )

    def test_sitemap_incluye_y_excluye_rutas_del_contrato(self) -> None:
        contrato = self._cargar_contrato()
        response = self.client.get("/sitemap.xml")
        contenido = response.content.decode("utf-8")

        self.assertEqual(response.status_code, 200)

        for item in contrato["rutas"]["indexables_estrategicas"]:
            ruta = item["ruta"]
            self.assertIn(
                f"<loc>http://testserver{ruta}</loc>",
                contenido,
                msg=f"Regresión sitemap: falta ruta indexable estratégica '{ruta}'. Revisa backend sitemaps y docs/seo_contrato.json",
            )

        rutas_excluidas = [
            *contrato["rutas"]["publicas_no_estrategicas"],
            *contrato["rutas"]["transaccionales_noindex"],
        ]
        for item in rutas_excluidas:
            ruta = item["ruta"].split("/{")[0]
            self.assertNotIn(
                f"{ruta}</loc>",
                contenido,
                msg=f"Regresión sitemap: ruta no indexable '{item['ruta']}' apareció en sitemap. Corrige sitemaps.py o contrato.",
            )
