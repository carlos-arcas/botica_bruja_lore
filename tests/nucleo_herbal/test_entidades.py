import unittest

from backend.nucleo_herbal.dominio.entidades import Intencion, Planta, Producto
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class TestEntidadesDominio(unittest.TestCase):
    def test_producto_herbal_requiere_planta_id(self) -> None:
        with self.assertRaises(ErrorDominio):
            Producto(
                id="prod-1",
                sku="SKU-001",
                nombre="Rosa a granel",
                categoria_comercial="hierbas-a-granel",
                es_herbal=True,
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
            nombre="Tarro de altar",
            categoria_comercial="herramientas-esotericas",
            es_herbal=False,
            planta_id=None,
        )

        self.assertEqual(producto.planta_id, None)


if __name__ == "__main__":
    unittest.main()
