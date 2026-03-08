import unittest

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_rituales import (
    ObtenerDetalleRitual,
    ObtenerListadoRitualNavegable,
    ObtenerPlantasRelacionadasDeRitual,
    ObtenerProductosRelacionadosDeRitual,
    ObtenerRitualesRelacionadosDePlantaPorSlug,
    ObtenerRitualesRelacionadosPorIntencion,
    ObtenerRitualesRelacionadosPorPlanta,
    ObtenerRitualesRelacionadosPorProducto,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios_rituales import (
    RepositorioRituales,
)
from backend.nucleo_herbal.dominio.entidades import Intencion, Planta, Producto
from backend.nucleo_herbal.dominio.rituales import Ritual


def _intencion_calma() -> Intencion:
    return Intencion("int-1", "calma", "Calma", "Intención editorial")


def _planta_melisa() -> Planta:
    return Planta(
        id="pla-1",
        slug="melisa",
        nombre="Melisa",
        descripcion_breve="Planta aromática de tradición herbal.",
        intenciones=(_intencion_calma(),),
    )


def _producto_melisa() -> Producto:
    return Producto(
        id="prod-1",
        sku="HERB-001",
        slug="melisa-a-granel-50g",
        nombre="Melisa a granel 50g",
        tipo_producto="hierbas-a-granel",
        categoria_comercial="hierbas-a-granel",
        planta_id="pla-1",
    )


def _ritual_calma() -> Ritual:
    return Ritual(
        id="rit-1",
        slug="cierre-sereno",
        nombre="Cierre sereno",
        contexto_breve="Ritual breve para transicionar del día al descanso.",
        intenciones=(_intencion_calma(),),
        ids_plantas_relacionadas=("pla-1",),
        ids_productos_relacionados=("prod-1",),
    )


class RepositorioRitualesEnMemoria(RepositorioRituales):
    def __init__(
        self,
        rituales: tuple[Ritual, ...],
        plantas_por_ritual: dict[str, tuple[Planta, ...]],
        productos_por_ritual: dict[str, tuple[Producto, ...]],
    ) -> None:
        self._rituales = rituales
        self._plantas_por_ritual = plantas_por_ritual
        self._productos_por_ritual = productos_por_ritual

    def listar_navegables(self) -> tuple[Ritual, ...]:
        return self._rituales

    def obtener_por_slug(self, slug_ritual: str) -> Ritual | None:
        for ritual in self._rituales:
            if ritual.slug == slug_ritual:
                return ritual
        return None

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Ritual, ...]:
        resultado = []
        for ritual in self._rituales:
            for intencion in ritual.intenciones:
                if intencion.slug == slug_intencion:
                    resultado.append(ritual)
                    break
        return tuple(resultado)

    def listar_por_planta(self, id_planta: str) -> tuple[Ritual, ...]:
        return tuple(
            ritual
            for ritual in self._rituales
            if id_planta in ritual.ids_plantas_relacionadas
        )

    def listar_por_producto(self, id_producto: str) -> tuple[Ritual, ...]:
        return tuple(
            ritual
            for ritual in self._rituales
            if id_producto in ritual.ids_productos_relacionados
        )

    def listar_plantas_relacionadas(self, id_ritual: str) -> tuple[Planta, ...]:
        return self._plantas_por_ritual.get(id_ritual, ())

    def listar_productos_relacionados(self, id_ritual: str) -> tuple[Producto, ...]:
        return self._productos_por_ritual.get(id_ritual, ())



class RepositorioPlantasEnMemoria:
    def __init__(self, plantas: tuple[Planta, ...]) -> None:
        self._plantas = plantas

    def obtener_por_slug(self, slug_planta: str) -> Planta | None:
        for planta in self._plantas:
            if planta.slug == slug_planta:
                return planta
        return None


class TestCasosDeUsoRitualesConectados(unittest.TestCase):
    def setUp(self) -> None:
        self.ritual = _ritual_calma()
        self.repositorio_plantas = RepositorioPlantasEnMemoria((_planta_melisa(),))
        self.repositorio = RepositorioRitualesEnMemoria(
            rituales=(self.ritual,),
            plantas_por_ritual={"rit-1": (_planta_melisa(),)},
            productos_por_ritual={"rit-1": (_producto_melisa(),)},
        )

    def test_obtener_listado_ritual_navegable(self) -> None:
        caso = ObtenerListadoRitualNavegable(self.repositorio)

        resultado = caso.ejecutar()

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].slug, "cierre-sereno")
        self.assertEqual(resultado[0].intenciones[0].slug, "calma")

    def test_obtener_detalle_ritual(self) -> None:
        caso = ObtenerDetalleRitual(self.repositorio)

        detalle = caso.ejecutar("cierre-sereno")

        self.assertEqual(detalle.nombre, "Cierre sereno")
        self.assertIn("descanso", detalle.contexto_breve)

    def test_obtener_detalle_ritual_inexistente_lanza_error(self) -> None:
        caso = ObtenerDetalleRitual(self.repositorio)

        with self.assertRaises(ErrorAplicacionLookup):
            caso.ejecutar("inexistente")

    def test_obtener_relaciones_ritual_plantas(self) -> None:
        caso = ObtenerPlantasRelacionadasDeRitual(self.repositorio)

        resultado = caso.ejecutar("cierre-sereno")

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].slug, "melisa")

    def test_obtener_relaciones_ritual_productos(self) -> None:
        caso = ObtenerProductosRelacionadosDeRitual(self.repositorio)

        resultado = caso.ejecutar("cierre-sereno")

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].sku, "HERB-001")

    def test_obtener_rituales_por_intencion(self) -> None:
        caso = ObtenerRitualesRelacionadosPorIntencion(self.repositorio)

        resultado = caso.ejecutar("calma")

        self.assertEqual(resultado.intencion.slug, "calma")
        self.assertEqual(resultado.rituales[0].slug, "cierre-sereno")

    def test_obtener_rituales_por_planta(self) -> None:
        caso = ObtenerRitualesRelacionadosPorPlanta(self.repositorio)

        resultado = caso.ejecutar("pla-1")

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].slug, "cierre-sereno")


    def test_obtener_rituales_por_slug_planta(self) -> None:
        caso = ObtenerRitualesRelacionadosDePlantaPorSlug(
            self.repositorio_plantas,
            self.repositorio,
        )

        resultado = caso.ejecutar("melisa")

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].slug, "cierre-sereno")

    def test_obtener_rituales_por_slug_planta_inexistente(self) -> None:
        caso = ObtenerRitualesRelacionadosDePlantaPorSlug(
            self.repositorio_plantas,
            self.repositorio,
        )

        with self.assertRaises(ErrorAplicacionLookup):
            caso.ejecutar("inexistente")

    def test_obtener_rituales_por_producto(self) -> None:
        caso = ObtenerRitualesRelacionadosPorProducto(self.repositorio)

        resultado = caso.ejecutar("prod-1")

        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].slug, "cierre-sereno")


if __name__ == "__main__":
    unittest.main()
