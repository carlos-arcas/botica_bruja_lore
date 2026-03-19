"""Casos de uso del checkout real v1."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import uuid4

from ..dominio.pedidos import PayloadPedido, Pedido
from .casos_de_uso import ErrorAplicacionLookup
from .dto_pedidos import ClientePedidoDTO, DireccionEntregaDTO, ExpedicionPedidoDTO, LineaPedidoRealDTO, PedidoRealDTO
from .puertos.repositorios_pedidos import RepositorioPedidos

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class RegistrarPedido:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, payload: PayloadPedido, operation_id: str) -> PedidoRealDTO:
        pedido = Pedido(
            id_pedido=_generar_id_pedido(),
            estado="pendiente_pago",
            estado_pago="pendiente",
            canal_checkout=payload.canal_checkout,
            cliente=payload.cliente,
            lineas=payload.lineas,
            direccion_entrega=payload.direccion_entrega,
            notas_cliente=payload.notas_cliente,
            moneda=payload.moneda,
        )
        logger.info("pedido_real_registro_iniciado", extra=_extra_log(operation_id, pedido))
        persistido = self.repositorio_pedidos.guardar(pedido)
        logger.info("pedido_real_registrado", extra=_extra_log(operation_id, persistido))
        return _a_dto(persistido)


@dataclass(slots=True)
class ObtenerPedidoPorId:
    repositorio_pedidos: RepositorioPedidos

    def ejecutar(self, id_pedido: str) -> PedidoRealDTO:
        pedido = self.repositorio_pedidos.obtener_por_id(id_pedido)
        if pedido is None:
            raise ErrorAplicacionLookup(f"Pedido real no encontrado: {id_pedido}")
        return _a_dto(pedido)


def _generar_id_pedido() -> str:
    marca_tiempo = datetime.now(tz=UTC).strftime("%Y%m%d%H%M%S")
    return f"PED-{marca_tiempo}-{uuid4().hex[:8]}"


def _a_dto(pedido: Pedido) -> PedidoRealDTO:
    return PedidoRealDTO(
        id_pedido=pedido.id_pedido,
        estado=pedido.estado,
        estado_pago=pedido.estado_pago,
        canal_checkout=pedido.canal_checkout,
        moneda=pedido.moneda,
        subtotal=pedido.subtotal,
        proveedor_pago=pedido.proveedor_pago,
        id_externo_pago=pedido.id_externo_pago,
        url_pago=pedido.url_pago,
        requiere_revision_manual=pedido.requiere_revision_manual,
        email_post_pago_enviado=pedido.email_post_pago_enviado,
        cliente=ClientePedidoDTO(
            email=pedido.cliente.email,
            nombre_contacto=pedido.cliente.nombre_contacto,
            telefono_contacto=pedido.cliente.telefono_contacto,
            es_invitado=pedido.cliente.es_invitado,
            id_usuario=pedido.cliente.id_cliente,
        ),
        direccion_entrega=DireccionEntregaDTO(
            nombre_destinatario=pedido.direccion_entrega.nombre_destinatario,
            linea_1=pedido.direccion_entrega.linea_1,
            linea_2=pedido.direccion_entrega.linea_2,
            codigo_postal=pedido.direccion_entrega.codigo_postal,
            ciudad=pedido.direccion_entrega.ciudad,
            provincia=pedido.direccion_entrega.provincia,
            pais_iso=pedido.direccion_entrega.pais_iso,
            observaciones=pedido.direccion_entrega.observaciones,
        ),
        lineas=tuple(
            LineaPedidoRealDTO(
                id_producto=linea.id_producto,
                slug_producto=linea.slug_producto,
                nombre_producto=linea.nombre_producto,
                cantidad=linea.cantidad,
                precio_unitario=linea.precio_unitario,
                moneda=linea.moneda,
                subtotal=linea.subtotal,
            )
            for linea in pedido.lineas
        ),
        notas_cliente=pedido.notas_cliente,
        expedicion=ExpedicionPedidoDTO(
            transportista=pedido.transportista,
            codigo_seguimiento=pedido.codigo_seguimiento,
            envio_sin_seguimiento=pedido.envio_sin_seguimiento,
            fecha_preparacion=pedido.fecha_preparacion,
            fecha_envio=pedido.fecha_envio,
            fecha_entrega=pedido.fecha_entrega,
            observaciones_operativas=pedido.observaciones_operativas,
            email_envio_enviado=pedido.email_envio_enviado,
        ),
    )


def _extra_log(operation_id: str, pedido: Pedido) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "ruta": "/api/v1/pedidos/",
        "flujo": "checkout_real_v1",
        "canal_checkout": pedido.canal_checkout,
        "email_contacto": pedido.cliente.email,
        "numero_lineas": len(pedido.lineas),
        "subtotal": str(pedido.subtotal),
        "estado_inicial": pedido.estado,
        "id_pedido": pedido.id_pedido,
    }
