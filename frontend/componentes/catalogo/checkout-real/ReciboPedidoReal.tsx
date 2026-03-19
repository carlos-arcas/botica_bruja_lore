"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { iniciarPagoPedido, obtenerPedidoPublico, PedidoCreado, RetornoPago } from "@/infraestructura/api/pedidos";

type Props = {
  idPedidoRuta?: string;
  retornoPago?: RetornoPago;
};

export function ReciboPedidoReal({ idPedidoRuta, retornoPago = null }: Props): JSX.Element {
  const [pedido, setPedido] = useState<PedidoCreado | null>(null);
  const [mensaje, setMensaje] = useState("Cargando pedido real...");
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    if (!idPedidoRuta) {
      setMensaje("Falta el identificador del pedido real.");
      return;
    }
    obtenerPedidoPublico(idPedidoRuta).then((resultado) => {
      if (resultado.estado === "error") {
        setMensaje(resultado.mensaje);
        return;
      }
      setPedido(resultado.pedido);
    });
  }, [idPedidoRuta]);

  const pagarAhora = async (): Promise<void> => {
    if (!pedido) return;
    setProcesandoPago(true);
    const resultado = await iniciarPagoPedido(pedido.id_pedido);
    setProcesandoPago(false);
    if (resultado.estado === "error") {
      setMensaje(resultado.mensaje);
      return;
    }
    if (resultado.pago.url_pago) {
      window.location.assign(resultado.pago.url_pago);
      return;
    }
    setMensaje("La PSP no devolvió una URL para continuar el pago real.");
  };

  const resumenRetorno = useMemo(() => resolverResumenRetorno(pedido, retornoPago), [pedido, retornoPago]);
  if (!pedido) return <section className="bloque-home"><p>{mensaje}</p></section>;
  const puedePagar = pedido.estado === "pendiente_pago" && pedido.estado_pago !== "pagado";

  return (
    <section className="bloque-home" aria-labelledby="titulo-recibo-real">
      <p>Pedido real persistido en coexistencia con el legado demo.</p>
      <h1 id="titulo-recibo-real">Pedido {pedido.id_pedido}</h1>
      <p><strong>{resumenRetorno.titulo}</strong> {resumenRetorno.descripcion}</p>
      <p>Estado visible del pedido: <strong>{etiquetaEstadoPedido(pedido)}</strong>.</p>
      <p>Estado del pago: <strong>{pedido.estado_pago}</strong>.</p>
      <p>Contacto: {pedido.cliente.nombre_contacto} · {pedido.cliente.email_contacto}</p>
      <p>Entrega: {pedido.direccion_entrega.linea_1}, {pedido.direccion_entrega.ciudad}, {pedido.direccion_entrega.codigo_postal}</p>
      <p>Subtotal: {pedido.subtotal} {pedido.moneda}</p>
      <p>Proveedor PSP v1: {pedido.pago.proveedor_pago ?? "Stripe preparado para iniciar"}.</p>
      <p>Confirmación email: {pedido.email_post_pago_enviado ? "enviada" : "pendiente"}.</p>
      <p>Revisión operativa: {pedido.requiere_revision_manual ? "pendiente" : "resuelta o no requerida"}.</p>
      {puedePagar && <button className="boton boton--principal" type="button" onClick={pagarAhora} disabled={procesandoPago}>{procesandoPago ? "Redirigiendo al pago..." : botonPago(pedido.estado_pago)}</button>}
      {pedido.pago.url_pago && pedido.estado !== "pagado" && <p><a href={pedido.pago.url_pago}>Continuar pago externo</a></p>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/la-botica" className="boton boton--secundario">Volver a tienda</Link>
        {pedido.estado === "pagado" && <Link href={`#confirmacion-${pedido.id_pedido}`} className="boton boton--secundario">Ver confirmación del pedido</Link>}
      </div>
      <div id={`confirmacion-${pedido.id_pedido}`}>
        <h2>Resumen del pedido</h2>
        <ul>{pedido.lineas.map((linea) => <li key={`${linea.id_producto}-${linea.slug_producto}`}>{linea.nombre_producto} · {linea.cantidad}u · {linea.subtotal} {linea.moneda}</li>)}</ul>
      </div>
      {mensaje && <p>{mensaje}</p>}
    </section>
  );
}

function resolverResumenRetorno(pedido: PedidoCreado | null, retornoPago: RetornoPago): { titulo: string; descripcion: string } {
  if (!pedido) return { titulo: "Cargando estado del pedido.", descripcion: "" };
  if (retornoPago === "cancel") {
    return { titulo: "Pago cancelado o no completado.", descripcion: "Puedes volver a la tienda o reintentar el pago cuando quieras." };
  }
  if (retornoPago === "success" && pedido.estado !== "pagado") {
    return { titulo: "Pago completado, confirmación en curso.", descripcion: "Estamos esperando la confirmación operativa del webhook. Si ves este estado unos segundos, recarga la página." };
  }
  if (pedido.estado === "pagado") {
    return { titulo: "Pago confirmado.", descripcion: "Tu pedido ya quedó registrado y con cierre comercial mínimo activo." };
  }
  return { titulo: "Pedido pendiente de pago.", descripcion: "Todavía no se ha confirmado el cobro. Puedes iniciar o reintentar el pago." };
}

function etiquetaEstadoPedido(pedido: PedidoCreado): string {
  if (pedido.estado === "pagado" && pedido.requiere_revision_manual) return "pagado · pendiente de revisión";
  if (pedido.estado === "pagado") return "pagado";
  if (pedido.estado === "preparando") return "preparando";
  return pedido.estado;
}

function botonPago(estadoPago: string): string {
  return estadoPago === "fallido" || estadoPago === "cancelado" ? "Reintentar pago" : "Pagar ahora";
}
