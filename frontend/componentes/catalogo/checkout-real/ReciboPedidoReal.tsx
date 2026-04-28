"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  resolverEstadoPedidoNoCargado,
  traducirLineaStock,
  traducirMensajeErrorPedido,
} from "@/contenido/pedidos/estadosComercialesPedido";
import {
  etiquetaProveedorPago,
  formatearFechaPedido,
  pedidoTieneCuentaCliente,
  resolverMensajeEstadoPedidoReal,
  resolverResumenRetornoPedidoReal,
  textoBotonPago,
} from "@/contenido/pedidos/reciboPedidoReal";
import { resolverTrackingVisibleCliente } from "@/contenido/pedidos/trackingVisible";
import { resolverPostventaDemoPedido } from "@/contenido/postventa/devolucionesDemo";
import { resolverEstadoVisiblePedidoCliente } from "@/infraestructura/api/estadoPedidoCliente";
import {
  LineaErrorStockPedido,
  PedidoCreado,
  RetornoPago,
  confirmarPagoSimuladoPedido,
  construirUrlDocumentoPedido,
  construirUrlRetornoPedido,
  iniciarPagoPedido,
  obtenerPedidoPublico,
  resolverEsPagoSimuladoLocal,
} from "@/infraestructura/api/pedidos";

type Props = { idPedidoRuta?: string; retornoPago?: RetornoPago };

