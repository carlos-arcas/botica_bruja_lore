import unittest

from backend.nucleo_herbal.aplicacion.casos_de_uso import (
    ErrorAplicacionLookup,
    ObtenerDetallePlanta,
    ObtenerListadoHerbalNavegable,
    ObtenerRelacionesHerbalesPorIntencion,
    ObtenerResolucionComercialMinimaDePlanta,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios import (
    RepositorioPlantas,
    RepositorioProductos,
)
from backend.nucleo_herbal.dominio.entidades import Planta, Producto, Intencion


def _planta_melisa() -> Planta:
    calma = Intencion("int-1", "calma", "Calma", "Intención editorial")
    descanso = Intencion("int-2", "descanso", "Descanso", "Intención editorial")
    return Planta(
        id="pla-1",
        slug="melisa",
        nombre="Melisa",
        descripcion_breve="Planta aromática de tradición herbal.",
        intenciones=(calma, descanso),
    )


class RepositorioPlantasEnMemoria(RepositorioPlantas):
    def __init__(self, plantas: tuple[Planta, ...]) -> None:
        self._plantas = plantas

    def listar_navegables(self) -> tuple[Planta, ...]:
        return self._plantas

    def obtener_por_slug(self, slug_planta: str) -> Planta | None:
        for planta in self._plantas:
            if planta.slug == slug_planta:
                return planta
        return None

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Planta, ...]:
        resultado = []
        for planta in self._plantas:
            for intencion in planta.intenciones:
                if intencion.slug == slug_intencion:
                    resultado.append(planta)
                    break
        return tuple(resultado)


class RepositorioProductosEnMemoria(RepositorioProductos):
    def __init__(self, productos: tuple[Producto, ...]) -> None:
        self._productos = productos

    def listar_herbales_por_planta(self, id_planta: str) -> tuple[Producto, ...]:
        return tuple(
            producto
            for producto in self._productos
            if producto.tipo_producto == "hierbas-a-granel" and producto.planta_id == id_planta
        )


class TestCasosDeUsoNucleoHerbal(unittest.TestCase):
    def setUp(self) -> None:
        self.planta = _planta_melisa()
        self.repo_plantas = RepositorioPlantasEnMemoria((self.planta,))
        self.repo_productos = RepositorioProductosEnMemoria(
            (
                Producto(
                    id="prod-1",
                    sku="HERB-001",
                    slug="melisa-a-granel-50g",
                    nombre="Melisa a granel 50g",
                    tipo_producto="hierbas-a-granel",
                    categoria_comercial="hierbas-a-granel",
                    planta_id="pla-1",
                ),
                Producto(
                    id="prod-2",
                    sku="ESC-001",
                    slug="vela-ritual-pequena",
                    nombre="Vela ritual pequeña",
                    tipo_producto="herramientas-rituales",
                    categoria_comercial="herramientas-esotericas",
                    planta_id=None,
                ),
            )
        )

    def test_obtener_listado_herbal_navegable(self) -> None:
        caso = ObtenerListadoHerbalNavegable(self.repo_plantas)

        resultado = caso.ejecutar()

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].slug, "melisa")
        self.assertIn("tradición herbal", resultado[0].descripcion_breve)
        self.assertEqual(resultado[0].intenciones[0].slug, "calma")

    def test_obtener_detalle_planta(self) -> None:
        caso = ObtenerDetallePlanta(self.repo_plantas)

        detalle = caso.ejecutar("melisa")

        self.assertEqual(detalle.nombre, "Melisa")
        self.assertIn("tradición herbal", detalle.descripcion_breve)

    def test_obtener_detalle_planta_inexistente_lanza_error(self) -> None:
        caso = ObtenerDetallePlanta(self.repo_plantas)

        with self.assertRaises(ErrorAplicacionLookup):
            caso.ejecutar("inexistente")

    def test_obtener_resolucion_comercial_minima_asociada_a_planta(self) -> None:
        caso = ObtenerResolucionComercialMinimaDePlanta(
            self.repo_plantas,
            self.repo_productos,
        )

        resultado = caso.ejecutar("melisa")

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].sku, "HERB-001")
        self.assertEqual(resultado[0].slug, "melisa-a-granel-50g")
        self.assertEqual(resultado[0].tipo_producto, "hierbas-a-granel")

    def test_obtener_relaciones_herbales_por_intencion(self) -> None:
        caso = ObtenerRelacionesHerbalesPorIntencion(self.repo_plantas)

        relacion = caso.ejecutar("calma")

        self.assertEqual(relacion.intencion.slug, "calma")
        self.assertEqual(relacion.plantas[0].slug, "melisa")


if __name__ == "__main__":
    unittest.main()
