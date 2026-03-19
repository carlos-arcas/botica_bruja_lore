"""Casos de uso mínimos para operación administrativa de pedidos reales."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from .casos_de_uso import ErrorAplicacionLookup
from .casos_de_uso_pedidos import _a_dto
from .dto_pedidos import PedidoRealDTO
from .puertos.repositorios_pedidos import RepositorioPedidos

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ListarPedidosBackoffice:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, *, solo_pagados: bool = False) -> tuple[PedidoRealDTO, ...]:
        return tuple(_a_dto(pedido) for pedido in self.repositorio_pedidos.listar(solo_pagados=solo_pagados))


@dataclass(slots=True)
class MarcarPedidoPreparando:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, id_pedido: str, operation_id: str) -> PedidoRealDTO:
        pedido = self.repositorio_pedidos.obtener_por_id(id_pedido)
        if pedido is None:
            raise ErrorAplicacionLookup(f"Pedido real no encontrado: {id_pedido}")
        actualizado = self.repositorio_pedidos.guardar(pedido.marcar_preparando())
        logger.info(
            "backoffice_pedido_preparando",
            extra={
                "operation_id": operation_id,
                "pedido_id": actualizado.id_pedido,
                "id_externo_pago": actualizado.id_externo_pago,
                "email_contacto": actualizado.cliente.email,
                "estado_anterior": pedido.estado,
                "estado_nuevo": actualizado.estado,
                "evento": "marcar_preparando",
                "resultado": "ok",
            },
        )
        return _a_dto(actualizado)
