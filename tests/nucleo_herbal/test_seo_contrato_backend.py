import json
from pathlib import Path

from django.test import SimpleTestCase


CONTRATO_PATH = Path(__file__).resolve().parents[2] / "docs" / "seo_contrato.json"
GUIAS_EDITORIALES_PATH = (
    Path(__file__).resolve().parents[2] / "frontend" / "contenido" / "editorial" / "guiasEditoriales.json"
)
SUBHUBS_EDITORIALES_PATH = (
    Path(__file__).resolve().parents[2] / "frontend" / "contenido" / "editorial" / "subhubsEditoriales.json"
)


class TestSeoContratoBackend(SimpleTestCase):
    maxDiff = None
    databases = {"default"}

    def _cargar_contrato(self) -> dict:
        with CONTRATO_PATH.open("r", encoding="utf-8") as handler:
            return json.load(handler)

    def test_contrato_json_tiene_estructura_minima(self) -> None:
        contrato = self._cargar_contrato()

        self.assertIn("rutas", contrato)
        self.assertIn("robots", contrato)
        self.assertIn("search_console", contrato)
        self.assertIn("enlazado_interno", contrato)

        self.assertIn("indexables_estrategicas", contrato["rutas"])
        self.assertIn("fichas_publicas_condicionadas", contrato["rutas"])
        self.assertIn("publicas_no_estrategicas", contrato["rutas"])
        self.assertIn("transaccionales_noindex", contrato["rutas"])

    def test_robots_txt_refleja_contrato(self) -> None:
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

    def test_sitemap_guias_respeta_publicacion_e_indexacion(self) -> None:
        with GUIAS_EDITORIALES_PATH.open("r", encoding="utf-8") as handler:
            guias = json.load(handler)

        response = self.client.get("/sitemap.xml")
        contenido = response.content.decode("utf-8")

        for guia in guias:
            ruta = f"/guias/{guia['slug']}"
            if guia.get("publicada") and guia.get("indexable"):
                self.assertIn(
                    f"<loc>http://testserver{ruta}</loc>",
                    contenido,
                    msg=f"Regresión sitemap: falta guía publicada/indexable '{ruta}'.",
                )
            else:
                self.assertNotIn(
                    f"{ruta}</loc>",
                    contenido,
                    msg=f"Regresión sitemap: guía no publicada/noindex '{ruta}' no debe exponerse.",
                )

    def test_sitemap_subhubs_respeta_publicacion_e_indexacion(self) -> None:
        with SUBHUBS_EDITORIALES_PATH.open("r", encoding="utf-8") as handler:
            subhubs = json.load(handler)

        response = self.client.get("/sitemap.xml")
        contenido = response.content.decode("utf-8")

        for subhub in subhubs:
            ruta = f"/guias/temas/{subhub['slug']}"
            if subhub.get("publicada") and subhub.get("indexable"):
                self.assertIn(
                    f"<loc>http://testserver{ruta}</loc>",
                    contenido,
                    msg=f"Regresión sitemap: falta subhub editorial indexable '{ruta}'.",
                )
            else:
                self.assertNotIn(
                    f"{ruta}</loc>",
                    contenido,
                    msg=f"Regresión sitemap: subhub editorial no indexable '{ruta}' no debe exponerse.",
                )
