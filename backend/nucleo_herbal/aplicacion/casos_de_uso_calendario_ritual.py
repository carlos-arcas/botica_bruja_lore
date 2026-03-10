"""Casos de uso de calendario ritual (Ciclo 5, Prompt 1)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from ..dominio.calendario_ritual import ReglaCalendario
from ..dominio.rituales import Ritual
from .casos_de_uso import ErrorAplicacionLookup
from .dto import ConsultaCalendarioRitualDTO, RitualCalendarioDTO
from .puertos.repositorios_calendario_ritual import RepositorioReglasCalendario
from .puertos.repositorios_rituales import RepositorioRituales


@dataclass(slots=True)
class ConsultarCalendarioRitualPorFecha:
    repositorio_reglas: RepositorioReglasCalendario
    repositorio_rituales: RepositorioRituales

    def ejecutar(self, fecha_consulta: date) -> ConsultaCalendarioRitualDTO:
        reglas = self.repositorio_reglas.listar_vigentes_en(fecha_consulta)
        reglas_aplicables = tuple(
            regla for regla in reglas if regla.aplica_en(fecha_consulta)
        )
        rituales = _resolver_rituales_ordenados(
            reglas_aplicables,
            self.repositorio_rituales.listar_navegables(),
        )
        return ConsultaCalendarioRitualDTO(
            fecha_consulta=fecha_consulta.isoformat(),
            rituales=rituales,
        )


def _resolver_rituales_ordenados(
    reglas: tuple[ReglaCalendario, ...],
    rituales: tuple[Ritual, ...],
) -> tuple[RitualCalendarioDTO, ...]:
    reglas_por_ritual = _reglas_por_ritual(reglas)
    if not reglas_por_ritual:
        return ()
    rituales_por_id = {ritual.id: ritual for ritual in rituales}
    resultados = []
    for id_ritual, regla in reglas_por_ritual.items():
        ritual = rituales_por_id.get(id_ritual)
        if ritual is None:
            raise ErrorAplicacionLookup(
                f"Ritual no encontrado para regla de calendario: {id_ritual}"
            )
        resultados.append(
            RitualCalendarioDTO(
                slug=ritual.slug,
                nombre=ritual.nombre,
                contexto_breve=ritual.contexto_breve,
                nombre_regla=regla.nombre,
                prioridad=regla.prioridad,
            )
        )
    return tuple(sorted(resultados, key=_clave_orden_resultado))


def _reglas_por_ritual(
    reglas: tuple[ReglaCalendario, ...],
) -> dict[str, ReglaCalendario]:
    resultado: dict[str, ReglaCalendario] = {}
    for regla in reglas:
        actual = resultado.get(regla.id_ritual)
        if actual is None or _clave_orden_regla(regla) < _clave_orden_regla(actual):
            resultado[regla.id_ritual] = regla
    return resultado


def _clave_orden_resultado(ritual: RitualCalendarioDTO) -> tuple[int, str]:
    return ritual.prioridad, ritual.nombre


def _clave_orden_regla(regla: ReglaCalendario) -> tuple[int, str]:
    return regla.prioridad, regla.id
