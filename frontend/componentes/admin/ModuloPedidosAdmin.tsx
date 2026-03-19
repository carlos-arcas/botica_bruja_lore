"use client";

import Link from "next/link";
import { useState } from "react";

import { marcarPedidoEntregado, marcarPedidoEnviado, marcarPedidoPreparando, PayloadEnvioPedido } from "@/infraestructura/api/backoffice";

type PedidoAdmin = Record<string, any>;

type Props = {
  token?: string;
  itemsIniciales: PedidoAdmin[];
  estadoActivo?: string;
};

const ESTADOS = ["", "pagado", "preparando", "enviado", "entregado"];

export function ModuloPedidosAdmin({ token, itemsIniciales, estadoActivo = "" }: Props): JSX.Element {
  const [items, setItems] = useState(itemsIniciales);
  const [mensaje, setMensaje] = useState("");
  const [formularios, setFormularios] = useState<Record<string, PayloadEnvioPedido>>({});

  const actualizar = (idPedido: string, campo: keyof PayloadEnvioPedido, valor: string | boolean): void => {
    setFormularios((previo) => ({ ...previo, [idPedido]: { transportista: "", codigo_seguimiento: "", envio_sin_seguimiento: false, observaciones_operativas: "", ...previo[idPedido], [campo]: valor } }));
  };
  const reemplazar = (actualizado: PedidoAdmin, mensajeOk: string): void => {
    setItems((previos) => previos.map((item) => (item.id_pedido === actualizado.id_pedido ? actualizado : item)));
    setMensaje(mensajeOk);
  };

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Pedidos</p>
      <div className="admin-resumen">
        <h2>Operación física mínima del pedido</h2>
        <p>Filtra por estado, marca preparación, registra expedición con tracking y cierra la entrega sin romper el flujo legado.</p>
        <p>Filtro activo: <strong>{estadoActivo || "todos"}</strong>.</p>
      </div>
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {ESTADOS.map((estado) => <Link key={estado || "todos"} href={estado ? `/admin/pedidos?estado=${estado}` : "/admin/pedidos"} className="boton boton--secundario">{estado || "Todos"}</Link>)}
      </nav>
      {mensaje && <p>{mensaje}</p>}
      <div className="admin-tarjetas">
        {items.map((item) => {
          const form = formularios[item.id_pedido] ?? { transportista: "", codigo_seguimiento: "", envio_sin_seguimiento: false, observaciones_operativas: "" };
          const expedicion = item.expedicion ?? {};
          return (
            <article key={String(item.id_pedido)} className="admin-card">
              <h3>{String(item.id_pedido)}</h3>
              <p>Estado: <strong>{String(item.estado)}</strong></p>
              <p>Pago: <strong>{String(item.estado_pago)}</strong></p>
              <p>Email: {String(item.cliente?.email_contacto ?? "")}</p>
              <p>Preparación: {expedicion.fecha_preparacion ?? "pendiente"}</p>
              <p>Envío: {expedicion.fecha_envio ?? "pendiente"}</p>
              <p>Entrega: {expedicion.fecha_entrega ?? "pendiente"}</p>
              <p>Transportista: {expedicion.transportista || "sin registrar"}</p>
              <p>Tracking: {expedicion.codigo_seguimiento || (expedicion.envio_sin_seguimiento ? "sin seguimiento" : "pendiente")}</p>
              <button type="button" className="boton boton--principal" disabled={item.estado !== "pagado"} onClick={() => ejecutarPreparacion(item.id_pedido, token, reemplazar, setMensaje)}>
                {item.estado === "pagado" ? "Marcar preparando" : "Preparación no disponible"}
              </button>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <input placeholder="Transportista" value={form.transportista} onChange={(event) => actualizar(item.id_pedido, "transportista", event.target.value)} />
                <input placeholder="Código de seguimiento" value={form.codigo_seguimiento} onChange={(event) => actualizar(item.id_pedido, "codigo_seguimiento", event.target.value)} />
                <label><input type="checkbox" checked={form.envio_sin_seguimiento} onChange={(event) => actualizar(item.id_pedido, "envio_sin_seguimiento", event.target.checked)} /> Envío sin tracking público</label>
                <textarea placeholder="Observaciones operativas" value={form.observaciones_operativas} onChange={(event) => actualizar(item.id_pedido, "observaciones_operativas", event.target.value)} />
                <button type="button" className="boton boton--principal" disabled={item.estado !== "preparando"} onClick={() => ejecutarEnvio(item.id_pedido, form, token, reemplazar, setMensaje)}>
                  {item.estado === "preparando" ? "Marcar enviado" : "Envío no disponible"}
                </button>
                <button type="button" className="boton boton--secundario" disabled={item.estado !== "enviado"} onClick={() => ejecutarEntrega(item.id_pedido, form.observaciones_operativas, token, reemplazar, setMensaje)}>
                  {item.estado === "enviado" ? "Marcar entregado" : "Entrega no disponible"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

async function ejecutarPreparacion(idPedido: string, token: string | undefined, reemplazar: (actualizado: PedidoAdmin, mensajeOk: string) => void, setMensaje: (mensaje: string) => void): Promise<void> {
  try {
    reemplazar(await marcarPedidoPreparando(idPedido, token), `Pedido ${idPedido} marcado como preparando.`);
  } catch (error) {
    setMensaje(error instanceof Error ? error.message : "No se pudo actualizar el pedido.");
  }
}

async function ejecutarEnvio(idPedido: string, form: PayloadEnvioPedido, token: string | undefined, reemplazar: (actualizado: PedidoAdmin, mensajeOk: string) => void, setMensaje: (mensaje: string) => void): Promise<void> {
  try {
    reemplazar(await marcarPedidoEnviado(idPedido, form, token), `Pedido ${idPedido} marcado como enviado.`);
  } catch (error) {
    setMensaje(error instanceof Error ? error.message : "No se pudo registrar el envío.");
  }
}

async function ejecutarEntrega(idPedido: string, observaciones: string, token: string | undefined, reemplazar: (actualizado: PedidoAdmin, mensajeOk: string) => void, setMensaje: (mensaje: string) => void): Promise<void> {
  try {
    reemplazar(await marcarPedidoEntregado(idPedido, observaciones, token), `Pedido ${idPedido} marcado como entregado.`);
  } catch (error) {
    setMensaje(error instanceof Error ? error.message : "No se pudo cerrar la entrega.");
  }
}
