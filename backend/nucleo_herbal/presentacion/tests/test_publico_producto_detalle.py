from __future__ import annotations

from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo


class PublicoProductoDetalleApiTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()

    def _crear_producto(self, *, slug: str, publicado: bool) -> ProductoModelo:
        return ProductoModelo.objects.create(
            id=f"id-{slug}",
            sku=f"SKU-{slug}",
            slug=slug,
            nombre=f"Producto {slug}",
            tipo_producto="inciensos-y-sahumerios",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            descripcion_corta="Descripción pública",
            precio_visible="12,00 €",
            imagen_url="",
            publicado=publicado,
        )

    def test_detalle_producto_publicado_devuelve_200(self):
        self._crear_producto(slug="detalle-publico", publicado=True)

        respuesta = self.client.get("/api/v1/herbal/productos/detalle-publico/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()["producto"]["slug"], "detalle-publico")

    def test_detalle_producto_inexistente_devuelve_404(self):
        respuesta = self.client.get("/api/v1/herbal/productos/no-existe/")

        self.assertEqual(respuesta.status_code, 404)

    def test_detalle_producto_no_publicado_no_se_expone(self):
        self._crear_producto(slug="detalle-privado", publicado=False)

        respuesta = self.client.get("/api/v1/herbal/productos/detalle-privado/")

        self.assertEqual(respuesta.status_code, 404)

    def test_detalle_producto_con_tipo_legacy_invalido_devuelve_404_seguro(self):
        ProductoModelo.objects.create(
            id="id-detalle-legacy",
            sku="SKU-detalle-legacy",
            slug="detalle-legacy",
            nombre="Producto detalle legacy",
            tipo_producto="legacy-tipo-no-valido",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            descripcion_corta="Descripción pública",
            precio_visible="",
            imagen_url="",
            publicado=True,
        )

        respuesta = self.client.get("/api/v1/herbal/productos/detalle-legacy/")

        self.assertEqual(respuesta.status_code, 404)


    def test_detalle_producto_publicado_expone_disponibilidad_positiva(self):
        producto = self._crear_producto(slug="detalle-stock-ok", publicado=True)
        InventarioProductoModelo.objects.create(producto=producto, cantidad_disponible=5, umbral_bajo_stock=2)

        respuesta = self.client.get("/api/v1/herbal/productos/detalle-stock-ok/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()["producto"]["disponible"])
        self.assertEqual(respuesta.json()["producto"]["estado_disponibilidad"], "disponible")

    def test_detalle_producto_publicado_expone_no_disponible_con_stock_cero(self):
        producto = self._crear_producto(slug="detalle-sin-stock", publicado=True)
        InventarioProductoModelo.objects.create(producto=producto, cantidad_disponible=0, umbral_bajo_stock=2)

        respuesta = self.client.get("/api/v1/herbal/productos/detalle-sin-stock/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertFalse(respuesta.json()["producto"]["disponible"])
        self.assertEqual(respuesta.json()["producto"]["estado_disponibilidad"], "no_disponible")

    def test_detalle_producto_publicado_expone_bajo_stock_cuando_aplica(self):
        producto = self._crear_producto(slug="detalle-bajo-stock", publicado=True)
        InventarioProductoModelo.objects.create(producto=producto, cantidad_disponible=1, umbral_bajo_stock=2)

        respuesta = self.client.get("/api/v1/herbal/productos/detalle-bajo-stock/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()["producto"]["disponible"])
        self.assertEqual(respuesta.json()["producto"]["estado_disponibilidad"], "bajo_stock")
