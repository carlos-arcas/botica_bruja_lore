"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { resolverTrackingVisibleCliente } from "@/contenido/pedidos/trackingVisible";
import { resolverEstadoVisiblePedidoCliente } from "@/infraestructura/api/estadoPedidoCliente";
import { construirUrlDocumentoPedido, iniciarPagoPedido, obtenerPedidoPublico, PedidoCreado, RetornoPago } from "@/infraestructura/api/pedidos";

type Props = { idPedidoRuta?: string; retornoPago?: RetornoPago };

export function ReciboPedidoReal({ idPedidoRuta, retornoPago = null }: Props): JSX.Element {
  const [pedido, setPedido] = useState<PedidoCreado | null>(null);
  const [mensaje, setMensaje] = useState("Cargando pedido real...");
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    if (!idPedidoRuta) return setMensaje("Falta el identificador del pedido real.");
    obtenerPedidoPublico(idPedidoRuta).then((resultado) => resultado.estado === "error" ? setMensaje(resultado.mensaje) : setPedido(resultado.pedido));
  }, [idPedidoRuta]);

  const pagarAhora = async (): Promise<void> => {
    if (!pedido) return;
    setProcesandoPago(true);
    const resultado = await iniciarPagoPedido(pedido.id_pedido);
    setProcesandoPago(false);
    if (resultado.estado === "error") return setMensaje(resultado.mensaje);
    if (resultado.pago.url_pago) return window.location.assign(resultado.pago.url_pago);
    setMensaje("La PSP no devolvió una URL para continuar el pago real.");
  };

  const resumenRetorno = useMemo(() => resolverResumenRetorno(pedido, retornoPago), [pedido, retornoPago]);
  if (!pedido) return <section className="bloque-home"><p>{mensaje}</p></section>;
  const puedePagar = pedido.estado === "pendiente_pago" && pedido.estado_pago !== "pagado";
  const mensajeEstado = resolverMensajeEstado(pedido);
  const estadoVisible = resolverEstadoVisiblePedidoCliente(pedido);
  const trackingVisible = resolverTrackingVisibleCliente(pedido.estado, pedido.expedicion);

  return (
    <section className="bloque-home" aria-labelledby="titulo-recibo-real">
      <p>Pedido real persistido en coexistencia con el legado demo.</p>
      <h1 id="titulo-recibo-real">Pedido {pedido.id_pedido}</h1>
      <p><strong>{resumenRetorno.titulo}</strong> {resumenRetorno.descripcion}</p>
      <p>Estado visible del pedido: <strong>{mensajeEstado.titulo}</strong>.</p>
      <p>{mensajeEstado.descripcion}</p>
      {estadoVisible.cancelacion.visible && (
        <>
          <p><strong>{estadoVisible.cancelacion.titulo}.</strong></p>
          <p>{estadoVisible.cancelacion.descripcion}</p>
        </>
      )}
      <p><strong>{estadoVisible.reembolso.titulo}.</strong></p>
      <p>{estadoVisible.reembolso.descripcion}</p>
      {estadoVisible.reembolso.fechaReembolso && <p>Fecha de reembolso: {estadoVisible.reembolso.fechaReembolso}.</p>}
      <p>Estado del pago: <strong>{pedido.estado_pago}</strong>.</p>
      <p>Contacto: {pedido.cliente.nombre_contacto} · {pedido.cliente.email_contacto}</p>
      <p>Entrega: {pedido.direccion_entrega.linea_1}, {pedido.direccion_entrega.ciudad}, {pedido.direccion_entrega.codigo_postal}</p>
      <p>Subtotal: {pedido.subtotal} {pedido.moneda}</p>
      <p>Envío ({pedido.metodo_envio}): {pedido.importe_envio} {pedido.moneda}</p>
      <p>Base imponible: {pedido.base_imponible} {pedido.moneda}</p>
      <p>Impuestos (tipo {pedido.tipo_impositivo}): {pedido.importe_impuestos} {pedido.moneda}</p>
      <p>Total: {pedido.total} {pedido.moneda}</p>
      <p>Proveedor PSP v1: {pedido.pago.proveedor_pago ?? "Stripe preparado para iniciar"}.</p>
      <p>Confirmación email pago: {pedido.email_post_pago_enviado ? "enviada" : "pendiente"}.</p>
      <p>Confirmación email envío: {pedido.expedicion.email_envio_enviado ? "enviada" : "pendiente"}.</p>
      <p>Revisión operativa: {pedido.requiere_revision_manual ? "pendiente" : "resuelta o no requerida"}.</p>
      {trackingVisible.mostrarTracking && (
        <>
          <p><strong>{trackingVisible.titulo}.</strong></p>
          <p>{trackingVisible.descripcion}</p>
        </>
      )}
      {puedePagar && <button className="boton boton--principal" type="button" onClick={pagarAhora} disabled={procesandoPago}>{procesandoPago ? "Redirigiendo al pago..." : botonPago(pedido.estado_pago)}</button>}
      {pedido.pago.url_pago && pedido.estado !== "pagado" && <p><a href={pedido.pago.url_pago}>Continuar pago externo</a></p>}
      <p><a href={construirUrlDocumentoPedido(pedido.id_pedido)}>Descargar recibo HTML trazable</a></p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/la-botica" className="boton boton--secundario">Volver a tienda</Link>
        {pedido.estado !== "pendiente_pago" && <Link href={`#confirmacion-${pedido.id_pedido}`} className="boton boton--secundario">Ver seguimiento del pedido</Link>}
      </div>
      <div id={`confirmacion-${pedido.id_pedido}`}>
        <h2>Resumen del pedido</h2>
        <ul>{pedido.lineas.map((linea) => <li key={`${linea.id_producto}-${linea.slug_producto}`}>{linea.nombre_producto} · {linea.cantidad_comercial}{linea.unidad_comercial} · {linea.subtotal} {linea.moneda}</li>)}</ul>
      </div>
      {mensaje && <p>{mensaje}</p>}
    </section>
  );
}

