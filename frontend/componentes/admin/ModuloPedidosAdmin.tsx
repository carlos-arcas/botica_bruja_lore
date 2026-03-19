"use client";

import { useState } from "react";

import { marcarPedidoPreparando } from "@/infraestructura/api/backoffice";

type Props = {
  token?: string;
  itemsIniciales: Record<string, unknown>[];
};

export function ModuloPedidosAdmin({ token, itemsIniciales }: Props): JSX.Element {
  const [items, setItems] = useState(itemsIniciales);
  const [mensaje, setMensaje] = useState("");

  const avanzar = async (idPedido: string): Promise<void> => {
    try {
      const actualizado = await marcarPedidoPreparando(idPedido, token);
      setItems((previos) => previos.map((item) => (item.id_pedido === idPedido ? actualizado : item)));
      setMensaje(`Pedido ${idPedido} marcado como preparando.`);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo actualizar el pedido.");
    }
  };

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Pedidos</p>
      <div className="admin-resumen">
        <h2>Operación mínima post-pago</h2>
        <p>Listado de pedidos reales para revisar cobros confirmados y pasar el primer avance administrativo.</p>
      </div>
      {mensaje && <p>{mensaje}</p>}
      <div className="admin-tarjetas">
        {items.map((item) => {
          const puedePreparar = item.estado === "pagado";
          return (
            <article key={String(item.id_pedido)} className="admin-card">
              <h3>{String(item.id_pedido)}</h3>
              <p>Estado: <strong>{String(item.estado)}</strong></p>
              <p>Pago: <strong>{String(item.estado_pago)}</strong></p>
              <p>Email: {String((item.cliente as { email_contacto?: string })?.email_contacto ?? "")}</p>
              <p>Revisión: {item.requiere_revision_manual ? "pendiente" : "resuelta"}</p>
              <p>Email post-pago: {item.email_post_pago_enviado ? "enviado" : "pendiente"}</p>
              <button type="button" className="boton boton--principal" disabled={!puedePreparar} onClick={() => avanzar(String(item.id_pedido))}>
                {puedePreparar ? "Marcar preparando" : "Preparación no disponible"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
