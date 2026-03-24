"""Puerto para resolver el coste de envío del checkout real v1."""

from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal


class PuertoProveedorEnvio(ABC):
    @abstractmethod
    def resolver_importe_envio_estandar(self, *, moneda: str, operation_id: str) -> Decimal:
        """Devuelve el coste del envío estándar para el pedido real."""
