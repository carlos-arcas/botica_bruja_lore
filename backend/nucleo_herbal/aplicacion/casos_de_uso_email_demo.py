"""Casos de uso para composición y consulta de email demo post-pedido."""

from __future__ import annotations

from dataclasses import dataclass

from .casos_de_uso import ErrorAplicacionLookup
from .dto import EmailDemoLineaDTO, EmailPedidoDemoDTO
from .puertos.repositorios_pedidos_demo import RepositorioPedidosDemo
from ..dominio.pedidos_demo import PedidoDemo


@dataclass(slots=True)
class ComponerEmailDemoPedido:
    """Construye el contenido mínimo de email demo desde un PedidoDemo."""

    def ejecutar(self, pedido: PedidoDemo) -> EmailPedidoDemoDTO:
        return _a_email_dto(pedido)


@dataclass(slots=True)
class ObtenerEmailDemoPedidoPorId:
    """Recupera un pedido demo y compone su email demo asociado."""

    repositorio_pedidos_demo: RepositorioPedidosDemo
    componer_email_demo: ComponerEmailDemoPedido

    def ejecutar(self, id_pedido: str) -> EmailPedidoDemoDTO:
        pedido = self.repositorio_pedidos_demo.obtener_por_id(id_pedido)
        if pedido is None:
            raise ErrorAplicacionLookup(f"Pedido demo no encontrado: {id_pedido}")
        return self.componer_email_demo.ejecutar(pedido)


def _a_email_dto(pedido: PedidoDemo) -> EmailPedidoDemoDTO:
    asunto = f"[DEMO] Confirmación de pedido {pedido.id_pedido}"
    lineas = tuple(
        EmailDemoLineaDTO(
            nombre_producto=linea.nombre_producto,
            cantidad=linea.cantidad,
            subtotal_demo=linea.subtotal_demo,
        )
        for linea in pedido.lineas
    )
    cuerpo = _construir_cuerpo_texto(pedido)
    return EmailPedidoDemoDTO(
        id_pedido=pedido.id_pedido,
        estado=pedido.estado,
        canal_compra=pedido.canal_compra,
        email_destino=pedido.email_contacto,
        asunto=asunto,
        cuerpo_texto=cuerpo,
        subtotal_demo=pedido.subtotal_demo,
        lineas=lineas,
    )


def _construir_cuerpo_texto(pedido: PedidoDemo) -> str:
    lineas_txt = "\n".join(
        f"- {linea.nombre_producto}: {linea.cantidad}u · {linea.subtotal_demo} €"
        for linea in pedido.lineas
    )
    return (
        "Confirmación de pedido demo\n"
        f"ID pedido: {pedido.id_pedido}\n"
        f"Estado: {pedido.estado}\n"
        f"Canal: {pedido.canal_compra}\n"
        f"Email destino: {pedido.email_contacto}\n"
        "Resumen de líneas:\n"
        f"{lineas_txt}\n"
        f"Subtotal demo: {pedido.subtotal_demo} €\n"
        "Aviso: entorno demo sin envío real de correo ni cobro real."
    )
