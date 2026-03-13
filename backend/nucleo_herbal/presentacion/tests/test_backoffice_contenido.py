from __future__ import annotations

import io
import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import ErrorImagenWebP, guardar_imagen_fila
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ArticuloEditorialModelo, ProductoModelo, RitualModelo, SeccionPublicaModelo
from backend.nucleo_herbal.presentacion.backoffice_auth import crear_token_backoffice


class BackofficeContenidoTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(username="staff", password="x", is_staff=True, is_active=True)
        self.no_staff = user_model.objects.create_user(username="nostaff", password="x", is_staff=False, is_active=True)

    def _auth(self, staff: bool = True) -> dict[str, str]:
        user = self.staff if staff else self.no_staff
        return {"HTTP_AUTHORIZATION": f"Bearer {crear_token_backoffice(user)}"}

    def _crear_lote_csv(self) -> int:
        contenido = "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,imagen_url,publicado,orden_publicacion\nSKU-NEW,new-prod,Nuevo 2,te,cat,botica-natural,desc,8.99,,true,2\n"
        archivo = io.BytesIO(contenido.encode("utf-8"))
        archivo.name = "productos.csv"
        r = self.client.post("/api/v1/backoffice/importacion/lotes/", data={"entidad": "productos", "modo": "crear_actualizar", "archivo": archivo}, **self._auth())
        return r.json()["lote_id"]

    def test_producto_create_update_publish_and_permiso(self):
        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps({}), content_type="application/json", **self._auth(staff=False))
        self.assertEqual(r.status_code, 403)

        payload = {"sku": "SKU-1", "nombre": "Producto 1", "tipo_producto": "te", "categoria_comercial": "herbal", "seccion_publica": "botica-natural", "descripcion_corta": "x", "precio_visible": "9.99", "imagen_url": "", "orden_publicacion": 2, "publicado": False}
        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(r.status_code, 200)
        pid = r.json()["item"]["id"]

        r = self.client.post(f"/api/v1/backoffice/productos/{pid}/publicacion/", data=json.dumps({"publicado": True}), content_type="application/json", **self._auth())
        self.assertEqual(r.status_code, 200)
        self.assertTrue(ProductoModelo.objects.get(id=pid).publicado)

        payload["id"] = pid
        payload["nombre"] = "Producto editado"
        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(r.status_code, 200)
        self.assertEqual(ProductoModelo.objects.get(id=pid).nombre, "Producto editado")

    def test_ritual_editorial_seccion_publish(self):
        seccion = SeccionPublicaModelo.objects.create(slug="guias", nombre="Guías", publicada=True)

        rr = self.client.post("/api/v1/backoffice/rituales/guardar/", data=json.dumps({"nombre": "Ritual", "contexto_breve": "c", "contenido": "d", "imagen_url": "", "publicado": False}), content_type="application/json", **self._auth())
        rid = rr.json()["item"]["id"]
        self.client.post(f"/api/v1/backoffice/rituales/{rid}/publicacion/", data=json.dumps({"publicado": True}), content_type="application/json", **self._auth())
        self.assertTrue(RitualModelo.objects.get(id=rid).publicado)

        ra = self.client.post("/api/v1/backoffice/editorial/guardar/", data=json.dumps({"titulo": "Articulo", "resumen": "r", "contenido": "c", "tema": "t", "hub": "h", "subhub": "s", "imagen_url": "", "indexable": True, "publicado": False, "seccion_publica": "guias"}), content_type="application/json", **self._auth())
        aid = ra.json()["item"]["id"]
        self.client.post(f"/api/v1/backoffice/editorial/{aid}/publicacion/", data=json.dumps({"publicado": True}), content_type="application/json", **self._auth())
        self.assertTrue(ArticuloEditorialModelo.objects.get(id=aid).publicado)

        rs = self.client.post("/api/v1/backoffice/secciones/guardar/", data=json.dumps({"id": seccion.id, "nombre": "Guías nuevas", "descripcion": "", "orden": 1, "publicada": True}), content_type="application/json", **self._auth())
        sid = rs.json()["item"]["id"]
        self.client.post(f"/api/v1/backoffice/secciones/{sid}/publicacion/", data=json.dumps({"publicado": False}), content_type="application/json", **self._auth())
        self.assertFalse(SeccionPublicaModelo.objects.get(id=sid).publicada)

    def test_slug_e_id_automaticos(self):
        payload = {"sku": "SKU-AUTO", "nombre": "Producto Auto", "tipo_producto": "te", "categoria_comercial": "herbal", "seccion_publica": "botica-natural", "descripcion_corta": "x", "precio_visible": "9.99", "publicado": False}
        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(r.status_code, 200)
        item = r.json()["item"]
        self.assertTrue(item["id"])
        self.assertEqual(item["slug"], "producto-auto")

    def test_exportacion_modulos_csv_y_xlsx(self):
        ProductoModelo.objects.create(id="p-exp", sku="SKU-EXP", slug="prod-exp", nombre="Producto Export", tipo_producto="te", categoria_comercial="cat", seccion_publica="botica-natural", descripcion_corta="", precio_visible="1", imagen_url="", orden_publicacion=1, publicado=True)
        r_csv = self.client.get("/api/v1/backoffice/productos/exportar/?tipo=inventario&formato=csv", **self._auth())
        r_xlsx = self.client.get("/api/v1/backoffice/productos/exportar/?tipo=inventario&formato=xlsx", **self._auth())
        self.assertEqual(r_csv.status_code, 200)
        self.assertEqual(r_xlsx.status_code, 200)
        self.assertIn("sku", r_csv.content.decode("utf-8"))
        self.assertTrue(r_xlsx.content.startswith(b"PK"))

    def test_import_create_only_and_upsert(self):
        ProductoModelo.objects.create(id="p1", sku="SKU-EXIST", slug="existente", nombre="Exist", tipo_producto="te", categoria_comercial="cat", seccion_publica="botica-natural", descripcion_corta="", precio_visible="1", imagen_url="", orden_publicacion=1, publicado=True)
        contenido = "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,imagen_url,publicado,orden_publicacion\nSKU-EXIST,existente,Nuevo,te,cat,botica-natural,desc,4.99,,true,3\nSKU-NEW,new-prod,Nuevo 2,te,cat,botica-natural,desc,8.99,,true,2\n"
        archivo = io.BytesIO(contenido.encode("utf-8"))
        archivo.name = "productos.csv"

        r = self.client.post("/api/v1/backoffice/importacion/lotes/", data={"entidad": "productos", "modo": "solo_crear", "archivo": archivo}, **self._auth())
        lote = r.json()["lote_id"]
        self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote}/confirmar/", data=json.dumps({}), content_type="application/json", **self._auth())
        self.assertEqual(ProductoModelo.objects.filter(slug="existente").count(), 1)
        self.assertTrue(ProductoModelo.objects.filter(slug="new-prod").exists())

    @patch("backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes.Image", None)
    def test_webp_estricto_falla_si_no_hay_conversion(self):
        archivo = SimpleUploadedFile("foto.png", b"no-image", content_type="image/png")
        with self.assertRaises(ErrorImagenWebP):
            guardar_imagen_fila(archivo, 1)

    @patch("backend.nucleo_herbal.presentacion.backoffice_views.importacion.guardar_imagen_fila")
    def test_staging_imagen_por_fila_reemplazo_eliminacion_y_descarte(self, guardar_mock):
        guardar_mock.return_value = "https://cdn.test/fila.webp"
        lote = self._crear_lote_csv()
        detalle = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote}/", **self._auth()).json()
        fila_id = detalle["filas"][0]["id"]

        imagen = SimpleUploadedFile("foto.png", b"img-bytes", content_type="image/png")
        r1 = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/imagen/", data={"imagen": imagen}, **self._auth())
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r1.json()["fila"]["imagen"], "https://cdn.test/fila.webp")

        r2 = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/imagen/eliminar/", data=json.dumps({}), content_type="application/json", **self._auth())
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["fila"]["imagen"], "")

        r3 = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/descartar/", data=json.dumps({}), content_type="application/json", **self._auth())
        self.assertEqual(r3.status_code, 200)
        self.assertEqual(r3.json()["fila"]["estado"], "descartada")

    @patch("backend.nucleo_herbal.presentacion.backoffice_views.importacion.guardar_imagen_fila")
    def test_error_claro_si_falla_conversion_webp_en_fila(self, guardar_mock):
        guardar_mock.side_effect = ErrorImagenWebP("No fue posible convertir la imagen a WebP.")
        lote = self._crear_lote_csv()
        detalle = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote}/", **self._auth()).json()
        fila_id = detalle["filas"][0]["id"]
        imagen = SimpleUploadedFile("foto.png", b"img-bytes", content_type="image/png")

        r = self.client.post(f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/imagen/", data={"imagen": imagen}, **self._auth())
        self.assertEqual(r.status_code, 422)
        self.assertIn("WebP", r.json()["detalle"])
