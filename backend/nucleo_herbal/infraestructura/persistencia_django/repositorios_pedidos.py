"""Repositorio ORM para el agregado Pedido real."""

from __future__ import annotations

from django.db import IntegrityError, transaction

from ...aplicacion.puertos.repositorios_pedidos import RepositorioPedidos
from ...dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
from .models_pedidos import EventoWebhookPagoModelo, LineaPedidoRealModelo, PedidoRealModelo


class RepositorioPedidosORM(RepositorioPedidos):
    @transaction.atomic
    def guardar(self, pedido: Pedido) -> Pedido:
        modelo, _ = PedidoRealModelo.objects.update_or_create(
            id_pedido=pedido.id_pedido,
            defaults={
                "estado": pedido.estado,
                "estado_pago": pedido.estado_pago,
                "proveedor_pago": pedido.proveedor_pago or "",
                "id_externo_pago": pedido.id_externo_pago or "",
                "url_pago": pedido.url_pago or "",
                "canal_checkout": pedido.canal_checkout,
                "email_contacto": pedido.cliente.email,
                "nombre_contacto": pedido.cliente.nombre_contacto,
                "telefono_contacto": pedido.cliente.telefono_contacto,
                "id_usuario": pedido.cliente.id_cliente,
                "es_invitado": pedido.cliente.es_invitado,
                "moneda": pedido.moneda,
                "metodo_envio": pedido.metodo_envio,
                "subtotal": pedido.subtotal,
                "importe_envio": pedido.importe_envio,
                "notas_cliente": pedido.notas_cliente,
                "direccion_entrega": _serializar_direccion(pedido.direccion_entrega),
                "fecha_creacion": pedido.fecha_creacion,
                "fecha_pago_confirmado": pedido.fecha_pago_confirmado,
                "inventario_descontado": pedido.inventario_descontado,
                "incidencia_stock_confirmacion": pedido.incidencia_stock_confirmacion,
                "requiere_revision_manual": pedido.requiere_revision_manual,
                "incidencia_stock_revisada": pedido.incidencia_stock_revisada,
                "fecha_revision_incidencia_stock": pedido.fecha_revision_incidencia_stock,
                "email_post_pago_enviado": pedido.email_post_pago_enviado,
                "fecha_email_post_pago": pedido.fecha_email_post_pago,
                "transportista": pedido.transportista,
                "codigo_seguimiento": pedido.codigo_seguimiento,
                "envio_sin_seguimiento": pedido.envio_sin_seguimiento,
                "fecha_preparacion": pedido.fecha_preparacion,
                "fecha_envio": pedido.fecha_envio,
                "fecha_entrega": pedido.fecha_entrega,
                "observaciones_operativas": pedido.observaciones_operativas,
                "email_envio_enviado": pedido.email_envio_enviado,
                "fecha_email_envio": pedido.fecha_email_envio,
                "cancelado_operativa_incidencia_stock": pedido.cancelado_operativa_incidencia_stock,
                "fecha_cancelacion_operativa": pedido.fecha_cancelacion_operativa,
                "motivo_cancelacion_operativa": pedido.motivo_cancelacion_operativa,
                "estado_reembolso": pedido.estado_reembolso,
                "fecha_reembolso": pedido.fecha_reembolso,
                "id_externo_reembolso": pedido.id_externo_reembolso or "",
                "motivo_fallo_reembolso": pedido.motivo_fallo_reembolso,
            },
        )
        modelo.lineas.all().delete()
        LineaPedidoRealModelo.objects.bulk_create([_a_modelo_linea(modelo, linea) for linea in pedido.lineas])
        return self._reconstruir(modelo.id_pedido)

    def obtener_por_id(self, id_pedido: str) -> Pedido | None:
        try:
            return self._reconstruir(id_pedido)
        except PedidoRealModelo.DoesNotExist:
            return None

    def obtener_por_id_para_actualizar(self, id_pedido: str) -> Pedido | None:
        modelo = PedidoRealModelo.objects.select_for_update().prefetch_related("lineas").filter(id_pedido=id_pedido).first()
        return None if modelo is None else self._a_pedido(modelo)

    def obtener_por_pago_externo(self, proveedor_pago: str, id_externo_pago: str) -> Pedido | None:
        if not proveedor_pago or not id_externo_pago:
            return None
        modelo = PedidoRealModelo.objects.filter(proveedor_pago=proveedor_pago, id_externo_pago=id_externo_pago).first()
        return None if modelo is None else self._reconstruir(modelo.id_pedido)

    def guardar_evento_webhook(self, proveedor_pago: str, id_evento: str, payload_crudo: str) -> bool:
        try:
            with transaction.atomic():
                EventoWebhookPagoModelo.objects.create(proveedor_pago=proveedor_pago, id_evento=id_evento, payload_crudo=payload_crudo)
        except IntegrityError:
            return False
        return True

    def listar(self, *, estados: tuple[str, ...] = (), solo_pagados: bool = False) -> tuple[Pedido, ...]:
        queryset = PedidoRealModelo.objects.prefetch_related("lineas").order_by("-fecha_creacion")
        if solo_pagados:
            queryset = queryset.filter(estado__in=("pagado", "preparando"))
        if estados:
            queryset = queryset.filter(estado__in=estados)
        return tuple(self._a_pedido(modelo) for modelo in queryset[:120])

    def listar_por_id_usuario(self, id_usuario: str) -> tuple[Pedido, ...]:
        queryset = (
            PedidoRealModelo.objects.prefetch_related("lineas")
            .filter(id_usuario=id_usuario.strip())
            .order_by("-fecha_creacion")
        )
        return tuple(self._a_pedido(modelo) for modelo in queryset[:60])

    def obtener_por_id_y_usuario(self, *, id_pedido: str, id_usuario: str) -> Pedido | None:
        modelo = (
            PedidoRealModelo.objects.prefetch_related("lineas")
            .filter(id_pedido=id_pedido, id_usuario=id_usuario.strip())
            .first()
        )
        return None if modelo is None else self._a_pedido(modelo)

    def _reconstruir(self, id_pedido: str) -> Pedido:
        return self._a_pedido(PedidoRealModelo.objects.prefetch_related("lineas").get(id_pedido=id_pedido))

    def _a_pedido(self, modelo: PedidoRealModelo) -> Pedido:
        return Pedido(
            id_pedido=modelo.id_pedido,
            estado=modelo.estado,
            estado_pago=modelo.estado_pago,
            proveedor_pago=modelo.proveedor_pago or None,
            id_externo_pago=modelo.id_externo_pago or None,
            url_pago=modelo.url_pago or None,
            canal_checkout=modelo.canal_checkout,
            cliente=ClientePedido(
                id_cliente=modelo.id_usuario,
                email=modelo.email_contacto,
                nombre_contacto=modelo.nombre_contacto,
                telefono_contacto=modelo.telefono_contacto,
                es_invitado=modelo.es_invitado,
            ),
            lineas=tuple(_a_linea(linea) for linea in modelo.lineas.order_by("id")),
            direccion_entrega=_a_direccion(modelo.direccion_entrega),
            fecha_creacion=modelo.fecha_creacion,
            fecha_pago_confirmado=modelo.fecha_pago_confirmado,
            inventario_descontado=modelo.inventario_descontado,
            incidencia_stock_confirmacion=modelo.incidencia_stock_confirmacion,
            requiere_revision_manual=modelo.requiere_revision_manual,
            incidencia_stock_revisada=modelo.incidencia_stock_revisada,
            fecha_revision_incidencia_stock=modelo.fecha_revision_incidencia_stock,
            email_post_pago_enviado=modelo.email_post_pago_enviado,
            fecha_email_post_pago=modelo.fecha_email_post_pago,
            transportista=modelo.transportista,
            codigo_seguimiento=modelo.codigo_seguimiento,
            envio_sin_seguimiento=modelo.envio_sin_seguimiento,
            fecha_preparacion=modelo.fecha_preparacion,
            fecha_envio=modelo.fecha_envio,
            fecha_entrega=modelo.fecha_entrega,
            observaciones_operativas=modelo.observaciones_operativas,
            email_envio_enviado=modelo.email_envio_enviado,
            fecha_email_envio=modelo.fecha_email_envio,
            cancelado_operativa_incidencia_stock=modelo.cancelado_operativa_incidencia_stock,
            fecha_cancelacion_operativa=modelo.fecha_cancelacion_operativa,
            motivo_cancelacion_operativa=modelo.motivo_cancelacion_operativa,
            estado_reembolso=modelo.estado_reembolso,
            fecha_reembolso=modelo.fecha_reembolso,
            id_externo_reembolso=modelo.id_externo_reembolso or None,
            motivo_fallo_reembolso=modelo.motivo_fallo_reembolso,
            notas_cliente=modelo.notas_cliente,
            moneda=modelo.moneda,
            metodo_envio=modelo.metodo_envio,
            importe_envio=modelo.importe_envio,
        )


