"""Puerto transaccional mínimo para coordinar casos de uso atómicos."""

from __future__ import annotations

from abc import ABC, abstractmethod
from contextlib import AbstractContextManager


class PuertoTransacciones(ABC):
    @abstractmethod
    def atomic(self) -> AbstractContextManager[object]:
        """Abre un contexto transaccional atómico."""
