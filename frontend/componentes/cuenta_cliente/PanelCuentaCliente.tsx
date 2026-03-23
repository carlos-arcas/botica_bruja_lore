"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CuentaCliente,
  EstadoVerificacionEmail,
  PedidoCuentaCliente,
  obtenerEstadoVerificacionEmail,
  obtenerPedidosCuentaCliente,
  obtenerSesionCuentaCliente,
  logoutCuentaCliente,
  reenviarVerificacionEmail,
} from "@/infraestructura/api/cuentasCliente";
import {
  describirEstadoVerificacion,
  describirResultadoReenvio,
  resolverEstadoVistaVerificacion,
} from "@/contenido/cuenta_cliente/verificacionEmail";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";

type Props = {
  vista: "resumen" | "pedidos";
  mensajeAlta?: string | null;
};

export function PanelCuentaCliente({ vista, mensajeAlta = null }: Props): JSX.Element {
  const [cuenta, setCuenta] = useState<CuentaCliente | null>(null);
  const [verificacion, setVerificacion] = useState<EstadoVerificacionEmail | null>(null);
  const [pedidos, setPedidos] = useState<PedidoCuentaCliente[]>([]);
  const [mensaje, setMensaje] = useState("Cargando cuenta real...");
  const [mensajeVerificacion, setMensajeVerificacion] = useState(mensajeAlta ?? "");
  const [reenviando, setReenviando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMensajeVerificacion(mensajeAlta ?? "");
  }, [mensajeAlta]);

  const cargar = useCallback(async (): Promise<void> => {
    const sesion = await obtenerSesionCuentaCliente();
    if (!sesion.autenticado || !sesion.cuenta) {
      router.push(RUTAS_CUENTA_CLIENTE.acceso);
      return;
    }
    setCuenta(sesion.cuenta);
    const [estadoVerificacion, listado] = await Promise.all([
      obtenerEstadoVerificacionEmail(),
      obtenerPedidosCuentaCliente(),
    ]);
    setVerificacion(estadoVerificacion.estado);
    setPedidos(listado.pedidos);
    setMensaje("");
  }, [router]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const salir = async (): Promise<void> => {
    await logoutCuentaCliente();
    router.push(RUTAS_CUENTA_CLIENTE.acceso);
    router.refresh();
  };

  const reenviar = async (): Promise<void> => {
    if (!cuenta) return;
    setReenviando(true);
    const resultado = await reenviarVerificacionEmail({ email: cuenta.email });
    setReenviando(false);
    if (resultado.estado === "error") {
      setMensajeVerificacion(resultado.mensaje);
      return;
    }
    setVerificacion(resultado.verificacion);
    setMensajeVerificacion(describirResultadoReenvio(resultado.verificacion));
  };

  if (!cuenta) return <section className="bloque-home"><p>{mensaje}</p></section>;
  const estado = verificacion ?? { email: cuenta.email, email_verificado: cuenta.email_verificado, expira_en: null, reenviada: false };
  const vistaVerificacion = resolverEstadoVistaVerificacion(estado);
  return (
    <section className="bloque-home">
      <p>Cuenta real canónica · legado demo separado</p>
      <h1>{vista === "pedidos" ? "Mis pedidos" : "Mi cuenta"}</h1>
      <p>{cuenta.nombre_visible} · {cuenta.email}</p>
      <p>{describirEstadoVerificacion(estado)}.</p>
      {mensajeVerificacion && <p>{mensajeVerificacion}</p>}
      {vistaVerificacion === "pendiente" && (
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          <p>Necesitamos confirmar tu dirección antes de dar la identidad real por cerrada.</p>
          <button className="boton boton--principal" type="button" onClick={reenviar} disabled={reenviando}>
            {reenviando ? "Reenviando..." : "Reenviar email de verificación"}
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.cuenta}>Resumen</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.pedidos}>Mis pedidos</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.direcciones}>Mis direcciones</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.legadoDemo}>Legado demo</Link>
        <button className="boton boton--principal" type="button" onClick={salir}>Cerrar sesión</button>
      </div>
      {vista === "resumen" ? (
        <ul>
          <li>ID usuario: {cuenta.id_usuario}</li>
          <li>Cuenta activa: {cuenta.activo ? "sí" : "no"}</li>
          <li>Estado email: {vistaVerificacion}</li>
          <li>Pedidos reales asociados: {pedidos.length}</li>
          <li>Libreta de direcciones: disponible desde una vista dedicada</li>
        </ul>
      ) : (
        <ul>
          {pedidos.map((pedido) => (
            <li key={pedido.id_pedido}>
              <Link href={`/pedido/${pedido.id_pedido}`}>{pedido.id_pedido}</Link> · {pedido.estado} · {pedido.subtotal} {pedido.moneda}
              {pedido.expedicion?.codigo_seguimiento ? ` · tracking ${pedido.expedicion.codigo_seguimiento}` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