function resolverResumenRetorno(pedido: PedidoCreado | null, retornoPago: RetornoPago): { titulo: string; descripcion: string } {
  if (!pedido) return { titulo: "Cargando estado del pedido.", descripcion: "" };
  if (retornoPago === "cancel") return { titulo: "Pago cancelado o no completado.", descripcion: "Puedes volver a la tienda o reintentar el pago cuando quieras." };
  if (retornoPago === "success" && pedido.estado !== "pagado") return { titulo: "Pago completado, confirmación en curso.", descripcion: "Estamos esperando la confirmación operativa del webhook. Si ves este estado unos segundos, recarga la página." };
  if (pedido.estado === "pagado") return { titulo: "Pago confirmado.", descripcion: "Tu pedido ya quedó registrado y con cierre comercial mínimo activo." };
  return { titulo: "Pedido pendiente de pago.", descripcion: "Todavía no se ha confirmado el cobro. Puedes iniciar o reintentar el pago." };
}

function resolverMensajeEstado(pedido: PedidoCreado): { titulo: string; descripcion: string } {
  if (pedido.estado === "pagado" && pedido.requiere_revision_manual) return { titulo: "pagado · pendiente de revisión", descripcion: "Ya recibimos el pago y el equipo lo pasará a preparación en cuanto cierre la revisión operativa." };
  if (pedido.estado === "preparando") return { titulo: "preparando", descripcion: `Estamos reuniendo y embalando tu pedido desde ${pedido.expedicion.fecha_preparacion ?? "hoy"}.` };
  if (pedido.estado === "enviado") return { titulo: "enviado", descripcion: `Tu pedido ya está en tránsito con ${pedido.expedicion.transportista || "el transportista asignado"}.` };
  if (pedido.estado === "entregado") return { titulo: "entregado", descripcion: "Hemos registrado la entrega en backoffice para cerrar el ciclo operativo mínimo." };
  return { titulo: pedido.estado, descripcion: "El pedido todavía no ha entrado en operativa física." };
}

function botonPago(estadoPago: string): string {
  return estadoPago === "fallido" || estadoPago === "cancelado" ? "Reintentar pago" : "Pagar ahora";
}
