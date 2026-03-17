from __future__ import annotations

import io
import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import ErrorImagenWebP, guardar_imagen_fila
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ArticuloEditorialModelo, PlantaModelo, ProductoModelo, RitualModelo, SeccionPublicaModelo
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


    def test_producto_botica_normaliza_tipo_producto_legacy_en_guardado(self):
        payload = {
            "sku": "SKU-LEGACY",
            "nombre": "Producto Legacy Botica",
            "tipo_producto": "a-granel-50g",
            "categoria_comercial": "",
            "formato_peso": "a-granel-50g",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_visible": "9.99",
            "publicado": True,
        }

        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())

        self.assertEqual(r.status_code, 200)
        item = r.json()["item"]
        self.assertEqual(item["tipo_producto"], "hierbas-a-granel")

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


    def test_ritual_y_editorial_guardan_productos_relacionados(self):
        producto = ProductoModelo.objects.create(
            id="prod-rel-1",
            sku="SKU-REL-1",
            slug="prod-rel-1",
            nombre="Producto Rel",
            tipo_producto="inciensos-y-sahumerios",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            publicado=True,
        )
        seccion = SeccionPublicaModelo.objects.create(slug="guias-rel", nombre="Guías Rel", publicada=True)

        rr = self.client.post(
            "/api/v1/backoffice/rituales/guardar/",
            data=json.dumps({
                "nombre": "Ritual productos",
                "contexto_breve": "c",
                "contenido": "d",
                "imagen_url": "",
                "publicado": False,
                "productos_relacionados": [producto.id],
            }),
            content_type="application/json",
            **self._auth(),
        )
        self.assertEqual(rr.status_code, 200)
        ritual = RitualModelo.objects.get(id=rr.json()["item"]["id"])
        self.assertEqual(list(ritual.productos_relacionados.values_list("id", flat=True)), [producto.id])

        ra = self.client.post(
            "/api/v1/backoffice/editorial/guardar/",
            data=json.dumps({
                "titulo": "Articulo con productos",
                "resumen": "r",
                "contenido": "c",
                "tema": "t",
                "hub": "h",
                "subhub": "s",
                "imagen_url": "",
                "indexable": True,
                "publicado": True,
                "seccion_publica": seccion.slug,
                "productos_relacionados": [producto.id],
            }),
            content_type="application/json",
            **self._auth(),
        )
        self.assertEqual(ra.status_code, 200)
        articulo = ArticuloEditorialModelo.objects.get(id=ra.json()["item"]["id"])
        self.assertEqual(list(articulo.productos_relacionados.values_list("id", flat=True)), [producto.id])

    def test_slug_e_id_automaticos(self):
        payload = {"sku": "SKU-AUTO", "nombre": "Producto Auto", "tipo_producto": "te", "categoria_comercial": "herbal", "seccion_publica": "botica-natural", "descripcion_corta": "x", "precio_visible": "9.99", "publicado": False}
        r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(r.status_code, 200)
        item = r.json()["item"]
        self.assertTrue(item["id"])
        self.assertEqual(item["slug"], "producto-auto")

    def test_sku_automatico_evita_colision_en_altas_repetidas(self):
        payload = {"nombre": "Producto Repetido", "tipo_producto": "te", "categoria_comercial": "herbal", "seccion_publica": "botica-natural", "descripcion_corta": "x", "precio_visible": "9.99", "publicado": False}
        primero = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        segundo = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(primero.status_code, 200)
        self.assertEqual(segundo.status_code, 200)
        self.assertNotEqual(primero.json()["item"]["sku"], segundo.json()["item"]["sku"])




    def test_alta_producto_persiste_y_reaparece_en_listados_admin_y_publico(self):
        payload = {
            "sku": "SKU-PERSIST",
            "nombre": "Producto Persistente",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "botica",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "Alta estable",
            "precio_visible": "11.50",
            "imagen_url": "",
            "publicado": True,
        }
        alta = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(alta.status_code, 200)
        producto_id = alta.json()["item"]["id"]

        self.assertTrue(ProductoModelo.objects.filter(id=producto_id).exists())

        listado_admin = self.client.get("/api/v1/backoffice/productos/?seccion=botica-natural", **self._auth())
        self.assertEqual(listado_admin.status_code, 200)
        ids_admin = [item["id"] for item in listado_admin.json()["items"]]
        self.assertIn(producto_id, ids_admin)

        listado_publico = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/")
        self.assertEqual(listado_publico.status_code, 200)
        slugs_publicos = [item["slug"] for item in listado_publico.json()["productos"]]
        self.assertIn("producto-persistente", slugs_publicos)

    def test_guardado_invalido_no_crea_registro_fantasma(self):
        total_antes = ProductoModelo.objects.count()
        payload = {
            "sku": "SKU-FANTASMA",
            "nombre": "",
            "tipo_producto": "te",
            "categoria_comercial": "herbal",
            "seccion_publica": "botica-natural",
            "publicado": True,
        }
        respuesta = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(ProductoModelo.objects.count(), total_antes)

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


    def test_filtros_publicos_botica_por_beneficio_formato_modo_precio(self):
        base = {
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "hierbas",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "imagen_url": "",
            "publicado": True,
        }
        payloads = [
            {**base, "sku": "SKU-FIL-1", "nombre": "Calma Infusion", "precio_visible": "5.50", "beneficio_principal": "calma", "beneficios_secundarios": "enfoque", "formato_comercial": "hoja-seca", "modo_uso": "infusion", "categoria_visible": "hierbas"},
            {**base, "sku": "SKU-FIL-2", "nombre": "Energia Sahumado", "precio_visible": "12.10", "beneficio_principal": "energia", "beneficios_secundarios": "calma", "formato_comercial": "resina", "modo_uso": "sahumado", "categoria_visible": "inciensos"},
        ]
        for payload in payloads:
            r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
            self.assertEqual(r.status_code, 200)

        por_beneficio = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/?beneficio=calma").json()["productos"]
        self.assertEqual([p["sku"] for p in por_beneficio], ["SKU-FIL-1"])

        por_formato = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/?formato=resina").json()["productos"]
        self.assertEqual([p["sku"] for p in por_formato], ["SKU-FIL-2"])

        por_modo = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/?modo_uso=infusion").json()["productos"]
        self.assertEqual([p["sku"] for p in por_modo], ["SKU-FIL-1"])

        por_precio = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/?precio_min=5&precio_max=6").json()["productos"]
        self.assertEqual([p["sku"] for p in por_precio], ["SKU-FIL-1"])


    def test_edicion_hierbas_a_granel_exige_planta_id(self):
        PlantaModelo.objects.create(id="pla-1", slug="menta", nombre="Menta")
        PlantaModelo.objects.create(id="pla-2", slug="melisa", nombre="Melisa")
        crear = {
            "sku": "SKU-HIERBA-1",
            "nombre": "Hierba Base",
            "tipo_producto": "hierbas-a-granel",
            "categoria_comercial": "hierbas",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_visible": "8.50",
            "beneficio_principal": "calma",
            "beneficios_secundarios": "energia",
            "formato_comercial": "hoja-seca",
            "modo_uso": "infusion",
            "categoria_visible": "hierbas",
            "planta_id": "pla-1",
            "publicado": False,
        }
        respuesta_crear = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(crear), content_type="application/json", **self._auth())
        self.assertEqual(respuesta_crear.status_code, 200)

        edicion_invalida = {**crear, "id": respuesta_crear.json()["item"]["id"], "planta_id": ""}
        respuesta_invalida = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(edicion_invalida), content_type="application/json", **self._auth())
        self.assertEqual(respuesta_invalida.status_code, 400)
        self.assertIn("planta", respuesta_invalida.json()["detalle"].lower())

        edicion_valida = {**edicion_invalida, "planta_id": "pla-2"}
        respuesta_valida = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(edicion_valida), content_type="application/json", **self._auth())
        self.assertEqual(respuesta_valida.status_code, 200)

    def test_guardado_botica_invalido_bloquea_publicacion(self):
        payload = {
            "sku": "SKU-INV-1",
            "nombre": "Invalido botica",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "hierbas",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_visible": "no-num",
            "beneficio_principal": "beneficio-random",
            "beneficios_secundarios": "calma",
            "formato_comercial": "hoja-seca",
            "modo_uso": "infusion",
            "categoria_visible": "hierbas",
            "publicado": True,
        }
        respuesta = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
        self.assertEqual(respuesta.status_code, 400)
        self.assertFalse(ProductoModelo.objects.filter(sku="SKU-INV-1").exists())

    def test_listado_publico_sin_limite_fijo_de_cinco(self):
        base = {
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "botica",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_visible": "9.90",
            "imagen_url": "",
            "beneficio_principal": "calma",
            "beneficios_secundarios": "energia",
            "formato_comercial": "resina",
            "modo_uso": "sahumado",
            "categoria_visible": "inciensos",
            "publicado": True,
        }
        for idx in range(7):
            payload = {**base, "sku": f"SKU-SIN-LIM-{idx}", "nombre": f"Producto {idx}"}
            r = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())
            self.assertEqual(r.status_code, 200)

        listado = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/").json()["productos"]
        self.assertGreaterEqual(len(listado), 7)
