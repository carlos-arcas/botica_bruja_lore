"""Render HTML mínimo y trazable del comprobante de pedido real."""

from __future__ import annotations

from html import escape

from ...aplicacion.dto_pedidos import PedidoRealDTO


def construir_documento_html_pedido(dto: PedidoRealDTO) -> str:
    filas_lineas = "".join(_fila_linea(item) for item in dto.lineas)
    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Recibo {escape(dto.id_pedido)}</title>
  <style>
    :root {{ color-scheme: light; }}
    body {{ font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }}
    h1, h2 {{ margin-bottom: 8px; }}
    .meta, .estado {{ margin-bottom: 16px; }}
    table {{ width: 100%; border-collapse: collapse; margin: 12px 0 20px; }}
    th, td {{ border-bottom: 1px solid #d1d5db; padding: 8px 4px; text-align: left; }}
    .totales p {{ margin: 4px 0; }}
    .total {{ font-size: 1.15rem; font-weight: 700; }}
    .noprint {{ margin-top: 20px; }}
    @media print {{ .noprint {{ display: none; }} body {{ margin: 0; }} }}
  </style>
</head>
<body>
  <h1>Recibo de pedido {escape(dto.id_pedido)}</h1>
  <div class="meta">
    <p><strong>Fecha:</strong> {_fecha(dto)}</p>
    <p><strong>Cliente:</strong> {escape(dto.cliente.nombre_contacto)} · {escape(dto.cliente.email)}</p>
    <p><strong>Dirección:</strong> {escape(dto.direccion_entrega.linea_1)}, {escape(dto.direccion_entrega.codigo_postal)} {escape(dto.direccion_entrega.ciudad)}, {escape(dto.direccion_entrega.pais_iso)}</p>
    <p><strong>Moneda:</strong> {escape(dto.moneda)}</p>
  </div>
  <div class="estado">
    <p><strong>Estado pedido:</strong> {escape(dto.estado)}</p>
    <p><strong>Estado pago:</strong> {escape(dto.estado_pago)}</p>
    <p><strong>Estado cliente:</strong> {escape(_estado_cliente(dto))}</p>
  </div>
  <h2>Líneas del pedido</h2>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio unitario</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>{filas_lineas}</tbody>
  </table>
  <div class="totales">
    <p>Subtotal: {dto.subtotal} {escape(dto.moneda)}</p>
    <p>Envío ({escape(dto.metodo_envio)}): {dto.importe_envio} {escape(dto.moneda)}</p>
    <p>Impuestos ({_tipo_impositivo(dto)}): {dto.importe_impuestos} {escape(dto.moneda)}</p>
    <p class="total">Total: {dto.total} {escape(dto.moneda)}</p>
  </div>
  <p class="noprint"><button type="button" onclick="window.print()">Imprimir o guardar PDF</button></p>
</body>
</html>"""


def _fila_linea(linea: object) -> str:
    return (
        f"<tr><td>{escape(linea.nombre_producto)}</td>"
        f"<td>{linea.cantidad_comercial}{escape(linea.unidad_comercial)}</td>"
        f"<td>{linea.precio_unitario} {escape(linea.moneda)}</td>"
        f"<td>{linea.subtotal} {escape(linea.moneda)}</td></tr>"
    )


def _estado_cliente(dto: PedidoRealDTO) -> str:
    if dto.cancelado_operativa_incidencia_stock:
        if dto.estado_reembolso == "ejecutado":
            return "cancelado operativamente · reembolso ejecutado"
        if dto.estado_reembolso == "fallido":
            return "cancelado operativamente · reembolso fallido"
        return "cancelado operativamente · reembolso no iniciado"
    return "sin cancelación operativa"


def _tipo_impositivo(dto: PedidoRealDTO) -> str:
    return f"{int(dto.tipo_impositivo * 100)}%"


def _fecha(dto: PedidoRealDTO) -> str:
    return dto.fecha_creacion.date().isoformat()
