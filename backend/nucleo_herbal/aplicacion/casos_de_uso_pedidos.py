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
from .puertos.proveedor_envio import PuertoProveedorEnvio
from .puertos.repositorios_inventario import RepositorioInventario
from .puertos.repositorios_pedidos import RepositorioPedidos
from .puertos.repositorios_productos_checkout import RepositorioProductosCheckout

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class RegistrarPedido:
    repositorio_pedidos: RepositorioPedidos
    repositorio_cuentas_cliente: RepositorioCuentasCliente
    repositorio_inventario: RepositorioInventario
    repositorio_productos_checkout: RepositorioProductosCheckout
    proveedor_envio: PuertoProveedorEnvio

    def ejecutar(self, payload: PayloadPedido, operation_id: str) -> PedidoRealDTO:
        importe_envio = self.proveedor_envio.resolver_importe_envio_estandar(moneda=payload.moneda, operation_id=operation_id)
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
            metodo_envio="envio_estandar",
            importe_envio=importe_envio,
        )
        self._validar_semantica_comercial_lineas(pedido)
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
                    cantidad_solicitada=linea.cantidad_comercial,
                    codigo="inventario_no_registrado",
                    detalle="El producto no tiene inventario disponible para crear el pedido.",
                )
                incidencias.append(incidencia)
                logger.warning("pedido_real_stock_sin_inventario", extra=_extra_stock(operation_id, pedido, incidencia))
                continue
            if linea.unidad_comercial != inventario.unidad_base:
                raise ErrorDominio("La unidad comercial de la línea no coincide con la unidad base operativa del producto.")
            if inventario.puede_cubrir(linea.cantidad_comercial):
                continue
            incidencia = LineaStockError(
                id_producto=linea.id_producto,
                slug_producto=linea.slug_producto,
                nombre_producto=linea.nombre_producto,
                cantidad_solicitada=linea.cantidad_comercial,
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

    def _validar_semantica_comercial_lineas(self, pedido: Pedido) -> None:
        for linea in pedido.lineas:
            producto = self.repositorio_productos_checkout.obtener_semantica_comercial_por_id(
                linea.id_producto
            )
            if producto is None:
                raise ErrorDominio("No pudimos validar la semántica comercial porque el producto no existe.")
            if linea.unidad_comercial != producto.unidad_comercial:
                raise ErrorDominio("La unidad de línea no coincide con la unidad comercial del producto.")
            if linea.cantidad_comercial < producto.cantidad_minima_compra:
                raise ErrorDominio("La cantidad comercial no cumple la cantidad mínima de compra configurada para el producto.")
            if linea.cantidad_comercial % producto.incremento_minimo_venta != 0:
                raise ErrorDominio("La cantidad comercial no cumple el incremento mínimo de venta configurado para el producto.")


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
        fecha_creacion=pedido.fecha_creacion,
        estado=pedido.estado,
        estado_pago=pedido.estado_pago,
        canal_checkout=pedido.canal_checkout,
        moneda=pedido.moneda,
        metodo_envio=pedido.metodo_envio,
        subtotal=pedido.subtotal,
        importe_envio=pedido.importe_envio,
        base_imponible=pedido.base_imponible,
        tipo_impositivo=pedido.tipo_impositivo,
        importe_impuestos=pedido.importe_impuestos,
        total=pedido.total,
        proveedor_pago=pedido.proveedor_pago,
        id_externo_pago=pedido.id_externo_pago,
        url_pago=pedido.url_pago,
        requiere_revision_manual=pedido.requiere_revision_manual,
        inventario_descontado=pedido.inventario_descontado,
        incidencia_stock_confirmacion=pedido.incidencia_stock_confirmacion,
        incidencia_stock_revisada=pedido.incidencia_stock_revisada,
        fecha_revision_incidencia_stock=pedido.fecha_revision_incidencia_stock,
        cancelado_operativa_incidencia_stock=pedido.cancelado_operativa_incidencia_stock,
        fecha_cancelacion_operativa=pedido.fecha_cancelacion_operativa,
        motivo_cancelacion_operativa=pedido.motivo_cancelacion_operativa,
        estado_reembolso=pedido.estado_reembolso,
        fecha_reembolso=pedido.fecha_reembolso,
        id_externo_reembolso=pedido.id_externo_reembolso,
        motivo_fallo_reembolso=pedido.motivo_fallo_reembolso,
        inventario_restituido=pedido.inventario_restituido,
        fecha_restitucion_inventario=pedido.fecha_restitucion_inventario,
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
                cantidad_comercial=linea.cantidad_comercial,
                unidad_comercial=linea.unidad_comercial,
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
        "metodo_envio": pedido.metodo_envio,
        "importe_envio": str(pedido.importe_envio),
        "base_imponible": str(pedido.base_imponible),
        "tipo_impositivo": str(pedido.tipo_impositivo),
        "importe_impuestos": str(pedido.importe_impuestos),
        "total": str(pedido.total),
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
