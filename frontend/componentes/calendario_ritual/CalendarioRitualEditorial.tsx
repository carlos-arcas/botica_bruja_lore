"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  ResultadoCalendarioRitual,
  consultarCalendarioRitualPorFecha,
} from "@/infraestructura/api/calendarioRitual";

type EstadoConsulta =
  | { estado: "idle" }
  | { estado: "cargando"; fecha: string }
  | { estado: "resultado"; fecha: string; resultado: ResultadoCalendarioRitual };

export function CalendarioRitualEditorial(): JSX.Element {
  const [fechaConsulta, setFechaConsulta] = useState("");
  const [estadoConsulta, setEstadoConsulta] = useState<EstadoConsulta>({ estado: "idle" });

  async function manejarConsulta(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const fecha = fechaConsulta.trim();
    if (fecha.length === 0) {
      setEstadoConsulta({
        estado: "resultado",
        fecha,
        resultado: {
          estado: "error",
          mensaje: "Selecciona una fecha antes de consultar el calendario ritual.",
          codigo: 400,
        },
      });
      return;
    }

    setEstadoConsulta({ estado: "cargando", fecha });
    const resultado = await consultarCalendarioRitualPorFecha(fecha);
    setEstadoConsulta({ estado: "resultado", fecha, resultado });
  }

  return (
    <section className="bloque-home">
      <h2>Consulta temporal del calendario ritual</h2>
      <p>
        Esta capa editorial te permite revisar qué rituales están activos para una fecha concreta
        según las reglas publicadas del calendario.
      </p>

      <form onSubmit={manejarConsulta} className="calendario-ritual__formulario">
        <label htmlFor="fecha-calendario-ritual">Fecha de consulta</label>
        <input
          id="fecha-calendario-ritual"
          name="fecha"
          type="date"
          value={fechaConsulta}
          onChange={(event) => setFechaConsulta(event.target.value)}
          required
        />
        <button type="submit" className="boton boton--principal">
          Consultar rituales
        </button>
      </form>

      {estadoConsulta.estado === "cargando" ? (
        <p className="calendario-ritual__estado">Consultando calendario para {estadoConsulta.fecha}…</p>
      ) : null}

      {estadoConsulta.estado === "resultado" ? (
        <ResultadoConsultaCalendario resultado={estadoConsulta.resultado} />
      ) : null}
    </section>
  );
}

function ResultadoConsultaCalendario({ resultado }: { resultado: ResultadoCalendarioRitual }): JSX.Element {
  if (resultado.estado === "error") {
    return <p className="calendario-ritual__estado calendario-ritual__estado--error">{resultado.mensaje}</p>;
  }

  if (resultado.rituales.length === 0) {
    return (
      <p className="calendario-ritual__estado calendario-ritual__estado--vacio">
        No hay rituales activos para {resultado.fechaConsulta}. Puedes probar otra fecha para ampliar la
        exploración editorial.
      </p>
    );
  }

  return (
    <div className="calendario-ritual__resultado">
      <p className="calendario-ritual__estado calendario-ritual__estado--ok">
        Rituales activos para {resultado.fechaConsulta}: {resultado.rituales.length}
      </p>
      <ul className="rejilla-plantas rejilla-plantas--listado">
        {resultado.rituales.map((ritual) => (
          <li key={`${ritual.slug}-${ritual.nombre_regla}`} className="tarjeta-ritual">
            <h3>{ritual.nombre}</h3>
            <p>{ritual.contexto_breve}</p>
            <p className="meta-intencion">Regla activa: {ritual.nombre_regla}</p>
            <Link href={ritual.urlDetalle}>Ver detalle ritual</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
