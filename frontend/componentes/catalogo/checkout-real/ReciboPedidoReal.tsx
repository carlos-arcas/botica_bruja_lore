"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { iniciarPagoPedido, obtenerPedidoPublico, PedidoCreado } from "@/infraestructura/api/pedidos";

export function ReciboPedidoReal({ idPedidoRuta }: { idPedidoRuta?: string }): JSX.Element {
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
    if (!pedido) {
      return;
    }
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

  if (!pedido) {
    return <section className="bloque-home"><p>{mensaje}</p></section>;
  }

  const puedePagar = pedido.estado === "pendiente_pago" && pedido.estado_pago !== "pagado";

  return (
    <section className="bloque-home" aria-labelledby="titulo-recibo-real">
      <p>Pedido real persistido en coexistencia con el legado demo.</p>
      <h1 id="titulo-recibo-real">Pedido {pedido.id_pedido}</h1>
      <p>Estado del pedido: <strong>{pedido.estado}</strong>.</p>
      <p>Estado del pago: <strong>{pedido.estado_pago}</strong>.</p>
      <p>Contacto: {pedido.cliente.nombre_contacto} · {pedido.cliente.email_contacto}</p>
      <p>Entrega: {pedido.direccion_entrega.linea_1}, {pedido.direccion_entrega.ciudad}, {pedido.direccion_entrega.codigo_postal}</p>
      <p>Subtotal: {pedido.subtotal} {pedido.moneda}</p>
      <p>Proveedor PSP v1: {pedido.pago.proveedor_pago ?? "Stripe preparado para iniciar"}.</p>
      {puedePagar && <button className="boton boton--principal" type="button" onClick={pagarAhora} disabled={procesandoPago}>{procesandoPago ? "Redirigiendo al pago..." : "Pagar ahora"}</button>}
      {pedido.pago.url_pago && <p><a href={pedido.pago.url_pago}>Continuar pago externo</a></p>}
      {mensaje && <p>{mensaje}</p>}
      <Link href="/checkout" className="boton boton--secundario">Crear otro pedido real</Link>
    </section>
  );
}
