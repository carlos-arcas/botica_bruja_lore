"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { obtenerPedidoPublico, PedidoCreado } from "@/infraestructura/api/pedidos";

export function ReciboPedidoReal({ idPedidoRuta }: { idPedidoRuta?: string }): JSX.Element {
  const [pedido, setPedido] = useState<PedidoCreado | null>(null);
  const [mensaje, setMensaje] = useState("Cargando pedido real...");

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

  if (!pedido) {
    return <section className="bloque-home"><p>{mensaje}</p></section>;
  }

  return (
    <section className="bloque-home" aria-labelledby="titulo-recibo-real">
      <p>Pedido real persistido en coexistencia con el legado demo.</p>
      <h1 id="titulo-recibo-real">Pedido {pedido.id_pedido}</h1>
      <p>Estado inicial: <strong>{pedido.estado}</strong>.</p>
      <p>Contacto: {pedido.cliente.nombre_contacto} · {pedido.cliente.email_contacto}</p>
      <p>Entrega: {pedido.direccion_entrega.linea_1}, {pedido.direccion_entrega.ciudad}, {pedido.direccion_entrega.codigo_postal}</p>
      <p>Subtotal: {pedido.subtotal} {pedido.moneda}</p>
      <Link href="/checkout" className="boton boton--secundario">Crear otro pedido real</Link>
    </section>
  );
}
