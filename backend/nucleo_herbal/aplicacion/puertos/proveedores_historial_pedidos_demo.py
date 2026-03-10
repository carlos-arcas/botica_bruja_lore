"""Puerto de consulta de historial de pedidos demo asociado a cuenta."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ...dominio.pedidos_demo import PedidoDemo


class ProveedorHistorialPedidosDemo(ABC):
    @abstractmethod
    def listar_por_vinculo_cuenta(
        self,
        *,
        id_usuario: str,
        email_contacto: str,
    ) -> tuple[PedidoDemo, ...]:
        """Lista pedidos demo asociados por id de usuario o email de contacto."""
