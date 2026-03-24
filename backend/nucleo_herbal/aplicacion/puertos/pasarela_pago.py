"""Puerto desacoplado para integrar PSPs reales."""

from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal

from ..dto_pago_pedidos import EventoPagoNormalizadoDTO
from ...dominio.pedidos import Pedido


class PuertoPasarelaPago(ABC):
    @abstractmethod
    def crear_intencion_pago(self, pedido: Pedido, operation_id: str) -> dict[str, object]:
        """Crea o devuelve una intención externa reutilizable para un pedido."""

    @abstractmethod
    def validar_webhook(self, payload: bytes, firma: str | None) -> EventoPagoNormalizadoDTO:
        """Valida y normaliza el webhook del PSP."""

    @abstractmethod
    def consultar_estado_externo(self, id_externo_pago: str) -> tuple[str, Decimal, str]:
        """Consulta un estado externo canónico si hiciera falta."""

    @abstractmethod
    def ejecutar_reembolso_total(self, *, id_externo_pago: str, moneda: str, importe: Decimal, operation_id: str) -> dict[str, object]:
        """Ejecuta un reembolso total explícito y devuelve resultado normalizado."""
