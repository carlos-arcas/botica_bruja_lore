from __future__ import annotations

from datetime import date
import unittest

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_calendario_ritual import (
    ConsultarCalendarioRitualPorFecha,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios_calendario_ritual import (
    RepositorioReglasCalendario,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios_rituales import RepositorioRituales
from backend.nucleo_herbal.dominio.calendario_ritual import ReglaCalendario
from backend.nucleo_herbal.dominio.entidades import Intencion, Planta, Producto
from backend.nucleo_herbal.dominio.rituales import Ritual


class RepositorioReglasEnMemoria(RepositorioReglasCalendario):
    def __init__(self, reglas: tuple[ReglaCalendario, ...]) -> None:
        self._reglas = reglas

    def listar_vigentes_en(self, fecha_consulta: date) -> tuple[ReglaCalendario, ...]:
        return tuple(regla for regla in self._reglas if regla.aplica_en(fecha_consulta))


class RepositorioRitualesEnMemoria(RepositorioRituales):
    def __init__(self, rituales: tuple[Ritual, ...]) -> None:
        self._rituales = rituales

    def listar_navegables(self) -> tuple[Ritual, ...]:
        return self._rituales

    def obtener_por_slug(self, slug_ritual: str) -> Ritual | None:
        raise NotImplementedError

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Ritual, ...]:
        raise NotImplementedError

    def listar_por_planta(self, id_planta: str) -> tuple[Ritual, ...]:
        raise NotImplementedError

    def listar_por_producto(self, id_producto: str) -> tuple[Ritual, ...]:
        raise NotImplementedError

    def listar_plantas_relacionadas(self, id_ritual: str) -> tuple[Planta, ...]:
        raise NotImplementedError

    def listar_productos_relacionados(self, id_ritual: str) -> tuple[Producto, ...]:
        raise NotImplementedError


class TestCasosDeUsoCalendarioRitual(unittest.TestCase):
    def test_consulta_temporal_vacia(self) -> None:
        caso = ConsultarCalendarioRitualPorFecha(
            repositorio_reglas=RepositorioReglasEnMemoria(()),
            repositorio_rituales=RepositorioRitualesEnMemoria((self._ritual("rit-1"),)),
        )

        resultado = caso.ejecutar(date(2026, 3, 22))

        self.assertEqual(resultado.rituales, ())

    def test_consulta_temporal_con_rituales_aplicables(self) -> None:
        caso = ConsultarCalendarioRitualPorFecha(
            repositorio_reglas=RepositorioReglasEnMemoria(
                (
                    self._regla("reg-1", "rit-1", "Ventana otoño", 10),
                    self._regla("reg-2", "rit-2", "Equilibrio lunar", 3),
                )
            ),
            repositorio_rituales=RepositorioRitualesEnMemoria(
                (self._ritual("rit-1"), self._ritual("rit-2"))
            ),
        )

        resultado = caso.ejecutar(date(2026, 3, 22))

        self.assertEqual(len(resultado.rituales), 2)
        self.assertEqual(resultado.rituales[0].slug, "rit-2")
        self.assertEqual(resultado.rituales[1].slug, "rit-1")

    def test_prioriza_mejor_regla_cuando_hay_multiples_por_ritual(self) -> None:
        caso = ConsultarCalendarioRitualPorFecha(
            repositorio_reglas=RepositorioReglasEnMemoria(
                (
                    self._regla("reg-1", "rit-1", "Ventana general", 20),
                    self._regla("reg-2", "rit-1", "Ventana prioritaria", 1),
                )
            ),
            repositorio_rituales=RepositorioRitualesEnMemoria((self._ritual("rit-1"),)),
        )

        resultado = caso.ejecutar(date(2026, 3, 22))

        self.assertEqual(len(resultado.rituales), 1)
        self.assertEqual(resultado.rituales[0].nombre_regla, "Ventana prioritaria")

    def test_falla_si_regla_referencia_ritual_no_disponible(self) -> None:
        caso = ConsultarCalendarioRitualPorFecha(
            repositorio_reglas=RepositorioReglasEnMemoria(
                (self._regla("reg-1", "rit-no-existe", "Ventana", 1),)
            ),
            repositorio_rituales=RepositorioRitualesEnMemoria((self._ritual("rit-1"),)),
        )

        with self.assertRaises(ErrorAplicacionLookup):
            caso.ejecutar(date(2026, 3, 22))

    def _regla(
        self,
        id_regla: str,
        id_ritual: str,
        nombre: str,
        prioridad: int,
    ) -> ReglaCalendario:
        return ReglaCalendario(
            id=id_regla,
            id_ritual=id_ritual,
            nombre=nombre,
            fecha_inicio=date(2026, 3, 1),
            fecha_fin=date(2026, 3, 31),
            prioridad=prioridad,
        )

    def _ritual(self, id_ritual: str) -> Ritual:
        return Ritual(
            id=id_ritual,
            slug=id_ritual,
            nombre=f"Ritual {id_ritual}",
            contexto_breve="Contexto breve de ejemplo.",
            intenciones=(Intencion(id="int-1", slug="calma", nombre="Calma", descripcion="Calma y descanso"),),
            ids_plantas_relacionadas=(),
            ids_productos_relacionados=(),
        )


if __name__ == "__main__":
    unittest.main()
