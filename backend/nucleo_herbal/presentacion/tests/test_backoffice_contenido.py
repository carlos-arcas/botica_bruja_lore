from __future__ import annotations

import io
import json
from unittest.mock import patch

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, RequestFactory, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import ErrorImagenWebP, ErrorValidacionImagen, guardar_imagen_fila
from backend.nucleo_herbal.infraestructura.persistencia_django.models import ArticuloEditorialModelo, PlantaModelo, ProductoModelo, RitualModelo, SeccionPublicaModelo
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.presentacion.backoffice_auth import crear_token_backoffice
from backend.nucleo_herbal.presentacion.backoffice_views.importacion_helpers import json_importacion
from backend.nucleo_herbal.presentacion.backoffice_views.shared import json_no_autorizado, operation_id
from backend.nucleo_herbal.presentacion.backoffice_views.productos_contrato import (
    CAMPOS_CONTRATO_ENTRADA,
    CAMPOS_LEGACY_TOLERADOS_PRODUCTO,
    CAMPOS_PERSISTIDOS_PRODUCTO,
    CAMPOS_UI_CANONICOS_PRODUCTO,
    normalizar_payload_producto,
)


class BackofficeContenidoTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(username="staff", password="x", is_staff=True, is_active=True)
        self.no_staff = user_model.objects.create_user(username="nostaff", password="x", is_staff=False, is_active=True)

    def _auth(self, staff: bool = True) -> dict[str, str]:
        user = self.staff if staff else self.no_staff
        return {"HTTP_AUTHORIZATION": f"Bearer {crear_token_backoffice(user)}"}


    def test_json_no_autorizado_incluye_operation_id_y_conserva_x_request_id(self):
        request = RequestFactory().get("/api/v1/backoffice/productos/", HTTP_X_REQUEST_ID="req-403-1")

        respuesta = json_no_autorizado(request)

        self.assertEqual(respuesta.status_code, 403)
        cuerpo = json.loads(respuesta.content)
        self.assertEqual(cuerpo["detalle"], "Acceso restringido a staff.")
        self.assertEqual(cuerpo["operation_id"], "req-403-1")

    def test_backoffice_403_reutiliza_operation_id_en_estado_y_listado(self):
        estado = self.client.get("/api/v1/backoffice/estado/", HTTP_X_REQUEST_ID="estado-403")
        listado = self.client.get("/api/v1/backoffice/productos/", HTTP_X_REQUEST_ID="lista-403")

        self.assertEqual(estado.status_code, 403)
        self.assertEqual(estado.json()["operation_id"], "estado-403")
        self.assertEqual(listado.status_code, 403)
        self.assertEqual(listado.json()["operation_id"], "lista-403")

    def test_operation_id_se_cachea_por_request_sin_header(self):
        request = RequestFactory().get("/api/v1/backoffice/importacion/lotes/1/")

        primero = operation_id(request)
        segundo = operation_id(request)
        respuesta = json_importacion("fallo", 400, request)

        self.assertEqual(primero, segundo)
        cuerpo = json.loads(respuesta.content)
        self.assertEqual(cuerpo["operation_id"], primero)

    def _crear_lote_csv(self) -> int:
        contenido = "sku,slug,nombre,tipo_producto,categoria_comercial,seccion_publica,descripcion_corta,precio_visible,imagen_url,publicado,orden_publicacion\nSKU-NEW,new-prod,Nuevo 2,te,cat,botica-natural,desc,8.99,,true,2\n"
        archivo = io.BytesIO(contenido.encode("utf-8"))
        archivo.name = "productos.csv"
        r = self.client.post("/api/v1/backoffice/importacion/lotes/", data={"entidad": "productos", "modo": "crear_actualizar", "archivo": archivo}, **self._auth())
        return r.json()["lote_id"]


    def test_producto_botica_normaliza_tipo_producto_legacy_en_guardado(self):
        PlantaModelo.objects.create(id="pla-legacy", slug="pla-legacy", nombre="Planta legacy")
        payload = {
            "sku": "SKU-LEGACY",
            "nombre": "Producto Legacy Botica",
            "tipo_producto": "a-granel-50g",
            "categoria_comercial": "",
            "formato_peso": "a-granel-50g",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_visible": "9.99",
            "planta_id": "pla-legacy",
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

    def test_importacion_sin_x_request_id_mantiene_operation_id_en_success_y_not_found(self):
        lote = self._crear_lote_csv()

        detalle = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote}/", **self._auth())
        self.assertEqual(detalle.status_code, 200)
        operation_id_detalle = detalle.json()["operation_id"]
        self.assertTrue(operation_id_detalle)

        confirmar = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote}/confirmar-validas/",
            data=json.dumps({}),
            content_type="application/json",
            **self._auth(),
        )
        self.assertEqual(confirmar.status_code, 200)
        self.assertEqual(confirmar.json()["operation_id"], confirmar.json()["detalle"]["operation_id"])

        lote_no_encontrado = self.client.get("/api/v1/backoffice/importacion/lotes/999999/", **self._auth())
        self.assertEqual(lote_no_encontrado.status_code, 404)
        self.assertTrue(lote_no_encontrado.json()["operation_id"])

        fila_no_encontrada = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote}/filas/999999/seleccion/",
            data=json.dumps({"seleccionado": True}),
            content_type="application/json",
            **self._auth(),
        )
        self.assertEqual(fila_no_encontrada.status_code, 404)
        self.assertTrue(fila_no_encontrada.json()["operation_id"])

    def test_importacion_errores_y_exitos_incluyen_operation_id(self):
        respuesta_archivo = self.client.post(
            "/api/v1/backoffice/importacion/lotes/",
            data={"entidad": "productos", "modo": "crear_actualizar"},
            HTTP_X_REQUEST_ID="imp-archivo-1",
            **self._auth(),
        )
        self.assertEqual(respuesta_archivo.status_code, 400)
        self.assertEqual(respuesta_archivo.json()["operation_id"], "imp-archivo-1")

        lote = self._crear_lote_csv()
        detalle = self.client.get(
            f"/api/v1/backoffice/importacion/lotes/{lote}/",
            HTTP_X_REQUEST_ID="imp-detalle-1",
            **self._auth(),
        )
        self.assertEqual(detalle.status_code, 200)
        self.assertEqual(detalle.json()["operation_id"], "imp-detalle-1")
        fila_id = detalle.json()["filas"][0]["id"]

        confirmar = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote}/confirmar/",
            data=json.dumps({"filas_ids": [fila_id]}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-confirmar-1",
            **self._auth(),
        )
        self.assertEqual(confirmar.status_code, 200)
        self.assertEqual(confirmar.json()["operation_id"], "imp-confirmar-1")
        self.assertEqual(confirmar.json()["detalle"]["operation_id"], "imp-confirmar-1")

        fila_confirmada = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/descartar/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-fila-confirmada-1",
            **self._auth(),
        )
        self.assertEqual(fila_confirmada.status_code, 409)
        self.assertEqual(fila_confirmada.json()["operation_id"], "imp-fila-confirmada-1")

        lote_no_encontrado = self.client.get(
            "/api/v1/backoffice/importacion/lotes/999999/",
            HTTP_X_REQUEST_ID="imp-lote-404",
            **self._auth(),
        )
        self.assertEqual(lote_no_encontrado.status_code, 404)
        self.assertEqual(lote_no_encontrado.json()["operation_id"], "imp-lote-404")

        fila_no_encontrada = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote}/filas/999999/seleccion/",
            data=json.dumps({"seleccionado": True}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-fila-404",
            **self._auth(),
        )
        self.assertEqual(fila_no_encontrada.status_code, 404)
        self.assertEqual(fila_no_encontrada.json()["operation_id"], "imp-fila-404")

    @patch("backend.nucleo_herbal.presentacion.backoffice_views.importacion.guardar_imagen_fila")
    def test_importacion_operaciones_de_lote_y_fila_reutilizan_operation_id(self, guardar_mock):
        guardar_mock.return_value = "https://cdn.test/fila.webp"
        lote = self._crear_lote_csv()

        confirmar_validas = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote}/confirmar-validas/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-validas-1",
            **self._auth(),
        )
        self.assertEqual(confirmar_validas.status_code, 200)
        self.assertEqual(confirmar_validas.json()["operation_id"], "imp-validas-1")

        lote_revalidar = self._crear_lote_csv()
        revalidar = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_revalidar}/revalidar/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-revalidar-1",
            **self._auth(),
        )
        self.assertEqual(revalidar.status_code, 200)
        self.assertEqual(revalidar.json()["operation_id"], "imp-revalidar-1")
        self.assertEqual(revalidar.json()["detalle"]["operation_id"], "imp-revalidar-1")

        detalle = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote_revalidar}/", **self._auth()).json()
        fila_id = detalle["filas"][0]["id"]

        seleccion = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_revalidar}/filas/{fila_id}/seleccion/",
            data=json.dumps({"seleccionado": False}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-seleccion-1",
            **self._auth(),
        )
        self.assertEqual(seleccion.status_code, 200)
        self.assertEqual(seleccion.json()["operation_id"], "imp-seleccion-1")

        descarte = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_revalidar}/filas/{fila_id}/descartar/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-descartar-1",
            **self._auth(),
        )
        self.assertEqual(descarte.status_code, 200)
        self.assertEqual(descarte.json()["operation_id"], "imp-descartar-1")

        lote_imagen = self._crear_lote_csv()
        fila_imagen = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote_imagen}/", **self._auth()).json()["filas"][0]["id"]
        imagen = SimpleUploadedFile("foto.png", b"img-bytes", content_type="image/png")
        adjuntar = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_imagen}/filas/{fila_imagen}/imagen/",
            data={"imagen": imagen},
            HTTP_X_REQUEST_ID="imp-imagen-ok-1",
            **self._auth(),
        )
        self.assertEqual(adjuntar.status_code, 200)
        self.assertEqual(adjuntar.json()["operation_id"], "imp-imagen-ok-1")

        eliminar = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_imagen}/filas/{fila_imagen}/imagen/eliminar/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-imagen-del-1",
            **self._auth(),
        )
        self.assertEqual(eliminar.status_code, 200)
        self.assertEqual(eliminar.json()["operation_id"], "imp-imagen-del-1")

        cancelar = self.client.post(
            f"/api/v1/backoffice/importacion/lotes/{lote_imagen}/cancelar/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="imp-cancelar-1",
            **self._auth(),
        )
        self.assertEqual(cancelar.status_code, 200)
        self.assertEqual(cancelar.json()["operation_id"], "imp-cancelar-1")

    @patch("backend.nucleo_herbal.presentacion.backoffice_views.importacion.guardar_imagen_fila")
    def test_importacion_errores_imagen_reutilizan_operation_id_en_logs_y_respuesta(self, guardar_mock):
        lote = self._crear_lote_csv()
        fila_id = self.client.get(f"/api/v1/backoffice/importacion/lotes/{lote}/", **self._auth()).json()["filas"][0]["id"]

        def fallar_validacion(*_args, **_kwargs):
            raise ErrorValidacionImagen("Formato de imagen inválido.")

        guardar_mock.side_effect = fallar_validacion
        with self.assertLogs("backend.nucleo_herbal.presentacion.backoffice_views.importacion_helpers", level="INFO") as logs:
            respuesta = self.client.post(
                f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/imagen/",
                data={"imagen": SimpleUploadedFile("foto.png", b"img-bytes", content_type="image/png")},
                **self._auth(),
            )

        self.assertEqual(respuesta.status_code, 422)
        self.assertEqual(respuesta.json()["operation_id"], logs.records[0].operation_id)
        self.assertEqual(logs.records[0].resultado, "error")
        self.assertEqual(logs.records[0].error, "Formato de imagen inválido.")

        def fallar_webp(*_args, **_kwargs):
            raise ErrorImagenWebP("No fue posible convertir la imagen a WebP.")

        guardar_mock.side_effect = fallar_webp
        with self.assertLogs("backend.nucleo_herbal.presentacion.backoffice_views.importacion_helpers", level="INFO") as logs_webp:
            respuesta_webp = self.client.post(
                f"/api/v1/backoffice/importacion/lotes/{lote}/filas/{fila_id}/imagen/",
                data={"imagen": SimpleUploadedFile("foto.png", b"img-bytes", content_type="image/png")},
                **self._auth(),
            )
        self.assertEqual(respuesta_webp.status_code, 422)
        self.assertEqual(respuesta_webp.json()["operation_id"], logs_webp.records[0].operation_id)

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

    def test_publicacion_producto_invalido_devuelve_detalle_errores_y_operation_id(self):
        producto = ProductoModelo.objects.create(
            id="prod-invalido-publicacion",
            sku="SKU-PUB-INV",
            slug="prod-invalido-publicacion",
            nombre="Hierba inválida",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas",
            seccion_publica="botica-natural",
            beneficio_principal="calma",
            beneficios_secundarios="energia",
            formato_comercial="hoja-seca",
            modo_uso="infusion",
            categoria_visible="hierbas",
            precio_visible="4,20 €",
            publicado=False,
        )

        respuesta = self.client.post(
            f"/api/v1/backoffice/productos/{producto.id}/publicacion/",
            data=json.dumps({"publicado": True}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="pub-req-1",
            **self._auth(),
        )

        self.assertEqual(respuesta.status_code, 400)
        cuerpo = respuesta.json()
        self.assertIn("planta", cuerpo["detalle"].lower())
        self.assertEqual(cuerpo["errores"]["planta_id"], "Selecciona una planta asociada.")
        self.assertEqual(cuerpo["operation_id"], "pub-req-1")
        producto.refresh_from_db()
        self.assertFalse(producto.publicado)

    def test_despublicacion_producto_invalido_existente_sigue_permitida(self):
        producto = ProductoModelo.objects.create(
            id="prod-invalido-despublicacion",
            sku="SKU-PUB-DES",
            slug="prod-invalido-despublicacion",
            nombre="Hierba inválida publicada",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas",
            seccion_publica="botica-natural",
            beneficio_principal="calma",
            beneficios_secundarios="energia",
            formato_comercial="hoja-seca",
            modo_uso="infusion",
            categoria_visible="hierbas",
            precio_visible="4,20 €",
            publicado=True,
        )

        respuesta = self.client.post(
            f"/api/v1/backoffice/productos/{producto.id}/publicacion/",
            data=json.dumps({"publicado": False}),
            content_type="application/json",
            **self._auth(),
        )

        self.assertEqual(respuesta.status_code, 200)
        producto.refresh_from_db()
        self.assertFalse(producto.publicado)

    def test_publicacion_producto_valido_funciona(self):
        PlantaModelo.objects.create(id="pla-pub-ok", slug="melisa-pub-ok", nombre="Melisa")
        producto = ProductoModelo.objects.create(
            id="prod-valido-publicacion",
            sku="SKU-PUB-OK",
            slug="prod-valido-publicacion",
            nombre="Hierba válida",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas",
            seccion_publica="botica-natural",
            beneficio_principal="calma",
            beneficios_secundarios="energia",
            formato_comercial="hoja-seca",
            modo_uso="infusion",
            categoria_visible="hierbas",
            precio_visible="4,20 €",
            planta_id="pla-pub-ok",
            publicado=False,
        )

        respuesta = self.client.post(
            f"/api/v1/backoffice/productos/{producto.id}/publicacion/",
            data=json.dumps({"publicado": True}),
            content_type="application/json",
            **self._auth(),
        )

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()["item"]["publicado"])
        producto.refresh_from_db()
        self.assertTrue(producto.publicado)

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


    def test_precio_visible_y_categoria_visible_se_derivan_del_contrato_normalizado(self):
        payload = {
            "sku": "SKU-DERIVA-1",
            "nombre": "Producto Derivado",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "inciensos",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_numerico": "7.08",
            "beneficio_principal": "calma",
            "beneficios_secundarios": ["energia", "calma"],
            "formato_comercial": "resina",
            "modo_uso": "sahumado",
            "categoria_visible": "rituales",
            "publicado": False,
        }

        respuesta = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())

        self.assertEqual(respuesta.status_code, 200)
        item = respuesta.json()["item"]
        self.assertEqual(item["precio_numerico"], "7.08")
        self.assertEqual(item["precio_visible"], "7,08 €")
        self.assertEqual(item["categoria_visible"], "inciensos")
        producto = ProductoModelo.objects.get(id=item["id"])
        self.assertEqual(producto.precio_numerico, Decimal("7.08"))
        self.assertEqual(producto.precio_visible, "7,08 €")
        self.assertEqual(producto.categoria_visible, "inciensos")
        self.assertEqual(producto.beneficios_secundarios, "energia,calma")

    def test_contrato_producto_normalizado_coincide_con_campos_persistidos(self):
        payload = {
            "sku": "SKU-CONTRATO-1",
            "nombre": "Contrato Botica",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "inciensos",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_numerico": "7.08",
            "beneficio_principal": "calma",
            "beneficios_secundarios": ["energia", "calma"],
            "formato_comercial": "resina",
            "modo_uso": "sahumado",
            "publicado": False,
        }

        normalizado = normalizar_payload_producto(payload)

        self.assertEqual(tuple(normalizado.campos_normalizados.keys()), CAMPOS_PERSISTIDOS_PRODUCTO)
        self.assertEqual(normalizado.campos_normalizados["precio_visible"], "7,08 €")
        self.assertEqual(normalizado.campos_normalizados["categoria_visible"], "inciensos")
        self.assertNotIn("precio_visible", CAMPOS_UI_CANONICOS_PRODUCTO)
        self.assertNotIn("categoria_visible", CAMPOS_UI_CANONICOS_PRODUCTO)

    def test_contrato_producto_separa_campos_canonicos_y_legacy_tolerados(self):
        self.assertIn("precio_numerico", CAMPOS_UI_CANONICOS_PRODUCTO)
        self.assertIn("precio_visible", CAMPOS_LEGACY_TOLERADOS_PRODUCTO)
        self.assertIn("categoria_visible", CAMPOS_LEGACY_TOLERADOS_PRODUCTO)
        self.assertNotIn("precio_visible", CAMPOS_UI_CANONICOS_PRODUCTO)
        self.assertNotIn("categoria_visible", CAMPOS_UI_CANONICOS_PRODUCTO)
        self.assertEqual(CAMPOS_CONTRATO_ENTRADA, CAMPOS_UI_CANONICOS_PRODUCTO | CAMPOS_LEGACY_TOLERADOS_PRODUCTO)

    def test_payload_legacy_tolerado_se_registra_sin_romper_guardado(self):
        payload = {
            "sku": "SKU-LEGACY-LOG-1",
            "nombre": "Producto legacy tolerado",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "inciensos",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_visible": "9.50",
            "precio_numerico": "9.50",
            "beneficio_principal": "calma",
            "beneficios_secundarios": ["energia"],
            "formato_comercial": "resina",
            "modo_uso": "sahumado",
            "categoria_visible": "rituales",
            "publicado": False,
        }

        with self.assertLogs("backend.nucleo_herbal.presentacion.backoffice_views.productos", level="INFO") as logs:
            respuesta = self.client.post(
                "/api/v1/backoffice/productos/guardar/",
                data=json.dumps(payload),
                content_type="application/json",
                **self._auth(),
            )

        self.assertEqual(respuesta.status_code, 200)
        self.assertIn("payload_legacy_detectado", "\n".join(logs.output))
        registro_legacy = next(record for record in logs.records if record.msg == "payload_legacy_detectado")
        self.assertEqual(registro_legacy.campos_legacy, ["categoria_visible", "precio_visible"])
        item = respuesta.json()["item"]
        self.assertEqual(item["precio_visible"], "9,50 €")
        self.assertEqual(item["categoria_visible"], "inciensos")

    def test_create_y_edit_comparten_normalizacion_critica(self):
        payload_base = {
            "nombre": "Producto coherente",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "inciensos",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_numerico": "9.50",
            "beneficio_principal": "calma",
            "beneficios_secundarios": ["energia", "calma"],
            "formato_comercial": "resina",
            "modo_uso": "sahumado",
            "publicado": True,
        }

        respuesta_crear = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload_base), content_type="application/json", **self._auth())
        self.assertEqual(respuesta_crear.status_code, 200)
        producto_id = respuesta_crear.json()["item"]["id"]

        respuesta_editar = self.client.post(
            "/api/v1/backoffice/productos/guardar/",
            data=json.dumps({**payload_base, "id": producto_id, "nombre": "Producto coherente editado"}),
            content_type="application/json",
            **self._auth(),
        )

        self.assertEqual(respuesta_editar.status_code, 200)
        item = respuesta_editar.json()["item"]
        self.assertEqual(item["precio_visible"], "9,50 €")
        self.assertEqual(item["categoria_visible"], "inciensos")
        self.assertEqual(item["beneficios_secundarios"], "energia,calma")
        self.assertTrue(item["publicado"])

    def test_error_de_respuesta_hace_rollback_y_no_deja_producto_visible(self):
        total_antes = ProductoModelo.objects.count()
        payload = {
            "sku": "SKU-ROLLBACK-1",
            "nombre": "Producto rollback",
            "tipo_producto": "inciensos-y-sahumerios",
            "categoria_comercial": "inciensos",
            "seccion_publica": "botica-natural",
            "descripcion_corta": "x",
            "precio_numerico": "9.50",
            "beneficio_principal": "calma",
            "beneficios_secundarios": ["energia"],
            "formato_comercial": "resina",
            "modo_uso": "sahumado",
            "publicado": True,
            "__forzar_error_respuesta__": True,
        }

        respuesta = self.client.post("/api/v1/backoffice/productos/guardar/", data=json.dumps(payload), content_type="application/json", **self._auth())

        self.assertEqual(respuesta.status_code, 500)
        self.assertEqual(ProductoModelo.objects.count(), total_antes)
        self.assertFalse(ProductoModelo.objects.filter(sku="SKU-ROLLBACK-1").exists())

    def test_logging_estructurado_incluye_operation_id_modo_y_errores(self):
        payload = {
            "sku": "SKU-LOG-1",
            "nombre": "Producto log",
            "tipo_producto": "hierbas-a-granel",
            "categoria_comercial": "hierbas",
            "seccion_publica": "botica-natural",
            "precio_numerico": "4.20",
            "beneficio_principal": "calma",
            "beneficios_secundarios": ["energia"],
            "formato_comercial": "hoja-seca",
            "modo_uso": "infusion",
            "publicado": True,
        }

        with self.assertLogs("backend.nucleo_herbal.presentacion.backoffice_views.productos", level="INFO") as logs:
            respuesta = self.client.post(
                "/api/v1/backoffice/productos/guardar/",
                data=json.dumps(payload),
                content_type="application/json",
                HTTP_X_REQUEST_ID="req-123",
                **self._auth(),
            )

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(respuesta.json()["operation_id"], "req-123")
        salida = "\n".join(logs.output)
        self.assertIn("backoffice_producto_guardar_inicio", salida)
        self.assertIn("backoffice_producto_validacion_fallida", salida)
        self.assertEqual(logs.records[0].operation_id, "req-123")
        self.assertEqual(logs.records[0].modo, "crear")
        self.assertEqual(logs.records[-1].errores_validacion["planta_id"], "Selecciona una planta asociada.")


    @patch("backend.nucleo_herbal.presentacion.backoffice_views.pedidos.construir_servicios_backoffice_pedidos")
    def test_pedido_backoffice_error_incluye_operation_id(self, mock_servicios):
        class MarcarPreparandoInvalido:
            def ejecutar(self, pedido_id, operation_id, actor):
                raise ErrorDominio("Solo un pedido pagado puede pasar a preparando.")

        mock_servicios.return_value = type("Servicios", (), {"marcar_preparando": MarcarPreparandoInvalido()})()

        respuesta = self.client.post(
            "/api/v1/backoffice/pedidos/ped-err/preparando/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_REQUEST_ID="ped-op-1",
            **self._auth(),
        )

        self.assertEqual(respuesta.status_code, 400)
        cuerpo = respuesta.json()
        self.assertEqual(cuerpo["detalle"], "Solo un pedido pagado puede pasar a preparando.")
        self.assertEqual(cuerpo["operation_id"], "ped-op-1")