export function ReciboPedidoReal({
  idPedidoRuta,
  retornoPago = null,
}: Props): JSX.Element {
  const [pedido, setPedido] = useState<PedidoCreado | null>(null);
  const [mensaje, setMensaje] = useState("Cargando pedido...");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [confirmandoPago, setConfirmandoPago] = useState(false);
  const [lineasStock, setLineasStock] = useState<LineaErrorStockPedido[]>([]);

  useEffect(() => {
    if (!idPedidoRuta) {
      setMensaje(traducirMensajeErrorPedido({ mensaje: "Falta el identificador del pedido." }));
      return;
    }
    obtenerPedidoPublico(idPedidoRuta).then((resultado) =>
      resultado.estado === "error"
        ? setMensaje(resultado.mensaje)
        : setPedido(resultado.pedido),
    );
  }, [idPedidoRuta]);

  const pagarAhora = async (): Promise<void> => {
    if (!pedido) return;
    setProcesandoPago(true);
    setLineasStock([]);
    const resultado = await iniciarPagoPedido(pedido.id_pedido);
    setProcesandoPago(false);
    if (resultado.estado === "error") {
      setLineasStock(resultado.codigo === "stock_no_disponible" ? resultado.lineas ?? [] : []);
      setMensaje(traducirMensajeErrorPedido({ codigo: resultado.codigo, mensaje: resultado.mensaje }));
      return;
    }
    if (resolverEsPagoSimuladoLocal(resultado.pago)) {
      setPedido((actual) =>
        actual
          ? { ...actual, pago: { ...actual.pago, ...resultado.pago }, estado_pago: resultado.pago.estado_pago }
          : actual,
      );
      setMensaje("Pago de prueba preparado. Confirma el pago para cerrar este pedido en el entorno local.");
      return;
    }
    if (resultado.pago.url_pago) window.location.assign(resultado.pago.url_pago);
  };

  const confirmarPagoLocal = async (): Promise<void> => {
    if (!pedido) return;
    setConfirmandoPago(true);
    setLineasStock([]);
    const resultado = await confirmarPagoSimuladoPedido(pedido.id_pedido);
    setConfirmandoPago(false);
    if (resultado.estado === "error") {
      setLineasStock(resultado.codigo === "stock_no_disponible" ? resultado.lineas ?? [] : []);
      setMensaje(traducirMensajeErrorPedido({ codigo: resultado.codigo, mensaje: resultado.mensaje }));
      return;
    }
    setPedido(resultado.pedido);
    window.location.assign(construirUrlRetornoPedido(resultado.pedido.id_pedido, "success"));
  };

  const resumenRetorno = useMemo(
    () => resolverResumenRetornoPedidoReal(pedido, retornoPago),
    [pedido, retornoPago],
  );

  if (!pedido && mensaje === "Cargando pedido...") {
    return <section className="bloque-home" aria-live="polite"><p role="status">{mensaje}</p></section>;
  }

  if (!pedido) {
    const estadoNoCargado = resolverEstadoPedidoNoCargado(mensaje);
    return (
      <section className="bloque-home" aria-live="polite" aria-labelledby="titulo-pedido-no-cargado">
        <h1 id="titulo-pedido-no-cargado">{estadoNoCargado.titulo}</h1>
        <p role="status">{estadoNoCargado.descripcion}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={estadoNoCargado.ctaPrincipal.href} className="boton boton--principal">
            {estadoNoCargado.ctaPrincipal.texto}
          </Link>
          <Link href={estadoNoCargado.ctaSecundaria.href} className="boton boton--secundario">
            {estadoNoCargado.ctaSecundaria.texto}
          </Link>
        </div>
      </section>
    );
  }

  const puedePagar = pedido.estado === "pendiente_pago" && pedido.estado_pago !== "pagado";
  const pagoSimuladoLocal = resolverEsPagoSimuladoLocal(pedido.pago);
  const puedeConfirmarPagoSimulado = puedePagar && pagoSimuladoLocal;
  const mensajeEstado = resolverMensajeEstadoPedidoReal(pedido);
  const estadoVisible = resolverEstadoVisiblePedidoCliente(pedido);
  const postventaDemo = resolverPostventaDemoPedido(pedido);
  const trackingVisible = resolverTrackingVisibleCliente(pedido.estado, pedido.expedicion);
  const tieneCuentaCliente = pedidoTieneCuentaCliente(pedido);

  return (
    <section className="bloque-home" aria-labelledby="titulo-recibo-real">
      <p>Detalle de pedido</p>
      <h1 id="titulo-recibo-real">Pedido {pedido.id_pedido}</h1>
      <p><strong>{resumenRetorno.titulo}</strong> {resumenRetorno.descripcion}</p>
      <p>Fecha del pedido: {formatearFechaPedido(pedido.fecha_creacion)}</p>
      <p>Estado del pedido: <strong>{mensajeEstado.titulo}</strong>.</p>
      <p>{mensajeEstado.descripcion}</p>
      <p>Estado del pago: <strong>{pedido.estado_pago}</strong>.</p>
      <p>Forma de pago: {etiquetaProveedorPago(pedido.pago.proveedor_pago, pagoSimuladoLocal)}.</p>
      {pedido.estado_pago === "pagado" && pagoSimuladoLocal ? (
        <p>Pago confirmado en entorno local.</p>
      ) : null}

      <DatosCliente pedido={pedido} />
      <TotalesPedido pedido={pedido} />
      <EstadoOperativo
        pedido={pedido}
        cancelacion={estadoVisible.cancelacion}
        reembolso={estadoVisible.reembolso}
        tracking={trackingVisible}
      />

      {puedePagar && !pagoSimuladoLocal ? (
        <button className="boton boton--principal" type="button" onClick={pagarAhora} disabled={procesandoPago} aria-busy={procesandoPago}>
          {procesandoPago ? "Preparando pago..." : textoBotonPago(pedido.estado_pago)}
        </button>
      ) : null}
      {puedeConfirmarPagoSimulado ? (
        <BloquePagoSimuladoLocal confirmar={confirmarPagoLocal} confirmando={confirmandoPago} />
      ) : null}
      {pedido.pago.url_pago && pedido.estado !== "pagado" && !pagoSimuladoLocal ? (
        <p><a href={pedido.pago.url_pago}>Continuar pago</a></p>
      ) : null}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href={construirUrlDocumentoPedido(pedido.id_pedido)} className="boton boton--principal">
          Descargar documento fiscal
        </a>
        {tieneCuentaCliente ? <Link href="/mi-cuenta" className="boton boton--secundario">Ver mi cuenta</Link> : null}
        <Link href="/colecciones" className="boton boton--secundario">Seguir comprando</Link>
        {pedido.estado !== "pendiente_pago" ? (
          <Link href={`#confirmacion-${pedido.id_pedido}`} className="boton boton--secundario">Ver seguimiento del pedido</Link>
        ) : null}
      </div>
      <p>Si el documento no se abre, vuelve a este pedido desde tu cuenta y reintentalo.</p>

      <div id={`confirmacion-${pedido.id_pedido}`}>
        <h2>Productos del pedido</h2>
        <ul>
          {pedido.lineas.map((linea) => (
            <li key={`${linea.id_producto}-${linea.slug_producto}`}>
              {linea.nombre_producto} - {linea.cantidad_comercial}
              {linea.unidad_comercial} - Subtotal {linea.subtotal} {linea.moneda} - Impuestos {linea.importe_impuestos} {linea.moneda}
            </li>
          ))}
        </ul>
      </div>

      {mensaje ? <p role="status" aria-live="polite">{mensaje}</p> : null}
      <ErroresStock lineas={lineasStock} />
    </section>
  );
}

