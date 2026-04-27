"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import {
  construirQueryFiltrosBotica,
  contarFiltroActivo,
  resolverFiltrosBoticaDesdeSearchParams,
  type FiltrosBotica,
} from "@/contenido/catalogo/filtrosBoticaNatural";
import { OPCIONES_RANGO_PRECIO_BOTICA, resolverRangoPrecioBotica, type RangoPrecioBotica } from "@/contenido/catalogo/precioRangosBoticaNatural";
import { BENEFICIOS_BOTICA, FORMATOS_BOTICA, MODOS_USO_BOTICA } from "@/contenido/catalogo/taxonomiasBoticaNatural";

import { AcordeonFiltro } from "./AcordeonFiltro";
import { ListaTogglesFiltro } from "./ListaTogglesFiltro";

type FiltrosActivos = {
  beneficio: string;
  formato: string;
  modo_uso: string;
  precio_min: string;
  precio_max: string;
};

type Props = {
  filtrosActivos: FiltrosActivos;
  rutaSeccion?: string;
  textoAyuda?: string;
};

type EstadoAcordeones = Record<"beneficio" | "formato" | "modo_uso" | "precio", boolean>;
type EstadoMostrarMas = Record<"beneficio" | "formato" | "modo_uso" | "precio", boolean>;
type SeleccionFiltros = {
  beneficio: string;
  formato: string;
  modo_uso: string;
  precioRango: RangoPrecioBotica;
};

const OPCION_TODOS = { valor: "", etiqueta: "Todos" };

export function PanelFiltrosBoticaNatural({
  filtrosActivos,
  rutaSeccion = "/botica-natural",
  textoAyuda = "Ajusta los filtros para encontrar tu mezcla ideal.",
}: Props): JSX.Element {
  const [seleccion, setSeleccion] = useState<SeleccionFiltros>({
    beneficio: filtrosActivos.beneficio,
    formato: filtrosActivos.formato,
    modo_uso: filtrosActivos.modo_uso,
    precioRango: resolverRangoPrecioBotica(filtrosActivos.precio_min, filtrosActivos.precio_max),
  });

  const [acordeones, setAcordeones] = useState<EstadoAcordeones>({
    beneficio: false,
    formato: false,
    modo_uso: false,
    precio: false,
  });

  const [mostrarMas, setMostrarMas] = useState<EstadoMostrarMas>({
    beneficio: false,
    formato: false,
    modo_uso: false,
    precio: false,
  });

  const hrefLimpiar = construirHrefLimpiar(rutaSeccion);
  const hrefAplicar = construirHrefAplicar(seleccion, rutaSeccion);

  return (
    <form action={rutaSeccion} method="get" className="botica-natural__filtros-formulario">
      <p className="botica-natural__filtros-ayuda">{textoAyuda}</p>

      <AcordeonFiltro
        id="filtro-beneficio"
        titulo="Beneficio"
        expandido={acordeones.beneficio}
        contadorSeleccionados={contarFiltroActivo(seleccion.beneficio)}
        onToggle={() => alternarAcordeon(setAcordeones, "beneficio")}
      >
        <ListaTogglesFiltro
          nombreGrupo="beneficio"
          opciones={[OPCION_TODOS, ...BENEFICIOS_BOTICA]}
          valorActivo={seleccion.beneficio}
          mostrarTodas={mostrarMas.beneficio}
          onCambiarMostrarTodas={() => alternarMostrarMas(setMostrarMas, "beneficio")}
          onSeleccionar={(valor) => setSeleccion((previo) => ({ ...previo, beneficio: valor }))}
        />
      </AcordeonFiltro>

      <AcordeonFiltro
        id="filtro-formato"
        titulo="Formato"
        expandido={acordeones.formato}
        contadorSeleccionados={contarFiltroActivo(seleccion.formato)}
        onToggle={() => alternarAcordeon(setAcordeones, "formato")}
      >
        <ListaTogglesFiltro
          nombreGrupo="formato"
          opciones={[OPCION_TODOS, ...FORMATOS_BOTICA]}
          valorActivo={seleccion.formato}
          mostrarTodas={mostrarMas.formato}
          onCambiarMostrarTodas={() => alternarMostrarMas(setMostrarMas, "formato")}
          onSeleccionar={(valor) => setSeleccion((previo) => ({ ...previo, formato: valor }))}
        />
      </AcordeonFiltro>

      <AcordeonFiltro
        id="filtro-modo-uso"
        titulo="Modo de uso"
        expandido={acordeones.modo_uso}
        contadorSeleccionados={contarFiltroActivo(seleccion.modo_uso)}
        onToggle={() => alternarAcordeon(setAcordeones, "modo_uso")}
      >
        <ListaTogglesFiltro
          nombreGrupo="modo_uso"
          opciones={[OPCION_TODOS, ...MODOS_USO_BOTICA]}
          valorActivo={seleccion.modo_uso}
          mostrarTodas={mostrarMas.modo_uso}
          onCambiarMostrarTodas={() => alternarMostrarMas(setMostrarMas, "modo_uso")}
          onSeleccionar={(valor) => setSeleccion((previo) => ({ ...previo, modo_uso: valor }))}
        />
      </AcordeonFiltro>

      <AcordeonFiltro
        id="filtro-precio"
        titulo="Precio"
        expandido={acordeones.precio}
        contadorSeleccionados={contarFiltroActivo(seleccion.precioRango)}
        onToggle={() => alternarAcordeon(setAcordeones, "precio")}
      >
        <ListaTogglesFiltro
          nombreGrupo="precio_rango"
          opciones={OPCIONES_RANGO_PRECIO_BOTICA}
          valorActivo={seleccion.precioRango}
          mostrarTodas={mostrarMas.precio}
          onCambiarMostrarTodas={() => alternarMostrarMas(setMostrarMas, "precio")}
          onSeleccionar={(valor) => setSeleccion((previo) => ({ ...previo, precioRango: valor as RangoPrecioBotica }))}
        />
      </AcordeonFiltro>

      <div className="botica-natural__acciones-filtros">
        <button type="submit" formAction={hrefAplicar} className="boton boton--secundario">Aplicar</button>
        <a href={hrefLimpiar} className="boton boton--secundario">Limpiar</a>
      </div>
    </form>
  );
}

