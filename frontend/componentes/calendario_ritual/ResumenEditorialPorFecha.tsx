"use client";

import Link from "next/link";

import { type ResultadoCalendarioRitual } from "@/infraestructura/api/calendarioRitual";

import styles from "./calendarioRitualEditorial.module.css";

type EstadoConsulta =
  | { estado: "cargando" }
  | { estado: "resultado"; resultado: ResultadoCalendarioRitual };

export function ResumenEditorialPorFecha({
  estadoConsulta,
}: {
  estadoConsulta: EstadoConsulta;
}): JSX.Element {
  if (estadoConsulta.estado === "cargando") {
    return <p className={styles.estadoEditorial}>Consultando reglas activas para esta fecha...</p>;
  }

  if (estadoConsulta.resultado.estado === "error") {
    return <p className={styles.estadoEditorial}>{estadoConsulta.resultado.mensaje}</p>;
  }

  if (estadoConsulta.resultado.rituales.length === 0) {
    return (
      <p className={styles.estadoEditorial}>
        No hay rituales editoriales activos para esta fecha. Puedes guardar una nota personal o
        preparar el dia con cualquier ritual publicado de la lista.
      </p>
    );
  }

  return (
    <ul className={styles.listaEditorial}>
      {estadoConsulta.resultado.rituales.map((ritual) => (
        <li key={`${ritual.slug}-${ritual.nombre_regla}`}>
          <strong>{ritual.nombre}</strong>
          <p>{ritual.contexto_breve}</p>
          <p className={styles.regla}>Regla activa: {ritual.nombre_regla}</p>
          <Link href={ritual.urlDetalle}>Ver detalle ritual</Link>
        </li>
      ))}
    </ul>
  );
}
