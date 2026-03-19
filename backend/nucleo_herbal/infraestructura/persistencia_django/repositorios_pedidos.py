"""Repositorio ORM para el agregado Pedido real."""

from __future__ import annotations

from django.db import transaction

from ...aplicacion.puertos.repositorios_pedidos import RepositorioPedidos
from ...dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, Pedido
from .models_pedidos import LineaPedidoRealModelo, PedidoRealModelo


class RepositorioPedidosORM(RepositorioPedidos):
    @transaction.atomic
    def guardar(self, pedido: Pedido) -> Pedido:
        modelo, _ = PedidoRealModelo.objects.update_or_create(
            id_pedido=pedido.id_pedido,
            defaults={
                "estado": pedido.estado,
                "canal_checkout": pedido.canal_checkout,
                "email_contacto": pedido.cliente.email,
                "nombre_contacto": pedido.cliente.nombre_contacto,
                "telefono_contacto": pedido.cliente.telefono_contacto,
                "id_usuario": pedido.cliente.id_cliente,
                "es_invitado": pedido.cliente.es_invitado,
                "moneda": pedido.moneda,
                "subtotal": pedido.subtotal,
                "notas_cliente": pedido.notas_cliente,
                "direccion_entrega": _serializar_direccion(pedido.direccion_entrega),
                "fecha_creacion": pedido.fecha_creacion,
            },
        )
        modelo.lineas.all().delete()
        LineaPedidoRealModelo.objects.bulk_create([
            LineaPedidoRealModelo(
                pedido=modelo,
                id_producto=linea.id_producto,
                slug_producto=linea.slug_producto,
                nombre_producto=linea.nombre_producto,
                cantidad=linea.cantidad,
                precio_unitario=linea.precio_unitario,
                moneda=linea.moneda,
            )
            for linea in pedido.lineas
        ])
        return self._reconstruir(modelo.id_pedido)

    def obtener_por_id(self, id_pedido: str) -> Pedido | None:
        try:
            return self._reconstruir(id_pedido)
        except PedidoRealModelo.DoesNotExist:
            return None

    def _reconstruir(self, id_pedido: str) -> Pedido:
        modelo = PedidoRealModelo.objects.prefetch_related("lineas").get(id_pedido=id_pedido)
        return Pedido(
            id_pedido=modelo.id_pedido,
            estado=modelo.estado,
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
            notas_cliente=modelo.notas_cliente,
            moneda=modelo.moneda,
        )


def _a_linea(modelo: LineaPedidoRealModelo) -> LineaPedido:
    return LineaPedido(
        id_producto=modelo.id_producto,
        slug_producto=modelo.slug_producto,
        nombre_producto=modelo.nombre_producto,
        cantidad=modelo.cantidad,
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
