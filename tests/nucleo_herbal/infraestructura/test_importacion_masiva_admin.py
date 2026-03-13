import os
import unittest
from io import BytesIO
import zipfile

try:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")
    import django

    django.setup()

    from django.contrib.auth import get_user_model
    from django.core.files.uploadedfile import SimpleUploadedFile
    from django.test import TestCase
    from django.urls import reverse

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        ArticuloEditorialModelo,
        ImportacionFilaModelo,
        ImportacionLoteModelo,
        IntencionModelo,
        ProductoModelo,
        RitualModelo,
        SeccionPublicaModelo,
    )

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    TestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestImportacionMasivaAdmin(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = get_user_model().objects.create_superuser("admin", "admin@test.dev", "x")
        cls.no_staff = get_user_model().objects.create_user("noadmin", "n@test.dev", "x")
        IntencionModelo.objects.create(id="int-1", slug="claridad", nombre="Claridad")

    def setUp(self):
        self.url = reverse("importacion-masiva")

    def _archivo_csv(self, nombre, contenido):
        return SimpleUploadedFile(nombre, contenido.encode("utf-8"), content_type="text/csv")

    def _archivo_xlsx_productos(self):
        rows = [["sku", "slug", "nombre", "tipo_producto", "categoria_comercial", "seccion_publica", "descripcion_corta", "precio_visible", "publicado"], ["SKU-2", "prod-2", "Prod 2", "herbal", "hierbas", "botica", "desc", "9.90", "true"]]

        def sheet_xml(rows):
            body = []
            for ridx, row in enumerate(rows, start=1):
                cells = []
                for cidx, value in enumerate(row):
                    col = chr(ord("A") + cidx)
                    cells.append(f'<c r="{col}{ridx}" t="inlineStr"><is><t>{value}</t></is></c>')
                body.append(f'<row r="{ridx}">{"".join(cells)}</row>')
            return '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + "".join(body) + "</sheetData></worksheet>"

        data = BytesIO()
        with zipfile.ZipFile(data, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
            zf.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
            zf.writestr("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="s1" sheetId="1" r:id="rId1"/></sheets></workbook>')
            zf.writestr("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')
            zf.writestr("xl/worksheets/sheet1.xml", sheet_xml(rows))
        return SimpleUploadedFile("productos.xlsx", data.getvalue(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    def _crear_lote(self, archivo):
        self.client.force_login(self.staff)
        self.client.post(self.url, {"modo": "solo_crear", "entidad": "productos", "accion": "validar", "archivo": archivo})
        return ImportacionLoteModelo.objects.latest("id")

    def test_permiso_restringido_para_no_staff(self):
        self.client.force_login(self.no_staff)
        self.assertEqual(self.client.get(self.url).status_code, 302)

    def test_subida_csv_valida_genera_pendientes(self):
        lote = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-1,prod-1,Producto,herbal,hierbas,botica,desc,10.00,true\n"))
        self.assertEqual(lote.filas.count(), 1)
        self.assertEqual(ProductoModelo.objects.count(), 0)

    def test_subida_xlsx_valida_genera_pendientes(self):
        lote = self._crear_lote(self._archivo_xlsx_productos())
        self.assertEqual(lote.filas.count(), 1)

    def test_fila_invalida_reporta_error(self):
        lote = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\n,prod-1,Producto,herbal,hierbas,botica,desc,10.00,true\n"))
        fila = lote.filas.first()
        self.assertEqual(fila.estado, ImportacionFilaModelo.ESTADO_INVALIDA)
        self.assertTrue(fila.errores)

    def test_confirmacion_parcial(self):
        lote = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-1,prod-1,Producto,herbal,hierbas,botica,desc,10.00,true\nSKU-2,prod-2,Producto2,herbal,hierbas,botica,desc,10.00,true\n"))
        fila = lote.filas.first()
        self.client.post(self.url, {"accion": "descartar_filas", "lote_id": lote.id, "fila_ids": [fila.id]})
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": lote.id})
        self.assertEqual(ProductoModelo.objects.count(), 1)

    def test_confirmacion_total(self):
        lote = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-3,prod-3,Producto3,herbal,hierbas,botica,desc,10.00,true\n"))
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": lote.id})
        self.assertTrue(ProductoModelo.objects.filter(slug="prod-3").exists())

    def test_create_only_y_upsert(self):
        ProductoModelo.objects.create(id="p-1", sku="SKU-A", slug="prod-u", nombre="Antes", tipo_producto="h", categoria_comercial="h", seccion_publica="botica", descripcion_corta="d", precio_visible="1", publicado=True)
        lote = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-A,prod-u,Despues,herbal,hierbas,botica,desc,11.00,true\n"))
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": lote.id})
        self.assertEqual(ProductoModelo.objects.get(slug="prod-u").nombre, "Antes")
        lote2 = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-A,prod-u,Despues,herbal,hierbas,botica,desc,11.00,true\n"))
        lote2.modo = "crear_actualizar"
        lote2.save(update_fields=["modo"])
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": lote2.id})
        self.assertEqual(ProductoModelo.objects.get(slug="prod-u").nombre, "Despues")

    def test_adjuntar_imagen_por_input_y_drag_drop(self):
        lote = self._crear_lote(self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-5,prod-5,Producto5,herbal,hierbas,botica,desc,10.00,true\n"))
        fila = lote.filas.first()
        png = SimpleUploadedFile("demo.png", b"\x89PNG\r\n\x1a\n", content_type="image/png")
        self.client.post(self.url, {"accion": "adjuntar_imagen", "fila_id": fila.id, "imagen_fila": png})
        fila.refresh_from_db()
        self.assertIn("importaciones/filas", fila.imagen)

    def test_plantillas_descargables_y_permisos(self):
        self.client.force_login(self.staff)
        self.assertEqual(self.client.get(reverse("importacion-plantilla", args=["productos", "csv"])).status_code, 200)
        self.assertEqual(self.client.get(reverse("importacion-plantilla", args=["productos", "xlsx"])).status_code, 200)

    def test_importa_entidades_requeridas(self):
        self.client.force_login(self.staff)
        self.client.post(self.url, {"modo": "solo_crear", "entidad": "secciones_publicas", "accion": "validar", "archivo": self._archivo_csv("secciones.csv", "slug,nombre,publicada\nsec-2,Sección 2,true\n")})
        lote = ImportacionLoteModelo.objects.latest("id")
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": lote.id})
        self.client.post(self.url, {"modo": "solo_crear", "entidad": "articulos_editoriales", "accion": "validar", "archivo": self._archivo_csv("art.csv", "slug,titulo,resumen,contenido,publicado,indexable,seccion_publica\na-1,T,r,c,true,true,sec-2\n")})
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": ImportacionLoteModelo.objects.latest("id").id})
        self.client.post(self.url, {"modo": "solo_crear", "entidad": "rituales", "accion": "validar", "archivo": self._archivo_csv("rit.csv", "slug,nombre,contexto_breve,contenido,publicado,intenciones_relacionadas\nr-1,R,c,c,true,claridad\n")})
        self.client.post(self.url, {"accion": "confirmar_validas", "lote_id": ImportacionLoteModelo.objects.latest("id").id})
        self.assertTrue(SeccionPublicaModelo.objects.filter(slug="sec-2").exists())
        self.assertTrue(ArticuloEditorialModelo.objects.filter(slug="a-1").exists())
        self.assertTrue(RitualModelo.objects.filter(slug="r-1").exists())
