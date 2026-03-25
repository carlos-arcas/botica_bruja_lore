"""Render HTML trazable del documento fiscal v2 de pedido real."""

from __future__ import annotations

from html import escape

from django.conf import settings

from ...aplicacion.dto_pedidos import PedidoRealDTO


def construir_documento_html_pedido(dto: PedidoRealDTO) -> str:
    filas_lineas = "".join(_fila_linea(item) for item in dto.lineas)
    documento_id = _identificador_documental(dto)
    return f"""<!doctype html>
<html lang=\"es\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Documento fiscal {escape(documento_id)}</title>
  <style>
    :root {{ color-scheme: light; }}
    body {{ font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }}
    h1, h2 {{ margin-bottom: 8px; }}
    .meta, .estado, .bloque {{ margin-bottom: 16px; }}
    table {{ width: 100%; border-collapse: collapse; margin: 12px 0 20px; }}
    th, td {{ border-bottom: 1px solid #d1d5db; padding: 8px 4px; text-align: left; }}
    .totales p {{ margin: 4px 0; }}
    .total {{ font-size: 1.15rem; font-weight: 700; }}
    .noprint {{ margin-top: 20px; }}
    @media print {{ .noprint {{ display: none; }} body {{ margin: 0; }} }}
  </style>
</head>
<body>
  <h1>Documento fiscal de pedido</h1>
  <div class=\"meta\">
    <p><strong>Documento:</strong> {escape(documento_id)}</p>
    <p><strong>Pedido:</strong> {escape(dto.id_pedido)}</p>
    <p><strong>Fecha documento:</strong> {_fecha(dto)}</p>
    <p><strong>Fecha pedido:</strong> {_fecha(dto)}</p>
  </div>
  <div class=\"bloque\">
    <h2>Emisor</h2>
    <p><strong>Nombre comercial:</strong> La Botica de la Bruja Lore</p>
    <p><strong>Email contacto:</strong> {escape(_email_emisor())}</p>
    <p><strong>Sitio público:</strong> {escape(_web_emisor())}</p>
  </div>
  <div class=\"bloque\">
    <h2>Cliente</h2>
    <p><strong>Nombre:</strong> {escape(dto.cliente.nombre_contacto)}</p>
    <p><strong>Email:</strong> {escape(dto.cliente.email)}</p>
    <p><strong>Teléfono:</strong> {escape(dto.cliente.telefono_contacto)}</p>
    <p><strong>Dirección de entrega:</strong> {escape(dto.direccion_entrega.linea_1)}, {escape(dto.direccion_entrega.codigo_postal)} {escape(dto.direccion_entrega.ciudad)}, {escape(dto.direccion_entrega.pais_iso)}</p>
    <p><strong>Moneda:</strong> {escape(dto.moneda)}</p>
  </div>
  <div class=\"estado\">
    <h2>Estado</h2>
    <p><strong>Estado pedido:</strong> {escape(dto.estado)}</p>
    <p><strong>Estado pago:</strong> {escape(dto.estado_pago)}</p>
    <p><strong>Estado cliente:</strong> {escape(_estado_cliente(dto))}</p>
    <p><strong>Expedición:</strong> {escape(_estado_expedicion(dto))}</p>
    {_estado_reembolso_documental(dto)}
  </div>
  <h2>Detalle fiscal por línea</h2>
  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cantidad + unidad</th>
        <th>Base línea</th>
        <th>Tipo impositivo</th>
        <th>Cuota línea</th>
        <th>Total línea</th>
      </tr>
    </thead>
    <tbody>{filas_lineas}</tbody>
  </table>
  <div class=\"totales\">
    <p>Subtotal (base artículos): {dto.subtotal} {escape(dto.moneda)}</p>
    <p>Base imponible total: {dto.base_imponible} {escape(dto.moneda)}</p>
    <p>Envío ({escape(dto.metodo_envio)}): {dto.importe_envio} {escape(dto.moneda)}</p>
    <p>Impuestos totales (incluye envío al {_tipo_impositivo(dto)}): {dto.importe_impuestos} {escape(dto.moneda)}</p>
    <p class=\"total\">Total: {dto.total} {escape(dto.moneda)}</p>
  </div>
  <p>Documento generado en runtime desde el pedido real persistido. Sin numeración fiscal legal avanzada en esta fase.</p>
  <p class=\"noprint\"><button type=\"button\" onclick=\"window.print()\">Imprimir o guardar PDF</button></p>
</body>
</html>"""


def _fila_linea(linea: object) -> str:
    total_linea = linea.subtotal + linea.importe_impuestos
    return (
        f"<tr><td>{escape(linea.nombre_producto)}</td>"
        f"<td>{linea.cantidad_comercial} {escape(linea.unidad_comercial)}</td>"
        f"<td>{linea.subtotal} {escape(linea.moneda)}</td>"
        f"<td>{_tipo_impositivo_linea(linea)}</td>"
        f"<td>{linea.importe_impuestos} {escape(linea.moneda)}</td>"
        f"<td>{total_linea} {escape(linea.moneda)}</td></tr>"
    )


def _estado_cliente(dto: PedidoRealDTO) -> str:
    if dto.cancelado_operativa_incidencia_stock:
        if dto.estado_reembolso == "ejecutado":
            return "cancelado operativamente · reembolso ejecutado"
        if dto.estado_reembolso == "fallido":
            return "cancelado operativamente · reembolso fallido"
        return "cancelado operativamente · reembolso no iniciado"
    return "sin cancelación operativa"


def _estado_expedicion(dto: PedidoRealDTO) -> str:
    if dto.estado not in {"enviado", "entregado"}:
        return "pendiente de expedición"
    if dto.expedicion.codigo_seguimiento.strip():
        base = f"{dto.expedicion.transportista or 'transportista asignado'} · tracking {dto.expedicion.codigo_seguimiento}"
        return base
    if dto.expedicion.envio_sin_seguimiento:
        if dto.expedicion.transportista.strip():
            return f"{dto.expedicion.transportista} · envío sin tracking público"
        return "envío sin tracking público"
    return "enviado sin tracking informado"


def _tipo_impositivo(dto: PedidoRealDTO) -> str:
    return f"{int(dto.tipo_impositivo * 100)}%"


def _tipo_impositivo_linea(linea: object) -> str:
    return f"{int(linea.tipo_impositivo * 100)}%"


def _fecha(dto: PedidoRealDTO) -> str:
    return dto.fecha_creacion.date().isoformat()


def _identificador_documental(dto: PedidoRealDTO) -> str:
    return f"DOC-{dto.id_pedido}-{dto.fecha_creacion.date().isoformat()}"


def _email_emisor() -> str:
    email = str(getattr(settings, "DEFAULT_FROM_EMAIL", "") or "").strip()
    return email or "no informado"


def _web_emisor() -> str:
    url = str(getattr(settings, "PUBLIC_SITE_URL", "") or "").strip()
    return url or "no informada"


def _estado_reembolso_documental(dto: PedidoRealDTO) -> str:
    if dto.estado_reembolso == "ejecutado" and dto.fecha_reembolso is not None:
        return f"<p><strong>Reembolso:</strong> ejecutado ({escape(str(dto.fecha_reembolso.date()))})</p>"
    if dto.estado_reembolso == "fallido":
        return "<p><strong>Reembolso:</strong> fallido</p>"
    if dto.cancelado_operativa_incidencia_stock:
        return "<p><strong>Reembolso:</strong> no iniciado</p>"
    return ""
