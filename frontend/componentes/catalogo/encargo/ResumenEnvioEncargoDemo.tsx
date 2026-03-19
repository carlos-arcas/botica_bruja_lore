"use client";

import Link from "next/link";

import { PedidoDemoCreado } from "@/infraestructura/api/pedidosDemo";
import { TipoCanalContacto } from "@/contenido/catalogo/canalContactoPublico";

import estilos from "./flujoEncargoConsulta.module.css";

type CanalResumen = {
  tipo: TipoCanalContacto;
  etiqueta: string;
};

type Props = {
  estadoCanalDescripcion: string;
  estadoCanalDisponible: boolean;
  canales: CanalResumen[];
  construirHrefCanal: (tipo: TipoCanalContacto) => string | null;
  onIntentoCanal: (tipo: TipoCanalContacto) => void;
  onCopiarResumen: () => void;
  ctaSecundaria: string;
  mensajeCanal: string;
  mensajeCopia: string;
  resumen: string;
  estadoEnvio: "idle" | "enviando" | "error" | "ok";
  pedidoCreado: PedidoDemoCreado | null;
  productoSlug?: string;
};

export function ResumenEnvioEncargoDemo(props: Props): JSX.Element {
  const { estadoEnvio, pedidoCreado, resumen, productoSlug } = props;

  return (
    <>
      {estadoEnvio === "ok" && pedidoCreado && (
        <article className={estilos.resumenFinal} aria-live="polite">
          <h2>Pedido demo creado</h2>
          <p className={estilos.estado}>ID: {pedidoCreado.id_pedido}</p>
          <p>Estado inicial: {pedidoCreado.estado}</p>
          <p>Resumen inmediato: {pedidoCreado.resumen.cantidad_total_items} unidades · Subtotal demo {pedidoCreado.resumen.subtotal_demo} €.</p>
        </article>
      )}

      {resumen && (
        <article className={estilos.resumenFinal} aria-live="polite">
          <h2>Resumen listo</h2>
          <p className={estilos.estadoCanal}>{props.estadoCanalDescripcion}</p>
          <p className={estilos.disponibilidad}>{props.estadoCanalDisponible ? "Canal disponible" : "Canal no disponible"}</p>
          <pre>{resumen}</pre>
          <div className={estilos.ctasResumen}>
            {props.canales.map((canal) => renderCanal(canal, props))}
            <button type="button" className="boton boton--secundario" onClick={props.onCopiarResumen}>
              {props.ctaSecundaria}
            </button>
          </div>
          {props.mensajeCanal && <p className={estilos.error}>{props.mensajeCanal}</p>}
          {props.mensajeCopia && <p className={estilos.estado}>{props.mensajeCopia}</p>}
        </article>
      )}

      <div className={estilos.accionesSecundarias}>
        <Link href="/colecciones" className="boton boton--secundario">Volver al catálogo</Link>
        {productoSlug && <Link href={`/colecciones/${productoSlug}`} className="boton boton--secundario">Regresar a la ficha</Link>}
      </div>
    </>
  );
}

function renderCanal(canal: CanalResumen, props: Props): JSX.Element {
  const href = props.construirHrefCanal(canal.tipo);
  if (!href) {
    return (
      <button key={canal.tipo} type="button" className="boton boton--principal" onClick={() => props.onIntentoCanal(canal.tipo)}>
        {canal.etiqueta}
      </button>
    );
  }

  return (
    <a key={canal.tipo} className="boton boton--principal" href={href} target="_blank" rel="noreferrer">
      {canal.etiqueta}
    </a>
  );
}
