"""Puertos de calendario ritual para consulta temporal editorial."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date

from ...dominio.calendario_ritual import ReglaCalendario


class RepositorioReglasCalendario(ABC):
    @abstractmethod
    def listar_vigentes_en(self, fecha_consulta: date) -> tuple[ReglaCalendario, ...]:
        """Devuelve reglas de calendario candidatas para una fecha."""
