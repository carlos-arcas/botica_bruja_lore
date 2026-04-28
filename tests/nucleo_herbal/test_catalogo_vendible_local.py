import unittest
from pathlib import Path

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        ProductoModelo,
        SeccionPublicaModelo,
    )
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import (
        InventarioProductoModelo,
    )
    from scripts.bootstrap_ecommerce_local_simulado import PRODUCTOS, ejecutar_bootstrap

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


SECCIONES_MINIMAS = {
    "botica-natural": 5,
    "velas-e-incienso": 3,
    "minerales-y-energia": 3,
    "herramientas-esotericas": 3,
}
UNIDADES_VALIDAS = {"ud", "g", "ml"}
TIPOS_FISCALES_VALIDOS = {"iva_general", "iva_reducido"}


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no esta instalado en el entorno local.")
class CatalogoVendibleLocalTests(DjangoTestCase):
    def setUp(self) -> None:
        super().setUp()
        ejecutar_bootstrap(dry_run=False)

    def test_seed_local_cumple_minimos_por_seccion_abierta(self) -> None:
        for seccion, minimo in SECCIONES_MINIMAS.items():
            total = ProductoModelo.objects.filter(
                seccion_publica=seccion,
                publicado=True,
                sku__startswith="LOCAL-ECOM-",
            ).count()
            self.assertGreaterEqual(total, minimo, seccion)

    def test_productos_publicos_vendibles_tienen_contrato_comercial_completo(self) -> None:
        productos = ProductoModelo.objects.filter(sku__startswith="LOCAL-ECOM-", publicado=True)
        self.assertEqual(productos.count(), len(PRODUCTOS))

        for producto in productos:
            self._assert_producto_vendible(producto)

    def test_api_publica_no_mezcla_fallback_herbal_en_otras_secciones(self) -> None:
        for seccion in SECCIONES_MINIMAS:
            response = self.client.get(f"/api/v1/herbal/secciones/{seccion}/productos/")
            self.assertEqual(response.status_code, 200)
            productos = response.json()["productos"]
            self.assertGreaterEqual(len(productos), SECCIONES_MINIMAS[seccion])
            self.assertTrue(all(item["seccion_publica"] == seccion for item in productos))

    def test_producto_sin_stock_no_aparece_como_comprable(self) -> None:
        producto = ProductoModelo.objects.get(sku="LOCAL-ECOM-001")
        InventarioProductoModelo.objects.filter(producto=producto).update(cantidad_disponible=0)

        response = self.client.get(f"/api/v1/herbal/productos/{producto.slug}/")

        self.assertEqual(response.status_code, 200)
        data = response.json()["producto"]
        self.assertFalse(data["disponible_compra"])
        self.assertEqual(data["estado_disponibilidad"], "no_disponible")

    def test_frontend_conserva_fallback_visual_y_cta_checkout(self) -> None:
        root = Path(__file__).resolve().parents[2] / "frontend"
        imagen = (root / "componentes/botica-natural/ImagenProductoBoticaNatural.tsx").read_text(encoding="utf-8")
        ficha = (root / "componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx").read_text(encoding="utf-8")
        acciones = (root / "componentes/botica-natural/AccionesTarjetaProductoBoticaNatural.tsx").read_text(encoding="utf-8")

        self.assertIn("botica-natural__imagen--fallback", imagen)
        self.assertIn('href={`/checkout?producto=${producto.slug}`}', ficha)
        self.assertIn("Agregar al carrito", acciones)
        self.assertIn("disabled={!producto.disponible}", acciones)

    def _assert_producto_vendible(self, producto: ProductoModelo) -> None:
        inventario = InventarioProductoModelo.objects.get(producto=producto)
        self.assertTrue(producto.sku.strip())
        self.assertTrue(producto.slug.strip())
        self.assertTrue(producto.nombre.strip())
        self.assertIsNotNone(producto.precio_numerico)
        self.assertGreater(producto.precio_numerico, 0)
        self.assertIn(str(producto.precio_numerico).replace(".", ","), producto.precio_visible)
        self.assertIn(producto.unidad_comercial, UNIDADES_VALIDAS)
        self.assertGreater(producto.incremento_minimo_venta, 0)
        self.assertGreater(producto.cantidad_minima_compra, 0)
        self.assertEqual(producto.cantidad_minima_compra % producto.incremento_minimo_venta, 0)
        self.assertIn(producto.tipo_fiscal, TIPOS_FISCALES_VALIDOS)
        self.assertIn(producto.seccion_publica, SECCIONES_MINIMAS)
        self.assertEqual(inventario.unidad_base, producto.unidad_comercial)
        self.assertGreaterEqual(inventario.cantidad_disponible, producto.cantidad_minima_compra)


if __name__ == "__main__":
    unittest.main()
