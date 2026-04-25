"use client";

import { useEffect, useMemo, useState } from "react";

import {
  actualizarAgendaCalendario,
  construirRejillaCalendario,
  desplazarClaveMes,
  obtenerFechaLocalISO,
  resolverClaveMes,
  type AgendaCalendarioVirtual,
} from "@/contenido/calendario_ritual/calendarioVirtual";
import {
  NOMBRES_DIAS_CALENDARIO,
  formatearFechaLargaCalendario,
  formatearMesCalendario,
} from "@/contenido/calendario_ritual/formatoCalendarioVirtual";
import {
  guardarAgendaCalendarioVirtualLocal,
  leerAgendaCalendarioVirtualLocal,
} from "@/infraestructura/calendario_ritual/almacenCalendarioVirtual";
import {
  type ResultadoCalendarioRitual,
  consultarCalendarioRitualPorFecha,
} from "@/infraestructura/api/calendarioRitual";
import {
  type RitualPublico,
  obtenerListadoRituales,
} from "@/infraestructura/api/rituales";

import { ResumenEditorialPorFecha } from "./ResumenEditorialPorFecha";
import styles from "./calendarioRitualEditorial.module.css";

type EstadoRituales =
  | { estado: "cargando" }
  | { estado: "ok"; rituales: RitualPublico[] }
  | { estado: "error"; mensaje: string };

type EstadoConsulta =
  | { estado: "cargando" }
  | { estado: "resultado"; resultado: ResultadoCalendarioRitual };

const HOY_ISO = obtenerFechaLocalISO();

