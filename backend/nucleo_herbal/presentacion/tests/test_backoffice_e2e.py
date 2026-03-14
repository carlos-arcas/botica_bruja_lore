from __future__ import annotations

import csv
import io
import json
import zipfile
from xml.sax.saxutils import escape

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ArticuloEditorialModelo, IntencionModelo, ProductoModelo, RitualModelo, SeccionPublicaModelo
from backend.nucleo_herbal.presentacion.backoffice_auth import crear_token_backoffice


class BackofficeE2ETests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(username="staff-e2e", password="x", is_staff=True, is_active=True)
        SeccionPublicaModelo.objects.create(slug="botica-natural", nombre="Botica Natural", publicada=True)
        SeccionPublicaModelo.objects.create(slug="guias", nombre="Guías", publicada=True)
        IntencionModelo.objects.create(id="int-1", slug="proteccion", nombre="Protección", descripcion="")

    def _auth(self) -> dict[str, str]:
        return {"HTTP_AUTHORIZATION": f"Bearer {crear_token_backoffice(self.staff)}"}

    def test_producto_e2e_create_edit_publish_unpublish_y_reflejo_publico(self):
        crear = {
            "sku": "SKU-E2E-1",
            "slug": "producto-e2e",
            "nombre": "Producto E2E",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "botica",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "desc",
            "precio_visible": "9.90",
            "imagen_url": "https://cdn.test/producto.webp",
            "orden_publicacion": 1,
            "publicado": False,
        }
        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        self.assertEqual(r.status_code, 200)
        producto_id = r.json()["item"]["id"]

        crear["id"] = producto_id
        crear["nombre"] = "Producto E2E editado"
        crear["imagen_url"] = "https://cdn.test/producto-editado.webp"
        edicion = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        self.assertEqual(edicion.status_code, 200)
        producto_editado = ProductoModelo.objects.get(id=producto_id)
        self.assertEqual(producto_editado.nombre, "Producto E2E editado")
        self.assertEqual(producto_editado.imagen_url, "https://cdn.test/producto-editado.webp")

        publicacion = self.client.post(f"/api/v1/backoffice/productos/{producto_id}/publicacion/", data=json.dumps({"publicado": True}), content_type="application/json", **self._auth())
        self.assertEqual(publicacion.status_code, 200)
        publico = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/")
        self.assertIn("producto-e2e", [p["slug"] for p in publico.json()["productos"]])
        self.assertIn("Producto E2E editado", [p["nombre"] for p in publico.json()["productos"]])

        despublicacion = self.client.post(f"/api/v1/backoffice/productos/{producto_id}/publicacion/", data=json.dumps({"publicado": False}), content_type="application/json", **self._auth())
        self.assertEqual(despublicacion.status_code, 200)
        publico2 = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/")
        self.assertNotIn("producto-e2e", [p["slug"] for p in publico2.json()["productos"]])

    def test_ritual_e2e_create_edit_publish_unpublish_y_reflejo_publico(self):
        crear = {"slug": "ritual-e2e", "nombre": "Ritual E2E", "contexto_breve": "ctx", "contenido": "contenido", "imagen_url": "https://cdn.test/producto.webp", "intenciones_relacionadas": ["proteccion"], "publicado": False}
        r = self.client.post("/api/v1/backoffice/rituales/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        ritual_id = r.json()["item"]["id"]

        crear["id"] = ritual_id
        crear["nombre"] = "Ritual E2E editado"
        crear["imagen_url"] = "https://cdn.test/ritual-editado.webp"
        edicion = self.client.post("/api/v1/backoffice/rituales/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        self.assertEqual(edicion.status_code, 200)
        ritual_editado = RitualModelo.objects.get(id=ritual_id)
        self.assertEqual(ritual_editado.nombre, "Ritual E2E editado")
        self.assertEqual(ritual_editado.imagen_url, "https://cdn.test/ritual-editado.webp")

        publicacion = self.client.post(f"/api/v1/backoffice/rituales/{ritual_id}/publicacion/", data=json.dumps({"publicado": True}), content_type="application/json", **self._auth())
        self.assertEqual(publicacion.status_code, 200)
        listado = self.client.get("/api/v1/rituales/")
        self.assertIn("ritual-e2e", [r["slug"] for r in listado.json()["rituales"]])
        detalle_publico = self.client.get("/api/v1/rituales/ritual-e2e/")
        self.assertEqual(detalle_publico.status_code, 200)
        self.assertEqual(detalle_publico.json()["ritual"]["nombre"], "Ritual E2E editado")

        despublicacion = self.client.post(f"/api/v1/backoffice/rituales/{ritual_id}/publicacion/", data=json.dumps({"publicado": False}), content_type="application/json", **self._auth())
        self.assertEqual(despublicacion.status_code, 200)
        listado2 = self.client.get("/api/v1/rituales/")
        self.assertNotIn("ritual-e2e", [r["slug"] for r in listado2.json()["rituales"]])
        detalle_no_publico = self.client.get("/api/v1/rituales/ritual-e2e/")
        self.assertEqual(detalle_no_publico.status_code, 404)

    def test_editorial_e2e_create_edit_publish_unpublish_y_reflejo_publico(self):
        crear = {"slug": "art-e2e", "titulo": "Artículo E2E", "resumen": "r", "contenido": "c", "tema": "t", "hub": "h", "subhub": "s", "imagen_url": "https://cdn.test/producto.webp", "indexable": True, "publicado": False, "seccion_publica": "guias"}
        r = self.client.post("/api/v1/backoffice/editorial/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        articulo_id = r.json()["item"]["id"]

        crear["id"] = articulo_id
        crear["titulo"] = "Artículo E2E editado"
        crear["imagen_url"] = "https://cdn.test/editorial-editado.webp"
        edicion = self.client.post("/api/v1/backoffice/editorial/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        self.assertEqual(edicion.status_code, 200)
        articulo_editado = ArticuloEditorialModelo.objects.get(id=articulo_id)
        self.assertEqual(articulo_editado.titulo, "Artículo E2E editado")
        self.assertEqual(articulo_editado.imagen_url, "https://cdn.test/editorial-editado.webp")

        publicacion = self.client.post(f"/api/v1/backoffice/editorial/{articulo_id}/publicacion/", data=json.dumps({"publicado": True}), content_type="application/json", **self._auth())
        self.assertEqual(publicacion.status_code, 200)
        listado = self.client.get("/api/v1/herbal/editorial/")
        self.assertIn("art-e2e", [a["slug"] for a in listado.json()["articulos"]])
        detalle_publico = self.client.get("/api/v1/herbal/editorial/art-e2e/")
        self.assertEqual(detalle_publico.status_code, 200)
        self.assertEqual(detalle_publico.json()["articulo"]["titulo"], "Artículo E2E editado")

        despublicacion = self.client.post(f"/api/v1/backoffice/editorial/{articulo_id}/publicacion/", data=json.dumps({"publicado": False}), content_type="application/json", **self._auth())
        self.assertEqual(despublicacion.status_code, 200)
        listado2 = self.client.get("/api/v1/herbal/editorial/")
        self.assertNotIn("art-e2e", [a["slug"] for a in listado2.json()["articulos"]])
        detalle_no_publico = self.client.get("/api/v1/herbal/editorial/art-e2e/")
        self.assertEqual(detalle_no_publico.status_code, 404)

    def test_importacion_staging_csv_solo_crear_y_xlsx_crear_actualizar(self):
        ProductoModelo.objects.create(id="p-base", sku="SKU-DUPE", slug="prod-base", nombre="Base", tipo_producto="inciensos-y-sahumerios", categoria_comercial="botica", seccion_publica="botica-natural", descripcion_corta="", precio_visible="1", imagen_url="", publicado=True)

        csv_file = self._csv_file([
            {"sku": "SKU-DUPE", "slug": "prod-base", "nombre": "No debe duplicar", "tipo_producto": "inciensos-y-sahumerios", "categoria_comercial": "botica", "seccion_publica": "botica-natural", "descripcion_corta": "d", "precio_visible": "2", "imagen_url": "https://cdn.test/producto.webp", "publicado": "true", "orden_publicacion": "2"},
            {"sku": "SKU-NEW", "slug": "prod-new", "nombre": "Nuevo", "tipo_producto": "inciensos-y-sahumerios", "categoria_comercial": "botica", "seccion_publica": "botica-natural", "descripcion_corta": "d", "precio_visible": "3", "imagen_url": "https://cdn.test/producto.webp", "publicado": "true", "orden_publicacion": "2"},
        ])
        lote1 = self.client.post("/api/v1/backoffice/importacion/lotes/", data={"entidad": "productos", "modo": "solo_crear", "archivo": csv_file}, **self._auth()).json()["lote_id"]
        confirmar_lote_1 = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote1}/confirmar/", data=json.dumps({}), content_type="application/json", **self._auth())
        self.assertEqual(confirmar_lote_1.status_code, 200)
        self.assertEqual(confirmar_lote_1.json()["confirmadas"], 2)
        self.assertEqual(ProductoModelo.objects.filter(slug="prod-base").count(), 1)
        self.assertTrue(ProductoModelo.objects.filter(slug="prod-new").exists())
        self.assertTrue(ProductoModelo.objects.get(slug="prod-new").publicado)

        xlsx_file = self._xlsx_file([
            ["sku", "slug", "nombre", "tipo_producto", "categoria_comercial", "seccion_publica", "descripcion_corta", "precio_visible", "imagen_url", "publicado", "orden_publicacion"],
            ["SKU-DUPE", "prod-base", "Actualizado", "inciensos-y-sahumerios", "botica", "botica-natural", "d", "5", "", "true", "1"],
            ["SKU-NEW-2", "prod-new-2", "Nuevo 2", "inciensos-y-sahumerios", "botica", "botica-natural", "d", "6", "", "true", "1"],
        ])
        lote2 = self.client.post("/api/v1/backoffice/importacion/lotes/", data={"entidad": "productos", "modo": "crear_actualizar", "archivo": xlsx_file}, **self._auth()).json()["lote_id"]
        detalle = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote2}/", **self._auth()).json()
        self.assertGreaterEqual(len(detalle["filas"]), 2)
        self.assertTrue(all(fila["estado"] in {"valida", "warning", "invalida", "descartada", "confirmada"} for fila in detalle["filas"]))
        confirmar_lote_2 = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote2}/confirmar/", data=json.dumps({}), content_type="application/json", **self._auth())
        self.assertEqual(confirmar_lote_2.status_code, 200)
        self.assertGreaterEqual(confirmar_lote_2.json()["confirmadas"], 2)

        self.assertEqual(ProductoModelo.objects.get(slug="prod-base").nombre, "Actualizado")
        self.assertEqual(ProductoModelo.objects.filter(sku="SKU-DUPE").count(), 1)
        self.assertTrue(ProductoModelo.objects.filter(slug="prod-new-2").exists())

        listado_publico = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/").json()["productos"]
        self.assertIn("prod-new", [p["slug"] for p in listado_publico])

    def _csv_file(self, rows: list[dict[str, str]]) -> io.BytesIO:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
        data = io.BytesIO(output.getvalue().encode("utf-8"))
        data.name = "import.csv"
        return data

    def _xlsx_file(self, rows: list[list[str]]) -> io.BytesIO:
        shared_strings = []
        index_by_value: dict[str, int] = {}

        def idx(value: str) -> int:
            if value not in index_by_value:
                index_by_value[value] = len(shared_strings)
                shared_strings.append(value)
            return index_by_value[value]

        row_nodes = []
        for row_num, row in enumerate(rows, start=1):
            cells = []
            for col_num, value in enumerate(row, start=1):
                col = chr(64 + col_num)
                cells.append(f'<c r="{col}{row_num}" t="s"><v>{idx(str(value))}</v></c>')
            row_nodes.append(f'<row r="{row_num}">{"".join(cells)}</row>')

        sheet = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            f'<sheetData>{"".join(row_nodes)}</sheetData></worksheet>'
        )
        sst_nodes = "".join(f"<si><t>{escape(s)}</t></si>" for s in shared_strings)
        shared = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(shared_strings)}" uniqueCount="{len(shared_strings)}">{sst_nodes}</sst>'
        )
        content_types = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '</Types>'
        )
        workbook = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'
        )
        rels = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
            '</Relationships>'
        )

        data = io.BytesIO()
        with zipfile.ZipFile(data, "w") as zf:
            zf.writestr("[Content_Types].xml", content_types)
            zf.writestr("xl/workbook.xml", workbook)
            zf.writestr("xl/_rels/workbook.xml.rels", rels)
            zf.writestr("xl/sharedStrings.xml", shared)
            zf.writestr("xl/worksheets/sheet1.xml", sheet)
        data.seek(0)
        data.name = "import.xlsx"
        return data