function DatosCliente({ pedido }: { pedido: PedidoCreado }): JSX.Element {
  return (
    <>
      <p>Contacto: {pedido.cliente.nombre_contacto} - {pedido.cliente.email_contacto}</p>
      <p>Telefono: {pedido.cliente.telefono_contacto}</p>
      <p>
        Entrega: {pedido.direccion_entrega.nombre_destinatario}, {pedido.direccion_entrega.linea_1},{" "}
        {pedido.direccion_entrega.ciudad}, {pedido.direccion_entrega.codigo_postal}
      </p>
    </>
  );
}

function TotalesPedido({ pedido }: { pedido: PedidoCreado }): JSX.Element {
  return (
    <>
      <p>Subtotal: {pedido.subtotal} {pedido.moneda}</p>
      <p>Envio ({pedido.metodo_envio}): {pedido.importe_envio} {pedido.moneda}</p>
      <p>Base imponible: {pedido.base_imponible} {pedido.moneda}</p>
      <p>Impuestos (tipo {pedido.tipo_impositivo}): {pedido.importe_impuestos} {pedido.moneda}</p>
      <p>Total: {pedido.total} {pedido.moneda}</p>
    </>
  );
}

function EstadoOperativo({
  pedido,
  cancelacion,
  reembolso,
  tracking,
}: {
  pedido: PedidoCreado;
  cancelacion: { visible: boolean; titulo: string; descripcion: string };
  reembolso: { titulo: string; descripcion: string; fechaReembolso?: string | null };
  tracking: { mostrarTracking: boolean; titulo: string; descripcion: string };
}): JSX.Element {
  return (
    <>
      {cancelacion.visible ? <p><strong>{cancelacion.titulo}.</strong> {cancelacion.descripcion}</p> : null}
      <p><strong>{reembolso.titulo}.</strong> {reembolso.descripcion}</p>
      {reembolso.fechaReembolso ? <p>Fecha de reembolso: {reembolso.fechaReembolso}.</p> : null}
      <p>Aviso de pago: {pedido.email_post_pago_enviado ? "enviado" : "pendiente"}.</p>
      <p>Aviso de envio: {pedido.expedicion.email_envio_enviado ? "enviado" : "pendiente"}.</p>
      <p>Revision del pedido: {pedido.requiere_revision_manual ? "pendiente" : "sin incidencias pendientes"}.</p>
      {tracking.mostrarTracking ? <p><strong>{tracking.titulo}.</strong> {tracking.descripcion}</p> : null}
    </>
  );
}

function BloquePagoSimuladoLocal({
  confirmar,
  confirmando,
}: {
  confirmar: () => Promise<void>;
  confirmando: boolean;
}): JSX.Element {
  return (
    <div role="region" aria-labelledby="titulo-pago-simulado-local">
      <p id="titulo-pago-simulado-local"><strong>Pago de prueba en entorno local.</strong></p>
      <p>Este entorno confirma el pago de forma local. La conexion con pasarela real queda reservada para una fase posterior.</p>
      <button className="boton boton--principal" type="button" onClick={() => void confirmar()} disabled={confirmando} aria-busy={confirmando}>
        {confirmando ? "Confirmando pago..." : "Confirmar pago de prueba"}
      </button>
    </div>
  );
}

function ErroresStock({ lineas }: { lineas: LineaErrorStockPedido[] }): JSX.Element | null {
  if (lineas.length === 0) return null;
  return (
    <ul>
      {lineas.map((linea) => (
        <li key={`${linea.id_producto}-${linea.codigo}`}>
          {linea.nombre_producto}: {traducirLineaStock(linea)}
        </li>
      ))}
    </ul>
  );
}