function construirHrefAplicar(seleccion: SeleccionFiltros, rutaSeccion: string): string {
  const query = construirQueryFiltrosBotica(seleccionAFiltrosBotica(seleccion));
  const queryString = query.toString();
  return queryString ? `${rutaSeccion}?${queryString}` : rutaSeccion;
}

function construirHrefLimpiar(rutaSeccion: string): string {
  const query = construirQueryFiltrosBotica(
    resolverFiltrosBoticaDesdeSearchParams({ beneficio: "todos", formato: "todos", modo_uso: "todos", precio_rango: "todos" }),
  );
  const queryString = query.toString();
  return queryString ? `${rutaSeccion}?${queryString}` : rutaSeccion;
}

function seleccionAFiltrosBotica(seleccion: SeleccionFiltros): FiltrosBotica {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    beneficio: seleccion.beneficio,
    formato: seleccion.formato,
    modo_uso: seleccion.modo_uso,
    precio_rango: seleccion.precioRango,
  });

  return {
    ...filtros,
    precio_rango: seleccion.precioRango,
  };
}

function alternarAcordeon(
  setEstado: Dispatch<SetStateAction<EstadoAcordeones>>,
  clave: keyof EstadoAcordeones,
): void {
  setEstado((previo) => ({ ...previo, [clave]: !previo[clave] }));
}

function alternarMostrarMas(
  setEstado: Dispatch<SetStateAction<EstadoMostrarMas>>,
  clave: keyof EstadoMostrarMas,
): void {
  setEstado((previo) => ({ ...previo, [clave]: !previo[clave] }));
}