export function CalendarioRitualEditorial(): JSX.Element {
  const [agenda, setAgenda] = useState<AgendaCalendarioVirtual>({});
  const [mesVisible, setMesVisible] = useState(resolverClaveMes(HOY_ISO));
  const [fechaSeleccionada, setFechaSeleccionada] = useState(HOY_ISO);
  const [notaBorrador, setNotaBorrador] = useState("");
  const [ritualesSeleccionados, setRitualesSeleccionados] = useState<string[]>([]);
  const [ritualPendiente, setRitualPendiente] = useState("");
  const [estadoRituales, setEstadoRituales] = useState<EstadoRituales>({ estado: "cargando" });
  const [estadoConsulta, setEstadoConsulta] = useState<EstadoConsulta>({ estado: "cargando" });
  const [mensajeLocal, setMensajeLocal] = useState("");

  useEffect(() => {
    setAgenda(leerAgendaCalendarioVirtualLocal());
  }, []);

  useEffect(() => {
    const entrada = agenda[fechaSeleccionada];
    setNotaBorrador(entrada?.nota ?? "");
    setRitualesSeleccionados(entrada?.rituales ?? []);
    setMensajeLocal("");
  }, [agenda, fechaSeleccionada]);

  useEffect(() => {
    let activa = true;
    obtenerListadoRituales().then((resultado) => {
      if (!activa) {
        return;
      }
      if (resultado.estado === "ok") {
        setEstadoRituales({ estado: "ok", rituales: resultado.rituales });
        return;
      }
      setEstadoRituales({ estado: "error", mensaje: resultado.mensaje });
    });
    return () => {
      activa = false;
    };
  }, []);

  useEffect(() => {
    let activa = true;
    setEstadoConsulta({ estado: "cargando" });
    consultarCalendarioRitualPorFecha(fechaSeleccionada).then((resultado) => {
      if (activa) {
        setEstadoConsulta({ estado: "resultado", resultado });
      }
    });
    return () => {
      activa = false;
    };
  }, [fechaSeleccionada]);

  const dias = useMemo(
    () => construirRejillaCalendario(mesVisible, agenda, HOY_ISO),
    [agenda, mesVisible],
  );
  const ritualesDisponibles = useMemo(
    () => (estadoRituales.estado === "ok" ? estadoRituales.rituales : []),
    [estadoRituales],
  );
  const ritualesNoSeleccionados = useMemo(
    () => ritualesDisponibles.filter((ritual) => !ritualesSeleccionados.includes(ritual.slug)),
    [ritualesDisponibles, ritualesSeleccionados],
  );
  const ritualesElegidos = ritualesSeleccionados
    .map((slug) => ritualesDisponibles.find((ritual) => ritual.slug === slug))
    .filter((ritual): ritual is RitualPublico => Boolean(ritual));

  useEffect(() => {
    if (ritualesNoSeleccionados.length === 0) {
      if (ritualPendiente) {
        setRitualPendiente("");
      }
      return;
    }
    if (!ritualPendiente || ritualesSeleccionados.includes(ritualPendiente)) {
      setRitualPendiente(ritualesNoSeleccionados[0].slug);
    }
  }, [ritualPendiente, ritualesNoSeleccionados, ritualesSeleccionados]);

  function seleccionarFecha(fechaISO: string): void {
    setFechaSeleccionada(fechaISO);
    setMesVisible(resolverClaveMes(fechaISO));
  }

  function agregarRitual(): void {
    if (!ritualPendiente || ritualesSeleccionados.includes(ritualPendiente)) {
      return;
    }
    setRitualesSeleccionados((actual) => [...actual, ritualPendiente]);
    setMensajeLocal("");
  }

  function quitarRitual(slug: string): void {
    setRitualesSeleccionados((actual) => actual.filter((item) => item !== slug));
    setMensajeLocal("");
  }

  function guardarDia(): void {
    const siguiente = actualizarAgendaCalendario(
      agenda,
      fechaSeleccionada,
      notaBorrador,
      ritualesSeleccionados,
    );
    setAgenda(siguiente);
    guardarAgendaCalendarioVirtualLocal(siguiente);
    setMensajeLocal("Dia guardado en este navegador.");
  }

  function limpiarDia(): void {
    const siguiente = actualizarAgendaCalendario(agenda, fechaSeleccionada, "", []);
    setAgenda(siguiente);
    guardarAgendaCalendarioVirtualLocal(siguiente);
    setMensajeLocal("Dia limpiado del calendario personal.");
  }

  return (
    <section className="bloque-home">
      <h2>Calendario virtual y agenda ritual</h2>
      <p>
        Explora el mes, selecciona un dia concreto y guarda notas con rituales publicados para
        preparar tus pruebas locales sin mezclar la agenda personal con la logica editorial oficial.
      </p>
      <div className={styles.layout}>
        <section className={styles.panelCalendario} aria-label="Calendario mensual">
          <div className={styles.cabeceraCalendario}>
            <div>
              <h3>{formatearMesCalendario(mesVisible)}</h3>
              <p className={styles.fechaDetalle}>Selecciona un dia para editar notas y rituales.</p>
            </div>
            <div className={styles.controlesMes}>
              <button
                type="button"
                className={styles.botonMes}
                onClick={() => setMesVisible((actual) => desplazarClaveMes(actual, -1))}
              >
                Mes anterior
              </button>
              <span className={styles.etiquetaMes}>{formatearMesCalendario(mesVisible)}</span>
              <button
                type="button"
                className={styles.botonMes}
                onClick={() => setMesVisible((actual) => desplazarClaveMes(actual, 1))}
              >
                Mes siguiente
              </button>
              <button
                type="button"
                className={styles.botonMes}
                onClick={() => seleccionarFecha(HOY_ISO)}
              >
                Ir a hoy
              </button>
            </div>
          </div>

          <div className={styles.diasSemana} aria-hidden="true">
            {NOMBRES_DIAS_CALENDARIO.map((dia) => (
              <span key={dia}>{dia}</span>
            ))}
          </div>

          <div className={styles.rejillaDias}>
            {dias.map((dia) => {
              const clases = [
                styles.dia,
                !dia.perteneceMesVisible ? styles.diaFueraMes : "",
                dia.esHoy ? styles.diaHoy : "",
                dia.fechaISO === fechaSeleccionada ? styles.diaSeleccionado : "",
                dia.tieneNota || dia.totalRituales > 0 ? styles.diaConContenido : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={dia.fechaISO}
                  type="button"
                  className={clases}
                  onClick={() => seleccionarFecha(dia.fechaISO)}
                  aria-pressed={dia.fechaISO === fechaSeleccionada}
                >
                  <span className={styles.numeroDia}>{dia.numeroDia}</span>
                  <span className={styles.marcadoresDia}>
                    {dia.tieneNota ? <span className={styles.marcador}>Nota guardada</span> : null}
                    {dia.totalRituales > 0 ? (
                      <span className={styles.marcador}>
                        {dia.totalRituales} ritual{dia.totalRituales === 1 ? "" : "es"}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.panelDetalle} aria-label="Detalle del dia seleccionado">
          <h3>{formatearFechaLargaCalendario(fechaSeleccionada)}</h3>
          <p className={styles.ayudaDetalle}>
            Las notas y rituales añadidos aqui se guardan solo en este navegador para pruebas del
            calendario virtual.
          </p>

          <div className={styles.editorDia}>
            <label htmlFor="nota-calendario-virtual">
              Nota del dia
              <textarea
                id="nota-calendario-virtual"
                rows={5}
                value={notaBorrador}
                onChange={(event) => setNotaBorrador(event.target.value)}
                placeholder="Escribe una nota breve para este dia."
              />
            </label>

            <label htmlFor="ritual-calendario-virtual">
              Anadir ritual publicado
              <div className={styles.filaAgregarRitual}>
                <select
                  id="ritual-calendario-virtual"
                  value={ritualPendiente}
                  onChange={(event) => setRitualPendiente(event.target.value)}
                  disabled={ritualesNoSeleccionados.length === 0 || estadoRituales.estado !== "ok"}
                >
                  {ritualesNoSeleccionados.length === 0 ? (
                    <option value="">No quedan rituales por anadir</option>
                  ) : (
                    ritualesNoSeleccionados.map((ritual) => (
                      <option key={ritual.slug} value={ritual.slug}>
                        {ritual.nombre}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  className="boton boton--secundario"
                  onClick={agregarRitual}
                  disabled={!ritualPendiente || ritualesNoSeleccionados.length === 0}
                >
                  Anadir
                </button>
              </div>
            </label>

            {ritualesElegidos.length > 0 ? (
              <div className={styles.seleccionados}>
                {ritualesElegidos.map((ritual) => (
                  <span key={ritual.slug} className={styles.chip}>
                    {ritual.nombre}
                    <button type="button" onClick={() => quitarRitual(ritual.slug)} aria-label={`Quitar ${ritual.nombre}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className={styles.accionesEditor}>
              <button type="button" className="boton boton--principal" onClick={guardarDia}>
                Guardar dia
              </button>
              <button type="button" className="boton boton--secundario" onClick={limpiarDia}>
                Limpiar dia
              </button>
            </div>

            {mensajeLocal ? <p className={styles.estadoLocal}>{mensajeLocal}</p> : null}
          </div>

          <div className={styles.bloqueEditorial}>
            <h3>Sugerencias editoriales para la fecha</h3>
            <ResumenEditorialPorFecha estadoConsulta={estadoConsulta} />
          </div>
        </section>
      </div>
    </section>
  );
}
