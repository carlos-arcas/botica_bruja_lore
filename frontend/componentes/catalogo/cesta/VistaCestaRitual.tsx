"use client";

import Link from "next/link";
import { useMemo } from "react";

import { convertirCestaALineasSeleccion } from "@/contenido/catalogo/cestaRitual";
import { resolverResumenEconomicoSeleccion } from "@/contenido/catalogo/seleccionEncargo";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function VistaCestaRitual(): JSX.Element {
  const { cesta, totalUnidades, cambiarCantidad, eliminar, limpiar } = useCarrito();
  const lineasSeleccion = useMemo(() => convertirCestaALineasSeleccion(cesta), [cesta]);
  const resumenEconomico = useMemo(() => resolverResumenEconomicoSeleccion(lineasSeleccion), [lineasSeleccion]);

  if (lineasSeleccion.length === 0) {
    return (
      <section className="bloque-home">
        <h1>Mi selección</h1>
        <p>No has guardado piezas todavía. Cuando añadas productos o referencias editoriales, podrás revisarlas aquí antes de solicitar el encargo.</p>
        <Link href="/colecciones" className="boton boton--principal">Explorar colecciones</Link>
      </section>
    );
  }

  return (
    <section className="bloque-home" aria-labelledby="titulo-mi-seleccion">
      <h1 id="titulo-mi-seleccion">Mi selección</h1>
      <p>Revisa cada línea, ajusta cantidades y pasa a la solicitud artesanal con una selección clara en lugar de un checkout ficticio.</p>

      <ul className={estilos.listado}>
        {lineasSeleccion.map((linea) => (
          <li key={linea.id_linea} className={estilos.linea}>
            <div className={estilos.lineaCabecera}>
              <div>
                <h2>{linea.nombre}</h2>
                <p>{etiquetaTipoLinea(linea.tipo_linea)}</p>
              </div>
              <strong>{linea.referencia_economica.valor === null ? "Sin referencia" : linea.referencia_economica.etiqueta}</strong>
            </div>
            <p>{linea.notas_origen ?? "Sin contexto editorial adicional."}</p>
            {linea.formato && <p><strong>Formato:</strong> {linea.formato}</p>}
            <div className={estilos.controlesLinea}>
              <label>
                Cantidad
                <input type="number" min={1} max={12} value={linea.cantidad} onChange={(event) => cambiarCantidad(linea.slug ?? linea.id_linea, Number(event.target.value))} />
              </label>
              <button type="button" className="boton boton--secundario" onClick={() => eliminar(linea.slug ?? linea.id_linea)}>
                Quitar línea
              </button>
              {linea.slug && <Link href={`/colecciones/${linea.slug}`} className="boton boton--secundario">Ver ficha</Link>}
            </div>
          </li>
        ))}
      </ul>

      <article className={estilos.resumen}>
        <p><strong>Total de unidades:</strong> {totalUnidades}</p>
        <p><strong>{resumenEconomico.etiqueta}:</strong> {resumenEconomico.totalVisible ?? "A revisar"}</p>
        <p>{resumenEconomico.detalle}</p>
      </article>

      <div className={estilos.accionesCesta}>
        <Link href="/encargo?origen=seleccion" className="boton boton--principal">Continuar con la solicitud de encargo</Link>
        <button type="button" className="boton boton--secundario" onClick={limpiar}>Vaciar selección</button>
        <Link href="/colecciones" className="boton boton--secundario">Seguir explorando</Link>
      </div>
    </section>
  );
}

function etiquetaTipoLinea(tipo: "catalogo" | "fuera_catalogo" | "sugerencia_editorial"): string {
  if (tipo === "catalogo") {
    return "Línea de catálogo";
  }
  if (tipo === "fuera_catalogo") {
    return "Pieza fuera de catálogo";
  }
  return "Sugerencia editorial";
}
