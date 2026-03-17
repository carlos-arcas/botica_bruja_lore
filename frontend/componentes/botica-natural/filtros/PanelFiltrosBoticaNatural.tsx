"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import { BENEFICIOS_BOTICA, FORMATOS_BOTICA, MODOS_USO_BOTICA } from "@/contenido/catalogo/taxonomiasBoticaNatural";
import {
  mapearRangoAPreciosBotica,
  OPCIONES_RANGO_PRECIO_BOTICA,
  resolverRangoPrecioBotica,
  type RangoPrecioBotica,
} from "@/contenido/catalogo/precioRangosBoticaNatural";

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
};

type EstadoAcordeones = Record<"beneficio" | "formato" | "modo_uso" | "precio", boolean>;
type EstadoMostrarMas = Record<"beneficio" | "formato" | "modo_uso" | "precio", boolean>;

const OPCION_TODOS = { valor: "", etiqueta: "Todos" };

export function PanelFiltrosBoticaNatural({ filtrosActivos }: Props): JSX.Element {
  const [seleccion, setSeleccion] = useState({
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

  const precioMapeado = mapearRangoAPreciosBotica(seleccion.precioRango);

  return (
    <form method="get" className="botica-natural__filtros-formulario">
      <p className="botica-natural__filtros-ayuda">Ajusta los filtros para encontrar tu mezcla ideal.</p>

      <AcordeonFiltro
        id="filtro-beneficio"
        titulo="Beneficio"
        expandido={acordeones.beneficio}
        contadorSeleccionados={calcularSeleccionados(seleccion.beneficio)}
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
        contadorSeleccionados={calcularSeleccionados(seleccion.formato)}
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
        contadorSeleccionados={calcularSeleccionados(seleccion.modo_uso)}
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
        contadorSeleccionados={calcularSeleccionados(seleccion.precioRango === "todos" ? "" : seleccion.precioRango)}
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

      <input type="hidden" name="precio_min" value={precioMapeado.precio_min} />
      <input type="hidden" name="precio_max" value={precioMapeado.precio_max} />
      <div className="botica-natural__acciones-filtros">
        <button type="submit" className="boton boton--secundario">Aplicar</button>
        <a href="/botica-natural" className="boton boton--secundario">Limpiar</a>
      </div>
    </form>
  );
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

function calcularSeleccionados(valor: string): number {
  return valor ? 1 : 0;
}
