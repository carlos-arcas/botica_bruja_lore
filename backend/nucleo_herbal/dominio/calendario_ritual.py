"""Modelos de dominio para temporalidad editorial de rituales."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from .excepciones import ErrorDominio


@dataclass(frozen=True, slots=True)
class ReglaCalendario:
    """Regla temporal desacoplada de la entidad Ritual."""

    id: str
    id_ritual: str
    nombre: str
    fecha_inicio: date
    fecha_fin: date
    prioridad: int = 100
    activa: bool = True

    def __post_init__(self) -> None:
        if not self.id.strip():
            raise ErrorDominio("La regla de calendario requiere identificador.")
        if not self.id_ritual.strip():
            raise ErrorDominio("La regla de calendario requiere id de ritual.")
        if not self.nombre.strip():
            raise ErrorDominio("La regla de calendario requiere nombre.")
        if self.fecha_fin < self.fecha_inicio:
            raise ErrorDominio("La regla de calendario requiere rango temporal válido.")
        if self.prioridad < 0:
            raise ErrorDominio("La regla de calendario requiere prioridad no negativa.")

    def aplica_en(self, fecha: date) -> bool:
        if not self.activa:
            return False
        return self.fecha_inicio <= fecha <= self.fecha_fin
