"""Casos de uso del checkout real v1."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import uuid4

from ..dominio.cuentas_cliente import DireccionCuentaCliente
from ..dominio.excepciones import ErrorDominio
from ..dominio.pedidos import DireccionEntrega, PayloadPedido, Pedido
from .casos_de_uso import ErrorAplicacionLookup
from .dto_pedidos import ClientePedidoDTO, DireccionEntregaDTO, ExpedicionPedidoDTO, LineaPedidoRealDTO, PedidoRealDTO
from .errores_pedidos import ErrorStockPedido, LineaStockError
from .puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from .puertos.repositorios_inventario import RepositorioInventario
from .puertos.repositorios_pedidos import RepositorioPedidos

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class RegistrarPedido:
    repositorio_pedidos: RepositorioPedidos
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    repositorio_inventario: RepositorioInventario

    def ejecutar(self, payload: PayloadPedido, operation_id: str) -> PedidoRealDTO:
        pedido = Pedido(
            id_pedido=_generar_id_pedido(),
            estado="pendiente_pago",
            estado_pago="pendiente",
            canal_checkout=payload.canal_checkout,
            cliente=payload.cliente,
            lineas=payload.lineas,
            direccion_entrega=self._resolver_direccion_entrega(payload, operation_id),
            notas_cliente=payload.notas_cliente,
            moneda=payload.moneda,
        )
        self._validar_stock_disponible(pedido, operation_id)
        logger.info("pedido_real_registro_iniciado", extra=_extra_log(operation_id, pedido))
        persistido = self.repositorio_pedidos.guardar(pedido)
        logger.info("pedido_real_registrado", extra=_extra_log(operation_id, persistido))
        return _a_dto(persistido)

    def _resolver_direccion_entrega(self, payload: PayloadPedido, operation_id: str) -> DireccionEntrega:
        if payload.direccion_entrega is not None:
            logger.info(
                "pedido_real_direccion_manual",
                extra=_extra_direccion(operation_id, payload, resultado="ok"),
            )
            return payload.direccion_entrega

        direccion_guardada = self.repositorio_cuentas_cliente.obtener_direccion_por_id(
            id_direccion=payload.id_direccion_guardada or "",
        )
        if direccion_guardada is None:
            logger.warning(
                "pedido_real_direccion_guardada_no_encontrada",
                extra=_extra_direccion(operation_id, payload, resultado="error"),
            )
            raise ErrorDominio("La dirección guardada indicada no existe.")
        if direccion_guardada.id_usuario != payload.cliente.id_cliente:
            logger.warning(
                "pedido_real_direccion_guardada_ajena",
                extra=_extra_direccion(operation_id, payload, resultado="error", direccion=direccion_guardada),
            )
            raise ErrorDominio("La dirección guardada no pertenece al cliente autenticado.")
        logger.info(
            "pedido_real_direccion_guardada_resuelta",
            extra=_extra_direccion(operation_id, payload, resultado="ok", direccion=direccion_guardada),
        )
        return DireccionEntrega(**direccion_guardada.a_direccion_entrega())

    def _validar_stock_disponible(self, pedido: Pedido, operation_id: str) -> None:
        incidencias: list[LineaStockError] = []
        for linea in pedido.lineas:
            inventario = self.repositorio_inventario.obtener_por_id_producto(linea.id_producto)
            if inventario is None:
                incidencia = LineaStockError(
                    id_producto=linea.id_producto,
                    slug_producto=linea.slug_producto,
                    nombre_producto=linea.nombre_producto,
                    cantidad_solicitada=linea.cantidad,
                    codigo="inventario_no_registrado",
                    detalle="El producto no tiene inventario disponible para crear el pedido.",
                )
                incidencias.append(incidencia)
                logger.warning("pedido_real_stock_sin_inventario", extra=_extra_stock(operation_id, pedido, incidencia))
                continue
            if inventario.puede_cubrir(linea.cantidad):
                continue
            incidencia = LineaStockError(
                id_producto=linea.id_producto,
                slug_producto=linea.slug_producto,
                nombre_producto=linea.nombre_producto,
                cantidad_solicitada=linea.cantidad,
                cantidad_disponible=inventario.cantidad_disponible,
                codigo="stock_insuficiente",
                detalle="La cantidad solicitada supera el stock disponible en este momento.",
            )
            incidencias.append(incidencia)
            logger.warning("pedido_real_stock_insuficiente", extra=_extra_stock(operation_id, pedido, incidencia))
        if incidencias:
            raise ErrorStockPedido(
                "No pudimos crear el pedido porque una o más líneas no tienen stock disponible.",
                lineas=tuple(incidencias),
            )
        logger.info(
            "pedido_real_stock_validado",
            extra={
                "operation_id": operation_id,
                "ruta": "/api/v1/pedidos/",
                "flujo": "checkout_real_v1",
                "id_pedido": pedido.id_pedido,
                "numero_lineas": len(pedido.lineas),
                "resultado": "ok",
            },
        )


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
        inventario_descontado=pedido.inventario_descontado,
        incidencia_stock_confirmacion=pedido.incidencia_stock_confirmacion,
        incidencia_stock_revisada=pedido.incidencia_stock_revisada,
        fecha_revision_incidencia_stock=pedido.fecha_revision_incidencia_stock,
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


def _extra_direccion(
    operation_id: str,
    payload: PayloadPedido,
    *,
    resultado: str,
    direccion: DireccionCuentaCliente | None = None,
) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "flujo": "checkout_real_v1",
        "resultado": resultado,
        "usuario_id": payload.cliente.id_cliente,
        "canal_checkout": payload.canal_checkout,
        "direccion_fuente": "guardada" if payload.id_direccion_guardada else "manual",
        "id_direccion_guardada": payload.id_direccion_guardada,
        "direccion_predeterminada": None if direccion is None else direccion.predeterminada,
    }


def _extra_stock(operation_id: str, pedido: Pedido, incidencia: LineaStockError) -> dict[str, object]:
    return {
        "operation_id": operation_id,
        "ruta": "/api/v1/pedidos/",
        "flujo": "checkout_real_v1",
        "id_pedido": pedido.id_pedido,
        "canal_checkout": pedido.canal_checkout,
        "producto_id": incidencia.id_producto,
        "slug_producto": incidencia.slug_producto,
        "cantidad_solicitada": incidencia.cantidad_solicitada,
        "cantidad_disponible": incidencia.cantidad_disponible,
        "codigo_error": incidencia.codigo,
        "resultado": "error",
    }
