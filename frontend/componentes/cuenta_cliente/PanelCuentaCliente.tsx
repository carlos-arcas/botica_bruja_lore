"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { obtenerPedidosCuentaCliente, obtenerSesionCuentaCliente, logoutCuentaCliente, CuentaCliente, PedidoCuentaCliente } from "@/infraestructura/api/cuentasCliente";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";

type Props = { vista: "resumen" | "pedidos" };

export function PanelCuentaCliente({ vista }: Props): JSX.Element {
  const [cuenta, setCuenta] = useState<CuentaCliente | null>(null);
  const [pedidos, setPedidos] = useState<PedidoCuentaCliente[]>([]);
  const [mensaje, setMensaje] = useState("Cargando cuenta real...");
  const router = useRouter();

  useEffect(() => {
    void cargar();
  }, []);

  const cargar = async (): Promise<void> => {
    const sesion = await obtenerSesionCuentaCliente();
    if (!sesion.autenticado || !sesion.cuenta) {
      router.push(RUTAS_CUENTA_CLIENTE.acceso);
      return;
    }
    setCuenta(sesion.cuenta);
    const listado = await obtenerPedidosCuentaCliente();
    setPedidos(listado.pedidos);
    setMensaje("");
  };

  const salir = async (): Promise<void> => {
    await logoutCuentaCliente();
    router.push(RUTAS_CUENTA_CLIENTE.acceso);
    router.refresh();
  };

  if (!cuenta) return <section className="bloque-home"><p>{mensaje}</p></section>;
  return (
    <section className="bloque-home">
      <p>Cuenta real canónica · legado demo separado</p>
      <h1>{vista === "pedidos" ? "Mis pedidos" : "Mi cuenta"}</h1>
      <p>{cuenta.nombre_visible} · {cuenta.email}</p>
      <p>Email verificado: {cuenta.email_verificado ? "sí" : "pendiente en v1"}.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.cuenta}>Resumen</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.pedidos}>Mis pedidos</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.legadoDemo}>Legado demo</Link>
        <button className="boton boton--principal" type="button" onClick={salir}>Cerrar sesión</button>
      </div>
      {vista === "resumen" ? (
        <ul>
          <li>ID usuario: {cuenta.id_usuario}</li>
          <li>Cuenta activa: {cuenta.activo ? "sí" : "no"}</li>
          <li>Pedidos reales asociados: {pedidos.length}</li>
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
