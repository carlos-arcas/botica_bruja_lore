import unittest

try:
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        CuentaClienteModelo,
        DireccionCuentaClienteModelo,
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


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no esta instalado en el entorno local.")
class BootstrapEcommerceLocalSimuladoTests(DjangoTestCase):
    def test_crea_productos_comprables_e_inventario_compatible(self) -> None:
        ejecutar_bootstrap(dry_run=False)

        for seed in PRODUCTOS:
            producto = ProductoModelo.objects.get(sku=seed.sku)
            inventario = InventarioProductoModelo.objects.get(producto=producto)
            self.assertTrue(producto.publicado)
            self.assertEqual(producto.precio_numerico, seed.precio)
            self.assertEqual(producto.unidad_comercial, seed.unidad)
            self.assertEqual(producto.tipo_fiscal, "iva_reducido" if seed.planta_slug else "iva_general")
            self.assertEqual(inventario.unidad_base, producto.unidad_comercial)
            self.assertGreaterEqual(inventario.cantidad_disponible, producto.cantidad_minima_compra)

    def test_es_idempotente_y_no_duplica_skus_ni_inventario(self) -> None:
        ejecutar_bootstrap(dry_run=False)
        ejecutar_bootstrap(dry_run=False)

        self.assertEqual(ProductoModelo.objects.filter(sku__startswith="LOCAL-ECOM-").count(), len(PRODUCTOS))
        self.assertEqual(
            InventarioProductoModelo.objects.filter(producto__sku__startswith="LOCAL-ECOM-").count(),
            len(PRODUCTOS),
        )
        self.assertEqual(CuentaClienteModelo.objects.filter(email="cliente.local@botica.test").count(), 1)
        self.assertEqual(DireccionCuentaClienteModelo.objects.filter(alias="Casa local").count(), 1)

    def test_dry_run_no_persiste_datos(self) -> None:
        ejecutar_bootstrap(dry_run=True)

        self.assertEqual(ProductoModelo.objects.filter(sku__startswith="LOCAL-ECOM-").count(), 0)
        self.assertEqual(SeccionPublicaModelo.objects.filter(slug="botica-natural").count(), 0)

    def test_script_funciona_tras_migraciones_de_test(self) -> None:
        resumen = ejecutar_bootstrap(dry_run=False)

        self.assertIn("productos", resumen)
        self.assertEqual(resumen["productos"]["creados"], len(PRODUCTOS))


if __name__ == "__main__":
    unittest.main()
