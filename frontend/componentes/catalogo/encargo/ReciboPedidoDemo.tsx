"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { resolverIdPedidoDesdeRuta } from "@/contenido/catalogo/postCheckoutDemo";
import { leerSesionCuentaDemo } from "@/contenido/cuenta_demo/estadoCuentaDemo";
import {
  leerPedidoRecienteDemo,
  pedidoRecientePerteneceASesion,
} from "@/contenido/cuenta_demo/pedidoRecienteDemo";
import {
  EmailDemoPedido,
  obtenerEmailDemoPedidoPublico,
  obtenerPedidoDemoPublico,
  PedidoDemoCreado,
} from "@/infraestructura/api/pedidosDemo";

import estilos from "./flujoEncargoConsulta.module.css";

type Props = {
  idPedidoRuta?: string;
};

export function ReciboPedidoDemo({ idPedidoRuta }: Props): JSX.Element {
  const idPedido = resolverIdPedidoDesdeRuta(idPedidoRuta);
  const [estado, setEstado] = useState<"cargando" | "error" | "ok" | "vacio">(idPedido ? "cargando" : "vacio");
  const [mensaje, setMensaje] = useState<string>("");
  const [pedido, setPedido] = useState<PedidoDemoCreado | null>(null);
  const [emailDemo, setEmailDemo] = useState<EmailDemoPedido | null>(null);
  const [haySesionDemo, setHaySesionDemo] = useState(false);
  const [mostrarCtaCuenta, setMostrarCtaCuenta] = useState(false);
  const textoCtaCuenta = useMemo(
    () => (idPedido ? `Ver este pedido en mi cuenta demo` : "Ir a mi cuenta demo"),
    [idPedido],
  );

  useEffect(() => {
    const cuentaDemo = leerSesionCuentaDemo();
    const pedidoReciente = leerPedidoRecienteDemo();
    setHaySesionDemo(Boolean(cuentaDemo));
    setMostrarCtaCuenta(pedidoRecientePerteneceASesion(pedidoReciente, cuentaDemo, idPedido));
  }, [idPedido]);

  useEffect(() => {
    if (!idPedido) {
      return;
    }

    let activo = true;
    setEstado("cargando");
    setMensaje("");
    setPedido(null);
    setEmailDemo(null);

    obtenerPedidoDemoPublico(idPedido).then((resultado) => {
      if (!activo) {
        return;
      }

      if (resultado.estado === "error") {
        setEstado("error");
        setMensaje(resultado.mensaje);
        return;
      }

      setEstado("ok");
      setPedido(resultado.pedido);
      obtenerEmailDemoPedidoPublico(idPedido).then((respuestaEmail) => {
        if (!activo || respuestaEmail.estado === "error") {
          return;
        }
        setEmailDemo(respuestaEmail.emailDemo);
      });
    });

    return () => {
      activo = false;
    };
  }, [idPedido]);

  return (
    <section className="bloque-home" aria-labelledby="titulo-recibo-demo">
      <p className={estilos.eyebrow}>Checkout demo · confirmación final</p>
      <h1 id="titulo-recibo-demo">Recibo de pedido demo</h1>

      {estado === "vacio" && <EstadoVacio />}
      {estado === "cargando" && <EstadoCarga />}
      {estado === "error" && <EstadoError mensaje={mensaje} />}
      {estado === "ok" && pedido && <DetallePedido pedido={pedido} emailDemo={emailDemo} />}

      {mostrarCtaCuenta && (
        <article className={estilos.resumenFinal}>
          <p className={estilos.estado}>Tu cuenta demo ya puede continuar este pedido desde el historial.</p>
          <Link href="/cuenta-demo" className="boton boton--principal">{textoCtaCuenta}</Link>
        </article>
      )}

      {!mostrarCtaCuenta && haySesionDemo && (
        <article className={estilos.resumenFinal}>
          <p className={estilos.estado}>Tu sesión demo sigue activa para revisar otros pedidos y continuidad de compra.</p>
          <Link href="/cuenta-demo" className="boton boton--secundario">Ir a mi cuenta demo</Link>
        </article>
      )}

      <div className={estilos.accionesSecundarias}>
        <Link href="/colecciones" className="boton boton--secundario">Volver al catálogo</Link>
        <Link href="/encargo" className="boton boton--secundario">Crear otro encargo demo</Link>
      </div>
    </section>
  );
}

function EstadoVacio(): JSX.Element {
  return (
    <article className={estilos.resumenFinal}>
      <p>No encontramos un id de pedido demo válido en la URL.</p>
      <p>Vuelve a <Link href="/encargo">/encargo</Link> para enviar un pedido demo nuevo.</p>
    </article>
  );
}

function EstadoCarga(): JSX.Element {
  return (
    <article className={estilos.resumenFinal} aria-live="polite">
      <p>Cargando confirmación del pedido demo...</p>
    </article>
  );
}

type EstadoErrorProps = { mensaje: string };

function EstadoError({ mensaje }: EstadoErrorProps): JSX.Element {
  return (
    <article className={estilos.resumenFinal} aria-live="polite">
      <p className={estilos.error}>{mensaje}</p>
      <p>Esta compra no realizó cobro real. Puedes reintentar o crear otro pedido demo.</p>
    </article>
  );
}

type DetallePedidoProps = {
  pedido: PedidoDemoCreado;
  emailDemo: EmailDemoPedido | null;
};

function DetallePedido({ pedido, emailDemo }: DetallePedidoProps): JSX.Element {
  return (
    <article className={estilos.resumenFinal} aria-live="polite">
      <p className={estilos.estado}>Pedido demo confirmado</p>
      <p><strong>ID:</strong> {pedido.id_pedido}</p>
      <p><strong>Estado:</strong> {pedido.estado}</p>
      <p><strong>Email:</strong> {pedido.email}</p>
      <p><strong>Canal:</strong> {pedido.canal}</p>
      <p>
        <strong>Resumen:</strong> {pedido.resumen.cantidad_total_items} unidades · Subtotal demo {pedido.resumen.subtotal_demo} €.
      </p>
      {pedido.lineas && pedido.lineas.length > 0 && (
        <ul>
          {pedido.lineas.map((linea) => (
            <li key={`${linea.id_producto}-${linea.slug_producto}`}>
              {linea.nombre_producto} · {linea.cantidad} u · {linea.subtotal_demo} €
            </li>
          ))}
        </ul>
      )}
      <p>Entorno demo: no se ha procesado ningún pago real.</p>

      {emailDemo && (
        <div>
          <p><strong>Email demo:</strong> {emailDemo.asunto}</p>
          <p>Simulación de email activa (sin envío real).</p>
          <pre>{emailDemo.cuerpo_texto}</pre>
        </div>
      )}
    </article>
  );
}
