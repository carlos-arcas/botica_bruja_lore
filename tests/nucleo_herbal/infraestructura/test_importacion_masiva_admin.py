import base64
import json
import os
import unittest
from pathlib import Path

try:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")
    import django

    django.setup()

    from django.contrib.auth import get_user_model
    from django.core.files.uploadedfile import SimpleUploadedFile
    from django.test import Client, TestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        ArticuloEditorialModelo,
        ImportacionFilaModelo,
        ImportacionLoteModelo,
        IntencionModelo,
        ProductoModelo,
        RitualModelo,
        SeccionPublicaModelo,
    )
    from backend.nucleo_herbal.presentacion.backoffice_auth import crear_token_backoffice

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    TestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class TestImportacionMasivaBackoffice(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = get_user_model().objects.create_user("staff", "staff@test.dev", "x", is_staff=True)
        IntencionModelo.objects.create(id="int-1", slug="claridad", nombre="Claridad")

    def setUp(self):
        self.client = Client()
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {crear_token_backoffice(self.staff)}"}

    def _archivo_csv(self, nombre: str, contenido: str) -> SimpleUploadedFile:
        return SimpleUploadedFile(nombre, contenido.encode("utf-8"), content_type="text/csv")

    def _imagen_png_valida(self, nombre: str = "demo.png") -> SimpleUploadedFile:
        data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sXz8QAAAABJRU5ErkJggg==")
        return SimpleUploadedFile(nombre, data, content_type="image/png")

    def _crear_lote(self, entidad: str, contenido: str, modo: str = "solo_crear") -> int:
        response = self.client.post(
            "/api/v1/backoffice/importacion/lotes/",
            data={"modo": modo, "entidad": entidad, "archivo": self._archivo_csv(f"{entidad}.csv", contenido)},
            **self.auth,
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["lote_id"]

    def test_ui_legacy_django_deja_de_ser_interfaz_humana(self):
        response = self.client.get("/admin/importacion-masiva/")
        self.assertNotEqual(response.status_code, 200)
        self.assertIn("/admin/login/", response.url)

    def test_rutas_legacy_de_plantilla_tambien_quedan_fuera_de_servicio(self):
        response = self.client.get("/admin/importacion-masiva/plantilla/productos/csv/")
        self.assertNotEqual(response.status_code, 200)
        self.assertIn("/admin/login/", response.url)

    def test_urls_django_no_declara_imports_ni_rutas_legacy(self):
        contenido = Path("backend/configuracion_django/urls.py").read_text(encoding="utf-8")
        self.assertNotIn("importacion_masiva_view", contenido)
        self.assertNotIn("descargar_plantilla_view", contenido)
        self.assertNotIn("importacion-masiva", contenido)

    def test_contrato_moderno_mantiene_entrada_humana_next(self):
        contenido = Path("frontend/infraestructura/configuracion/modulosAdmin.ts").read_text(encoding="utf-8")
        self.assertIn('href: "/admin/importacion"', contenido)

    def test_no_queda_template_django_activo_para_importacion_legacy(self):
        self.assertFalse(Path("backend/templates/admin/persistencia_django/importacion_masiva.html").exists())

    def test_detalle_serializa_resumen_y_filas(self):
        lote_id = self._crear_lote(
            "productos",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-1,prod-1,Producto,herbal,hierbas,botica,desc,10.00,true\n",
        )
        response = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote_id}/", **self.auth)
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["resumen"]["total"], 1)
        self.assertEqual(data["filas"][0]["identificador"], "SKU-1")
        self.assertIn("resumen_datos", data["filas"][0])

    def test_confirmar_seleccionadas_y_validas_mantiene_staging(self):
        lote_id = self._crear_lote(
            "productos",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-2,prod-2,Producto 2,herbal,hierbas,botica,desc,10.00,true\nSKU-3,prod-3,Producto 3,herbal,hierbas,botica,desc,10.00,true\n",
        )
        detalle = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote_id}/", **self.auth).json()
        fila_id = detalle["filas"][0]["id"]
        self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_id}/filas/{fila_id}/descartar/",
            data=json.dumps({}),
            content_type="application/json",
            **self.auth,
        )
        response = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_id}/confirmar-validas/",
            data=json.dumps({}),
            content_type="application/json",
            **self.auth,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["confirmadas"], 1)
        self.assertTrue(ProductoModelo.objects.filter(slug="prod-3").exists())

    def test_imagenes_revalidacion_y_cancelacion_siguen_operativas(self):
        lote_id = self._crear_lote(
            "productos",
            "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,publicado\nSKU-4,prod-4,Producto 4,herbal,hierbas,botica,desc,10.00,true\n",
        )
        fila_id = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote_id}/", **self.auth).json()["filas"][0]["id"]
        subir = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_id}/filas/{fila_id}/imagen/", data={"imagen": self._imagen_png_valida()}, **self.auth)
        self.assertEqual(subir.status_code, 200)
        quitar = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_id}/filas/{fila_id}/imagen/eliminar/", data=json.dumps({}), content_type="application/json", **self.auth)
        self.assertEqual(quitar.status_code, 200)
        revalidar = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_id}/revalidar/", data=json.dumps({}), content_type="application/json", **self.auth)
        self.assertEqual(revalidar.status_code, 200)
        cancelar = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_id}/cancelar/", data=json.dumps({}), content_type="application/json", **self.auth)
        self.assertEqual(cancelar.status_code, 200)
        self.assertFalse(ImportacionLoteModelo.objects.filter(id=lote_id).exists())

    def test_importacion_backend_core_sigue_cubriendo_entidades(self):
        lote_seccion = self._crear_lote("secciones_publicas", "slug,nombre,publicada\nsec-2,Sección 2,true\n")
        self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_seccion}/confirmar-validas/", data=json.dumps({}), content_type="application/json", **self.auth)
        lote_articulo = self._crear_lote("articulos_editoriales", "slug,titulo,resumen,contenido,publicado,indexable,seccion_publica\na-1,T,r,c,true,true,sec-2\n")
        self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_articulo}/confirmar-validas/", data=json.dumps({}), content_type="application/json", **self.auth)
        lote_ritual = self._crear_lote("rituales", "slug,nombre,contexto_breve,contenido,publicado,intenciones_relacionadas\nr-1,R,c,c,true,claridad\n")
        self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote_ritual}/confirmar-validas/", data=json.dumps({}), content_type="application/json", **self.auth)
        self.assertTrue(SeccionPublicaModelo.objects.filter(slug="sec-2").exists())
        self.assertTrue(ArticuloEditorialModelo.objects.filter(slug="a-1").exists())
        self.assertTrue(RitualModelo.objects.filter(slug="r-1").exists())
