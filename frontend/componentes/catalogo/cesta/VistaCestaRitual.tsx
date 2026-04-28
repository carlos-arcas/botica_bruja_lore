"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  convertirCestaALineasSeleccion,
  serializarItemsEncargo,
} from "@/contenido/catalogo/cestaRitual";
import {
  LineaClasificadaCestaReal,
  convertirCestaAItemsCheckoutReal,
  resolverResumenCestaReal,
} from "@/contenido/catalogo/cestaReal";
import { resolverResumenEconomicoSeleccion } from "@/contenido/catalogo/seleccionEncargo";
import { ListaLineasSeleccion } from "@/componentes/catalogo/seleccion/ListaLineasSeleccion";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function VistaCestaRitual(): JSX.Element {
  const { cesta, totalUnidades, cambiarCantidad, eliminar, limpiar } =
    useCarrito();
  const lineasSeleccion = useMemo(
    () => convertirCestaALineasSeleccion(cesta),
    [cesta],
  );
  const resumenCestaReal = useMemo(() => resolverResumenCestaReal(cesta), [cesta]);
  const resumenEconomico = useMemo(
    () => resolverResumenEconomicoSeleccion(lineasSeleccion),
    [lineasSeleccion],
  );
  const hrefCheckout = useMemo(
    () =>
      `/checkout?cesta=${serializarItemsEncargo(
        convertirCestaAItemsCheckoutReal(cesta),
      )}`,
    [cesta],
  );
  const estadosPorLinea = useMemo(
    () => construirIndiceEstados(resumenCestaReal),
    [resumenCestaReal],
  );

  if (lineasSeleccion.length === 0) {
    return (
      <section className="bloque-home">
        <h1>Mi seleccion</h1>
        <p>
          No has guardado piezas todavia. Cuando anadas productos o referencias
          editoriales, podras revisarlas aqui antes de finalizar la compra.
        </p>
        <Link href="/botica-natural" className="boton boton--principal">
          Ir a la tienda
        </Link>
      </section>
    );
  }

  return (
    <section className="bloque-home" aria-labelledby="titulo-mi-seleccion">
      <h1 id="titulo-mi-seleccion">Mi seleccion</h1>
      <p>
        Revisa cada linea, ajusta cantidades y pasa al checkout real solo con
        productos comprables. Las piezas artesanales se tratan como consulta.
      </p>

      <ListaLineasSeleccion
        items={lineasSeleccion.map((linea) => ({
          linea,
          estado: resolverEstadoVisualCestaReal(estadosPorLinea.get(linea.id_linea)),
        }))}
        editable
        onCambiarCantidad={cambiarCantidad}
        onEliminar={eliminar}
      />

      {hayLineasNoComprables(resumenCestaReal) ? (
        <article className={estilos.resumen} role="alert" id="aviso-cesta-bloqueada">
          <p>
            <strong>Hay lineas que no pueden entrar en el checkout real.</strong>
          </p>
          <p>
            Elimina las lineas bloqueadas o envialas como consulta personalizada
            antes de finalizar la compra.
          </p>
        </article>
      ) : null}

      <article className={estilos.resumen}>
        <p>
          <strong>Total de unidades:</strong> {totalUnidades}
        </p>
        <p>
          <strong>{resumenEconomico.etiqueta}:</strong>{" "}
          {resumenEconomico.totalVisible ?? "A revisar"}
        </p>
        <p>{resumenEconomico.detalle}</p>
      </article>

      <div className={estilos.accionesCesta}>
        {resumenCestaReal.puedeFinalizarCompra ? (
          <Link href={hrefCheckout} className="boton boton--principal">
            Finalizar compra
          </Link>
        ) : (
          <button
            type="button"
            className="boton boton--principal"
            disabled
            aria-disabled="true"
            aria-describedby="aviso-cesta-bloqueada"
          >
            Revisa la seleccion para continuar
          </button>
        )}
        {resumenCestaReal.lineasConsulta.length > 0 ? (
          <Link href="/encargo?origen=seleccion" className="boton boton--secundario">
            Pedir orientacion artesanal
          </Link>
        ) : null}
        <button
          type="button"
          className="boton boton--secundario"
          onClick={limpiar}
        >
          Vaciar seleccion
        </button>
        <Link href="/botica-natural" className="boton boton--secundario">
          Seguir explorando
        </Link>
      </div>
    </section>
  );
}

type ResumenVistaCestaReal = ReturnType<typeof resolverResumenCestaReal>;

function construirIndiceEstados(
  resumen: ResumenVistaCestaReal,
): Map<string, LineaClasificadaCestaReal> {
  return new Map(
    [
      ...resumen.lineasComprables,
      ...resumen.lineasConsulta,
      ...resumen.lineasInvalidas,
      ...resumen.lineasSinStock,
    ].map((linea) => [linea.id_linea, linea]),
  );
}

function hayLineasNoComprables(resumen: ResumenVistaCestaReal): boolean {
  return (
    resumen.lineasConsulta.length > 0 ||
    resumen.lineasInvalidas.length > 0 ||
    resumen.lineasSinStock.length > 0
  );
}

function resolverEstadoVisualCestaReal(linea?: LineaClasificadaCestaReal) {
  if (!linea) return undefined;
  if (linea.estado_cesta_real === "comprable") {
    return {
      etiqueta: "Lista para compra",
      descripcion: linea.motivo,
      tono: "convertible" as const,
    };
  }
  if (linea.estado_cesta_real === "requiere_consulta") {
    return {
      etiqueta: "Consulta personalizada",
      descripcion: linea.motivo,
      tono: "bloqueada" as const,
    };
  }
  if (linea.estado_cesta_real === "sin_stock") {
    return {
      etiqueta: "Sin stock",
      descripcion: linea.motivo,
      tono: "bloqueada" as const,
    };
  }
  return {
    etiqueta: "No convertible",
    descripcion: linea.motivo,
    tono: "bloqueada" as const,
  };
}
