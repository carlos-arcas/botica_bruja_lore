"""Orquestación de efectos post-pago reales desacoplados del webhook."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from ..dominio.pedidos import Pedido
from .errores_pedidos import LineaStockError
from .errores_post_pago import IncidenciaStockPostPago
from .puertos.notificador_pedidos import NotificadorPostPagoPedido
from .puertos.repositorios_inventario import RepositorioInventario
from .puertos.repositorios_pedidos import RepositorioPedidos
from .puertos.transacciones import PuertoTransacciones

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ProcesarPostPagoPedido:
    repositorio_pedidos: RepositorioPedidos
    repositorio_inventario: RepositorioInventario
    transacciones: PuertoTransacciones
    notificador: NotificadorPostPagoPedido

    def ejecutar(self, pedido: Pedido, operation_id: str, tipo_evento: str) -> Pedido:
        persistido = self._confirmar_pago_e_inventario(pedido, operation_id, tipo_evento)
        if persistido.incidencia_stock_confirmacion:
            logger.warning("pedido_post_pago_incidencia_operativa", extra=_extra(persistido, operation_id, tipo_evento, pedido.estado, "incidencia_stock"))
            return persistido
        return self._enviar_email_si_aplica(persistido, operation_id, tipo_evento)

    def _confirmar_pago_e_inventario(self, pedido: Pedido, operation_id: str, tipo_evento: str) -> Pedido:
        with self.transacciones.atomic():
            actual = self.repositorio_pedidos.obtener_por_id_para_actualizar(pedido.id_pedido) or pedido
            if actual.inventario_descontado:
                logger.info("pedido_post_pago_reintento_idempotente", extra=_extra(actual, operation_id, tipo_evento, actual.estado, "ya_descontado"))
                return actual
            if actual.incidencia_stock_confirmacion:
                logger.info("pedido_post_pago_reintento_idempotente", extra=_extra(actual, operation_id, tipo_evento, actual.estado, "incidencia_preexistente"))
                return actual
            pagado = actual.marcar_pagado(datetime.now(tz=UTC))
            incidencia = _detectar_incidencia_stock(pagado, self.repositorio_inventario)
            if incidencia is not None:
                persistido = self.repositorio_pedidos.guardar(pagado.registrar_incidencia_stock_confirmacion(incidencia.detalle))
                logger.warning("pedido_post_pago_stock_insuficiente", extra={**_extra(persistido, operation_id, tipo_evento, actual.estado, "sin_stock"), "lineas": [linea.a_payload() for linea in incidencia.lineas]})
                return persistido
            _descontar_inventario(pagado, self.repositorio_inventario)
            persistido = self.repositorio_pedidos.guardar(pagado.marcar_inventario_descontado())
            logger.info("pedido_post_pago_inventario_descontado", extra=_extra(persistido, operation_id, tipo_evento, actual.estado, "ok"))
            return persistido

    def _enviar_email_si_aplica(self, pedido: Pedido, operation_id: str, tipo_evento: str) -> Pedido:
        if pedido.email_post_pago_enviado:
            logger.info("pedido_post_pago_email_omitido", extra=_extra(pedido, operation_id, tipo_evento, pedido.estado, "ya_enviado"))
            return pedido
        try:
            self.notificador.enviar_confirmacion_pago(pedido, operation_id)
        except Exception as error:  # noqa: BLE001
            logger.error("pedido_post_pago_email_error", extra={**_extra(pedido, operation_id, tipo_evento, pedido.estado, "error"), "error": str(error)})
            return pedido
        actualizado = pedido.marcar_email_post_pago_enviado(datetime.now(tz=UTC))
        persistido = self.repositorio_pedidos.guardar(actualizado)
        logger.info("pedido_post_pago_email_enviado", extra=_extra(persistido, operation_id, tipo_evento, persistido.estado, "ok"))
        return persistido


def _detectar_incidencia_stock(pedido: Pedido, repositorio_inventario: RepositorioInventario) -> IncidenciaStockPostPago | None:
    inventarios = {item.id_producto: item for item in repositorio_inventario.obtener_para_actualizar_por_ids_producto(_ids_producto(pedido))}
    lineas = []
    for linea in pedido.lineas:
        inventario = inventarios.get(linea.id_producto)
        cantidad_disponible = 0 if inventario is None else inventario.cantidad_disponible
        if inventario is None or not inventario.puede_cubrir(linea.cantidad):
            lineas.append(
                LineaStockError(
                    id_producto=linea.id_producto,
                    slug_producto=linea.slug_producto,
                    nombre_producto=linea.nombre_producto,
                    cantidad_solicitada=linea.cantidad,
                    cantidad_disponible=cantidad_disponible,
                    codigo="stock_insuficiente_confirmacion_pago",
                    detalle="No hay stock suficiente para confirmar operativamente el pedido pagado.",
                )
            )
    if not lineas:
        return None
    return IncidenciaStockPostPago(
        detalle="Pago confirmado con incidencia operativa: el inventario no pudo descontarse y el pedido requiere revisión manual.",
        lineas=tuple(lineas),
    )


def _descontar_inventario(pedido: Pedido, repositorio_inventario: RepositorioInventario) -> None:
    inventarios = {item.id_producto: item for item in repositorio_inventario.obtener_para_actualizar_por_ids_producto(_ids_producto(pedido))}
    for linea in pedido.lineas:
        actualizado = inventarios[linea.id_producto].ajustar(-linea.cantidad, fecha_actualizacion=datetime.now(tz=UTC))
        repositorio_inventario.guardar(actualizado)


def _ids_producto(pedido: Pedido) -> tuple[str, ...]:
    return tuple(dict.fromkeys(linea.id_producto for linea in pedido.lineas))


def _extra(pedido: Pedido, operation_id: str, tipo_evento: str, estado_anterior: str, resultado: str) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "pedido_id": pedido.id_pedido,
        "id_externo_pago": pedido.id_externo_pago,
        "email_contacto": pedido.cliente.email,
        "estado_anterior": estado_anterior,
        "estado_nuevo": pedido.estado,
        "evento": tipo_evento,
        "resultado": resultado,
        "inventario_descontado": pedido.inventario_descontado,
        "incidencia_stock_confirmacion": pedido.incidencia_stock_confirmacion,
    }