def _a_modelo_linea(modelo: PedidoRealModelo, linea: LineaPedido) -> LineaPedidoRealModelo:
    return LineaPedidoRealModelo(
        pedido=modelo,
        id_producto=linea.id_producto,
        slug_producto=linea.slug_producto,
        nombre_producto=linea.nombre_producto,
        cantidad=linea.cantidad,
        cantidad_comercial=linea.cantidad_comercial,
        unidad_comercial=linea.unidad_comercial,
        precio_unitario=linea.precio_unitario,
        moneda=linea.moneda,
    )


def _a_linea(modelo: LineaPedidoRealModelo) -> LineaPedido:
    return LineaPedido(
        id_producto=modelo.id_producto,
        slug_producto=modelo.slug_producto,
        nombre_producto=modelo.nombre_producto,
        cantidad_comercial=modelo.cantidad_comercial or modelo.cantidad,
        unidad_comercial=modelo.unidad_comercial or "ud",
        precio_unitario=modelo.precio_unitario,
        moneda=modelo.moneda,
    )


def _a_direccion(payload: dict[str, object]) -> DireccionEntrega:
    return DireccionEntrega(
        nombre_destinatario=str(payload.get("nombre_destinatario", "")),
        linea_1=str(payload.get("linea_1", "")),
        linea_2=str(payload.get("linea_2", "")),
        codigo_postal=str(payload.get("codigo_postal", "")),
        ciudad=str(payload.get("ciudad", "")),
        provincia=str(payload.get("provincia", "")),
        pais_iso=str(payload.get("pais_iso", "ES")),
        observaciones=str(payload.get("observaciones", "")),
    )


def _serializar_direccion(direccion: DireccionEntrega) -> dict[str, str]:
    return {
        "nombre_destinatario": direccion.nombre_destinatario,
        "linea_1": direccion.linea_1,
        "linea_2": direccion.linea_2,
        "codigo_postal": direccion.codigo_postal,
        "ciudad": direccion.ciudad,
        "provincia": direccion.provincia,
        "pais_iso": direccion.pais_iso,
        "observaciones": direccion.observaciones,
    }
