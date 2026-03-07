import unittest

from backend.nucleo_herbal.dominio.entidades import Intencion, Planta, Producto
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class TestEntidadesDominio(unittest.TestCase):
    def test_producto_herbal_requiere_planta_id(self) -> None:
        with self.assertRaises(ErrorDominio):
            Producto(
                id="prod-1",
                sku="SKU-001",
                slug="rosa-a-granel-50g",
                nombre="Rosa a granel 50g",
                tipo_producto="hierbas-a-granel",
                categoria_comercial="hierbas-a-granel",
                planta_id=None,
            )

    def test_planta_rechaza_intenciones_repetidas(self) -> None:
        calma = Intencion(
            id="int-1",
            slug="calma",
            nombre="Calma",
            descripcion="Foco editorial en serenidad.",
        )

        with self.assertRaises(ErrorDominio):
            Planta(
                id="pla-1",
                slug="melisa",
                nombre="Melisa",
                descripcion_breve="Perfil herbal tradicional.",
                intenciones=(calma, calma),
            )

    def test_producto_no_herbal_puede_no_tener_planta(self) -> None:
        producto = Producto(
            id="prod-2",
            sku="SKU-002",
            slug="tarro-altar-lunar",
            nombre="Tarro de altar",
            tipo_producto="herramientas-rituales",
            categoria_comercial="herramientas-esotericas",
            planta_id=None,
        )

        self.assertIsNone(producto.planta_id)

    def test_producto_requiere_slug_obligatorio(self) -> None:
        with self.assertRaises(ErrorDominio):
            Producto(
                id="prod-3",
                sku="SKU-003",
                slug=" ",
                nombre="Sahumerio artesanal",
                tipo_producto="inciensos-y-sahumerios",
                categoria_comercial="herramientas-esotericas",
                planta_id=None,
            )

    def test_tipo_producto_y_categoria_comercial_son_ejes_distintos(self) -> None:
        producto = Producto(
            id="prod-4",
            sku="SKU-004",
            slug="melisa-cosecha-lore-50g",
            nombre="Melisa cosecha Lore 50g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="destacados-temporada",
            planta_id="pla-1",
        )

        self.assertEqual(producto.tipo_producto, "hierbas-a-granel")
        self.assertEqual(producto.categoria_comercial, "destacados-temporada")
        self.assertNotEqual(producto.tipo_producto, producto.categoria_comercial)


if __name__ == "__main__":
    unittest.main()
