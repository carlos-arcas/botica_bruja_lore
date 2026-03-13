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

    from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import procesar_importacion
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        ArticuloEditorialModelo,
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
        rows = [
            [
                "sku",
                "slug",
                "nombre",
                "tipo_producto",
                "categoria_comercial",
                "seccion_publica",
                "descripcion_corta",
                "precio_visible",
                "publicado",
            ],
            ["SKU-2", "prod-2", "Prod 2", "herbal", "hierbas", "botica", "desc", "9.90", "true"],
        ]
        def sheet_xml(rows):
            body=[]
            for ridx,row in enumerate(rows, start=1):
                cells=[]
                for cidx,value in enumerate(row):
                    col=chr(ord("A")+cidx)
                    cells.append(f'<c r="{col}{ridx}" t="inlineStr"><is><t>{value}</t></is></c>')
                body.append(f'<row r="{ridx}">{"".join(cells)}</row>')
            return '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+"".join(body)+"</sheetData></worksheet>"

        data = BytesIO()
        with zipfile.ZipFile(data, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
            zf.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
            zf.writestr("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="s1" sheetId="1" r:id="rId1"/></sheets></workbook>')
            zf.writestr("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')
            zf.writestr("xl/worksheets/sheet1.xml", sheet_xml(rows))
        return SimpleUploadedFile(
            "productos.xlsx",
            data.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    def test_permiso_restringido_para_no_staff(self):
        self.client.force_login(self.no_staff)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)

    def test_render_pantalla_con_dropzone_y_ayuda(self):
        self.client.force_login(self.staff)
        response = self.client.get(self.url)
        self.assertContains(response, "drop-archivo")
        self.assertContains(response, "Descargar plantilla CSV")
        self.assertContains(response, "Obligatorias")

    def test_csv_valido_productos_create_only(self):
        self.client.force_login(self.staff)
        archivo = self._archivo_csv(
            "productos.csv",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\n"
            "SKU-1,prod-1,Producto 1,herbal,hierbas,botica,desc,10.00,true\n",
        )
        response = self.client.post(self.url, {"modo": "solo_crear", "accion": "importar", "archivo": archivo})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(ProductoModelo.objects.filter(slug="prod-1").exists())

    def test_excel_valido_productos(self):
        self.client.force_login(self.staff)
        response = self.client.post(self.url, {"modo": "solo_crear", "accion": "importar", "archivo": self._archivo_xlsx_productos()})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(ProductoModelo.objects.filter(slug="prod-2").exists())

    def test_validacion_sin_persistencia(self):
        self.client.force_login(self.staff)
        archivo = self._archivo_csv(
            "productos.csv",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\n"
            "SKU-3,prod-3,Producto 3,herbal,hierbas,botica,desc,10.00,true\n",
        )
        self.client.post(self.url, {"accion": "validar", "archivo": archivo})
        self.assertFalse(ProductoModelo.objects.filter(slug="prod-3").exists())

    def test_upsert_producto(self):
        ProductoModelo.objects.create(
            id="p-1",
            sku="SKU-X",
            slug="prod-upsert",
            nombre="Antes",
            tipo_producto="herbal",
            categoria_comercial="hierbas",
            seccion_publica="botica",
            descripcion_corta="d",
            precio_visible="1",
            publicado=True,
        )
        self.client.force_login(self.staff)
        archivo = self._archivo_csv(
            "productos.csv",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\n"
            "SKU-X,prod-upsert,Despues,herbal,hierbas,botica,desc,11.00,true\n",
        )
        self.client.post(self.url, {"modo": "crear_actualizar", "accion": "importar", "archivo": archivo})
        self.assertEqual(ProductoModelo.objects.get(slug="prod-upsert").nombre, "Despues")

    def test_error_columna_faltante(self):
        self.client.force_login(self.staff)
        archivo = self._archivo_csv("productos.csv", "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible\nSKU-9,prod-9,P,herbal,h,botica,d,1\n")
        response = self.client.post(self.url, {"accion": "validar", "modo": "solo_validar", "entidad": "productos", "archivo": archivo})
        self.assertContains(response, "Columnas faltantes")

    def test_error_slug_duplicado_conflictivo(self):
        ProductoModelo.objects.create(
            id="p-2",
            sku="SKU-A",
            slug="prod-conflicto",
            nombre="Prod",
            tipo_producto="herbal",
            categoria_comercial="hierbas",
            seccion_publica="botica",
            descripcion_corta="d",
            precio_visible="1",
            publicado=True,
        )
        self.client.force_login(self.staff)
        archivo = self._archivo_csv(
            "productos.csv",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\n"
            "SKU-B,prod-conflicto,Producto,herbal,hierbas,botica,desc,10.00,true\n",
        )
        response = self.client.post(self.url, {"modo": "crear_actualizar", "accion": "importar", "archivo": archivo})
        self.assertContains(response, "Conflicto")

    def test_error_relacion_inexistente_ritual(self):
        self.client.force_login(self.staff)
        archivo = self._archivo_csv(
            "rituales.csv",
            "slug,nombre,contexto_breve,contenido,publicado,intenciones_relacionadas\n"
            "rit-1,Ritual,ctx,contenido,true,no-existe\n",
        )
        response = self.client.post(self.url, {"modo": "crear_actualizar", "accion": "importar", "archivo": archivo})
        self.assertContains(response, "Relaciones inexistentes")

    def test_asociacion_imagen_por_referencia(self):
        resultado = procesar_importacion(
            filas=[{
                "sku": "SKU-IMG",
                "slug": "prod-img",
                "nombre": "Producto Img",
                "tipo_producto": "herbal",
                "categoria_comercial": "hierbas",
                "seccion_publica": "botica",
                "descripcion_corta": "desc",
                "precio_visible": "1.00",
                "publicado": "true",
                "imagen_ref": "img1.jpg",
            }],
            columnas=["sku", "slug", "nombre", "tipo_producto", "categoria_comercial", "seccion_publica", "descripcion_corta", "precio_visible", "publicado", "imagen_ref"],
            entidad_solicitada="productos",
            modo="solo_crear",
            imagenes_por_referencia={"img1.jpg": "/media/importaciones/imagenes/img1.jpg"},
            usuario=self.staff,
        )
        self.assertEqual(resultado.fallidas, 0)
        self.assertIn("img1.jpg", ProductoModelo.objects.get(slug="prod-img").imagen_url)

    def test_resumen_final_renderiza(self):
        self.client.force_login(self.staff)
        archivo = self._archivo_csv(
            "secciones.csv",
            "slug,nombre,publicada\nsec-1,Sección 1,true\n",
        )
        response = self.client.post(self.url, {"modo": "solo_crear", "accion": "importar", "archivo": archivo})
        self.assertContains(response, "Filas procesadas")

    def test_plantillas_descargables(self):
        self.client.force_login(self.staff)
        csv_resp = self.client.get(reverse("importacion-plantilla", args=["productos", "csv"]))
        xlsx_resp = self.client.get(reverse("importacion-plantilla", args=["productos", "xlsx"]))
        self.assertEqual(csv_resp.status_code, 200)
        self.assertEqual(xlsx_resp.status_code, 200)

    def test_importa_rituales_articulos_y_secciones(self):
        self.client.force_login(self.staff)
        self.client.post(
            self.url,
            {
                "modo": "solo_crear",
                "accion": "importar",
                "archivo": self._archivo_csv("secciones.csv", "slug,nombre,publicada\nsec-2,Sección 2,true\n"),
            },
        )
        self.client.post(
            self.url,
            {
                "modo": "solo_crear",
                "accion": "importar",
                "archivo": self._archivo_csv(
                    "articulos.csv",
                    "slug,titulo,resumen,contenido,publicado,indexable,seccion_publica\n"
                    "art-1,Titulo,res,cont,true,true,sec-2\n",
                ),
            },
        )
        self.client.post(
            self.url,
            {
                "modo": "solo_crear",
                "accion": "importar",
                "archivo": self._archivo_csv(
                    "rituales.csv",
                    "slug,nombre,contexto_breve,contenido,publicado,intenciones_relacionadas\n"
                    "rit-2,Ritual,ctx,contenido,true,claridad\n",
                ),
            },
        )
        self.assertTrue(SeccionPublicaModelo.objects.filter(slug="sec-2").exists())
        self.assertTrue(ArticuloEditorialModelo.objects.filter(slug="art-1").exists())
        self.assertTrue(RitualModelo.objects.filter(slug="rit-2").exists())
