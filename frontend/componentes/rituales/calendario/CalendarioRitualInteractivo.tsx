"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { obtenerFechaIsoActual } from "@/contenido/rituales/calendarioRitual";
import {
  ResultadoCalendarioRitual,
  consultarCalendarioRitualPorFecha,
} from "@/infraestructura/api/calendarioRitual";

type EstadoConsulta =
  | { tipo: "inicial" }
  | { tipo: "cargando" }
  | { tipo: "resultado"; valor: ResultadoCalendarioRitual };

export function CalendarioRitualInteractivo(): JSX.Element {
  const [fechaConsulta, setFechaConsulta] = useState<string>(obtenerFechaIsoActual());
  const [estado, setEstado] = useState<EstadoConsulta>({ tipo: "inicial" });

  async function manejarConsulta(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setEstado({ tipo: "cargando" });

    const resultado = await consultarCalendarioRitualPorFecha(fechaConsulta);
    setEstado({ tipo: "resultado", valor: resultado });
  }

  return (
    <section className="bloque-home" aria-live="polite">
      <h2>Consulta temporal de rituales</h2>
      <p>
        Esta consulta es editorial: muestra rituales aplicables para una fecha concreta según reglas de calendario
        publicadas.
      </p>

      <form onSubmit={manejarConsulta}>
        <label htmlFor="fecha-calendario-ritual">Fecha de consulta</label>
        <div className="hero-portada__acciones">
          <input
            id="fecha-calendario-ritual"
            name="fecha"
            type="date"
            value={fechaConsulta}
            onChange={(evento) => setFechaConsulta(evento.target.value)}
            required
          />
          <button className="boton" type="submit">
            Consultar calendario
          </button>
        </div>
      </form>

      {estado.tipo === "inicial" ? (
        <p>Selecciona una fecha para consultar rituales temporales.</p>
      ) : null}

      {estado.tipo === "cargando" ? <p>Cargando rituales para la fecha seleccionada…</p> : null}

      {estado.tipo === "resultado" && estado.valor.estado === "fecha_invalida" ? (
        <p>{estado.valor.mensaje}</p>
      ) : null}

      {estado.tipo === "resultado" && estado.valor.estado === "error" ? <p>{estado.valor.mensaje}</p> : null}

      {estado.tipo === "resultado" && estado.valor.estado === "ok" && estado.valor.rituales.length === 0 ? (
        <p>No hay rituales aplicables para {estado.valor.fechaConsulta}.</p>
      ) : null}

      {estado.tipo === "resultado" && estado.valor.estado === "ok" && estado.valor.rituales.length > 0 ? (
        <div>
          <p>Rituales aplicables para {estado.valor.fechaConsulta}:</p>
          <ul>
            {estado.valor.rituales.map((ritual) => (
              <li key={`${ritual.slug}-${ritual.nombre_regla}`}>
                <strong>{ritual.nombre}</strong>: {ritual.contexto_breve} (Regla: {ritual.nombre_regla}).{" "}
                <Link href={ritual.urlDetalle}>Ver ritual</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
