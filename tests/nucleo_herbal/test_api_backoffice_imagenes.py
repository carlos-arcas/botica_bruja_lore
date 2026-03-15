from __future__ import annotations

import base64

import json

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ArticuloEditorialModelo, RitualModelo, SeccionPublicaModelo


@override_settings(MEDIA_ROOT="/tmp/botica_test_media")
class ApiBackofficeImagenesTests(TestCase):
    def setUp(self) -> None:
        self.staff = get_user_model().objects.create_user(username="staff-img", password="x", is_staff=True)
        self.client.force_login(self.staff)

    def _imagen_png_valida(self, nombre: str = "demo.png") -> SimpleUploadedFile:
        data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sXz8QAAAABJRU5ErkJggg=="
        )
        return SimpleUploadedFile(nombre, data, content_type="image/png")

    def test_subida_imagen_backoffice_devuelve_url_webp(self) -> None:
        response = self.client.post(
            "/api/v1/backoffice/imagenes/subir/",
            {"imagen": self._imagen_png_valida(), "prefijo": "backoffice/productos"},
        )

        if response.status_code == 200:
            self.assertIn(".webp", response.json()["imagen_url"])
            return
        self.assertEqual(response.status_code, 400)
        self.assertIn("WebP", response.json()["detalle"])

    def test_subida_imagen_invalida_muestra_error_controlado(self) -> None:
        archivo = SimpleUploadedFile("demo.txt", b"hola", content_type="text/plain")
        response = self.client.post("/api/v1/backoffice/imagenes/subir/", {"imagen": archivo})

        self.assertEqual(response.status_code, 400)
        self.assertIn("Formato de imagen no permitido", response.json()["detalle"])

    def test_guardado_modulos_mantiene_compatibilidad_imagen_url(self) -> None:
        seccion = SeccionPublicaModelo.objects.create(slug="guia", nombre="Guia", publicada=True)
        imagen_url = "https://cdn.test/imagen.webp"

        producto = self.client.post(
            "/api/v1/backoffice/productos/guardar/",
            data=json.dumps({
                "nombre": "Producto con imagen",
                "seccion_publica": "botica-natural",
                "tipo_producto": "hierba",
                "categoria_comercial": "uso",
                "imagen_url": imagen_url,
            }),
            content_type="application/json",
        )
        ritual = self.client.post(
            "/api/v1/backoffice/rituales/guardar/",
            data=json.dumps({"nombre": "Ritual con imagen", "imagen_url": imagen_url}),
            content_type="application/json",
        )
        editorial = self.client.post(
            "/api/v1/backoffice/editorial/guardar/",
            data=json.dumps({"titulo": "Articulo con imagen", "contenido": "x", "seccion_publica": seccion.slug, "imagen_url": imagen_url}),
            content_type="application/json",
        )

        self.assertEqual(producto.status_code, 200)
        self.assertEqual(ritual.status_code, 200)
        self.assertEqual(editorial.status_code, 200)
        self.assertEqual(producto.json()["item"]["imagen_url"], imagen_url)
        self.assertEqual(RitualModelo.objects.get(nombre="Ritual con imagen").imagen_url, imagen_url)
        self.assertEqual(ArticuloEditorialModelo.objects.get(titulo="Articulo con imagen").imagen_url, imagen_url)
