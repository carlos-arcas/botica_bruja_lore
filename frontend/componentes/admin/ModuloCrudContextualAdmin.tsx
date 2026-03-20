"use client";

import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CampoFormulario, ConfigCampo, ControlImagenFormulario } from "@/componentes/admin/CamposFormularioAdmin";
import { PanelEstadoListadoAdmin } from "@/componentes/admin/PanelEstadoListadoAdmin";
import { construirMensajeConfirmacionContextual, EstadoSincronizacionConfirmacion } from "@/componentes/admin/importacion/confirmacionContextualImportacion";
import { construirFeedbackConfirmacionImportacion } from "@/componentes/admin/importacion/feedbackConfirmacionImportacion";
import { actualizarDetalleImportacion } from "@/componentes/admin/importacion/resumenImportacion";
import { TablaStagingImportacion } from "@/componentes/admin/TablaStagingImportacion";
import {
  FilaImportacion,
  ModuloAdmin,
  ResumenImportacion,
  adjuntarImagenFilaImportacion,
  cambiarPublicacionAdmin,
  cambiarSeleccionFilaImportacion,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarExportacionAdmin,
  eliminarImagenFilaImportacion,
  guardarRegistroAdmin,
  obtenerListadoAdmin,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
  subirImagenBackoffice,
} from "@/infraestructura/api/backoffice";
import { EstadoListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { construirPayloadRitual } from "@/infraestructura/configuracion/adminRituales";
import { construirPayloadCanonicoProducto } from "@/infraestructura/configuracion/contratoProductosBackoffice";

type OpcionContexto = { etiqueta: string; valor: string };
type TipoPayloadAdmin = "rituales" | "editorial" | "secciones" | "productos";
type GrupoCampos = { id: string; titulo: string; descripcion: string; campos: ConfigCampo[] };

type Props = {
  modulo: ModuloAdmin;
  titulo: string;
  token?: string;
  itemsIniciales: Record<string, unknown>[];
  campoEstado: "publicado" | "publicada";
  entidadImportacion: "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas";
  camposComunes: ConfigCampo[];
  camposEspecificos?: ConfigCampo[];
  tipoPayload: TipoPayloadAdmin;
  seccionSeleccionada?: string;
  columnasObligatoriasImportacion?: string[];
  columnasOpcionalesImportacion?: string[];
  contextoFormulario?: { clave: string; etiqueta: string; ayuda: string; opciones: OpcionContexto[] };
  onCambioContexto?: (valor: string) => void;
  validarFormulario?: (form: Record<string, unknown>) => string | null;
  estadoListadoInicial?: EstadoListadoAdmin;
  mostrarPanelHerramientas?: boolean;
  onItemsSincronizados?: (seccion: string, items: Record<string, unknown>[]) => void;
  onItemMutado?: (item: Record<string, unknown>) => void;
};

type DetalleLote = { lote: Record<string, unknown>; resumen: ResumenImportacion; filas: FilaImportacion[] };

function descargarBlobNavegador(blob: Blob, nombre: string): void {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  window.URL.revokeObjectURL(url);
}

function construirNombreExportacion(modulo: ModuloAdmin, tipo: "plantilla" | "inventario", formato: "csv" | "xlsx", seccion: string): string {
  const sufijoSeccion = seccion ? `-${seccion}` : "";
  return `${modulo}-${tipo}${sufijoSeccion}.${formato}`;
}


type EstadoImagenFormulario = { estado: "idle" | "subiendo" | "ok" | "error"; mensaje: string };

function prefijoImagenModulo(modulo: ModuloAdmin): string {
  if (modulo === "productos") return "backoffice/productos";
  if (modulo === "rituales") return "backoffice/rituales";
  if (modulo === "editorial") return "backoffice/articulos";
  return "backoffice/imagenes";
}

const TITULOS_BLOQUE: Record<string, string> = {
  basica: "Información básica",
  presentacion: "Presentación en la web",
  estado: "Estado y publicación",
};

const DESCRIPCIONES_BLOQUE: Record<string, string> = {
  basica: "Datos esenciales de lectura rápida para gestión editorial y comercial.",
  presentacion: "Cómo se mostrará este registro dentro del catálogo o módulos públicos.",
  estado: "Control de visibilidad y publicación para evitar cambios sin contexto.",
};

const CLAVES_BLOQUE: Record<string, Set<string>> = {
  basica: new Set(["nombre", "titulo", "descripcion", "descripcion_corta", "resumen", "contenido", "tema", "hub", "subhub"]),
  presentacion: new Set(["precio_visible", "imagen_url", "seccion_publica", "tipo_producto", "categoria_comercial", "intenciones_relacionadas", "productos_relacionados", "orden"]),
  estado: new Set(["publicado", "publicada", "indexable"]),
};

const CLAVES_ESTADO = new Set(["publicado", "publicada", "indexable"]);

const obtenerFaltantesCabecera = (cabecera: string, columnasObligatorias: string[]): string[] => {
  const columnas = new Set(cabecera.split(",").map((valor) => valor.trim().toLowerCase()).filter(Boolean));
  return columnasObligatorias.filter((columna) => !columnas.has(columna.toLowerCase()));
};

async function validarCabeceraCsv(archivo: File, columnasObligatorias: string[]): Promise<string[]> {
  if (!archivo.name.toLowerCase().endsWith(".csv") || columnasObligatorias.length === 0) return [];
  const texto = await archivo.text();
  return obtenerFaltantesCabecera(texto.split(/\r?\n/)[0] ?? "", columnasObligatorias);
}

function construirPayloadSegunTipo(tipoPayload: TipoPayloadAdmin, formulario: Record<string, unknown>, seccionSeleccionada: string): Record<string, unknown> {
  if (tipoPayload === "rituales") return construirPayloadRitual(formulario);
  if (tipoPayload === "productos") {
    return construirPayloadCanonicoProducto(formulario, seccionSeleccionada);
  }
  return formulario;
}

function clasificarCampo(campo: ConfigCampo): "basica" | "presentacion" | "estado" {
  if (CLAVES_BLOQUE.estado.has(campo.clave) || campo.tipo === "checkbox") return "estado";
  if (CLAVES_BLOQUE.basica.has(campo.clave)) return "basica";
  if (CLAVES_BLOQUE.presentacion.has(campo.clave)) return "presentacion";
  return "presentacion";
}

function agruparCamposFormulario(campos: ConfigCampo[]): GrupoCampos[] {
  const grupos: Record<string, ConfigCampo[]> = { basica: [], presentacion: [], estado: [] };
  campos.forEach((campo) => grupos[clasificarCampo(campo)].push(campo));
  return Object.entries(grupos)
    .filter(([, camposGrupo]) => camposGrupo.length > 0)
    .map(([id, camposGrupo]) => ({ id, titulo: TITULOS_BLOQUE[id], descripcion: DESCRIPCIONES_BLOQUE[id], campos: camposGrupo }));
}


function debeMostrarCampo(modulo: ModuloAdmin, campo: ConfigCampo, formulario: Record<string, unknown>): boolean {
  if (modulo !== "productos") return true;
  if (campo.clave === "formato_peso_personalizado") return String(formulario.formato_peso ?? "") === "personalizado";
  if (campo.clave === "planta_id") return String(formulario.tipo_producto ?? "") === "hierbas-a-granel";
  return true;
}

function BloqueCampos({ modulo, grupo, formulario, onCambio, controlImagen }: { modulo: ModuloAdmin; grupo: GrupoCampos; formulario: Record<string, unknown>; onCambio: (clave: string, valor: unknown) => void; controlImagen?: ControlImagenFormulario }): JSX.Element {
  return (
    <fieldset className="admin-subseccion-formulario">
      <legend>{grupo.titulo}</legend>
      <p>{grupo.descripcion}</p>
      <div className="admin-campos-grid admin-campos-grid--vertical">
        {grupo.campos.filter((campo) => debeMostrarCampo(modulo, campo, formulario)).map((campo) => {
          const clase = CLAVES_ESTADO.has(campo.clave) ? "admin-campo-flag" : "admin-campo-control";
          return (
            <label key={campo.clave} className={clase}>
              <span>{campo.etiqueta}</span>
              <CampoFormulario campo={campo} valor={formulario[campo.clave]} onCambio={(valor) => onCambio(campo.clave, valor)} controlImagen={campo.clave === "imagen_url" ? controlImagen : undefined} />
              {campo.ayuda ? <small>{campo.ayuda}</small> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}


function resolverMensajeTablaVacia(estado: EstadoListadoAdmin, hayFiltro: boolean): string {
  if (estado.tipo === "vacio") return estado.mensaje;
  if (estado.tipo === "denegado" || estado.tipo === "error") return estado.detalle;
  return hayFiltro ? "No hay registros visibles con el filtro actual." : "No hay registros disponibles en este momento.";
}

function prepararRegistroEdicion(modulo: ModuloAdmin, campos: ConfigCampo[], item: Record<string, unknown>): Record<string, unknown> {
  if (modulo !== "productos") return { ...item };
  return { ...item };
}

function actualizarDetalleLote(
  asignarDetalle: Dispatch<SetStateAction<DetalleLote | null>>,
  filaActualizada: FilaImportacion,
): void {
  asignarDetalle((detalleActual) => (!detalleActual ? detalleActual : actualizarDetalleImportacion(detalleActual, filaActualizada)));
}

export function ModuloCrudContextualAdmin({
  modulo,
  titulo,
  token,
  itemsIniciales,
  campoEstado,
  entidadImportacion,
  camposComunes,
  camposEspecificos = [],
  tipoPayload,
  seccionSeleccionada = "",
  columnasObligatoriasImportacion = [],
  columnasOpcionalesImportacion = [],
  contextoFormulario,
  onCambioContexto,
  validarFormulario,
  estadoListadoInicial = { tipo: "datos", mensaje: "Datos cargados." },
  mostrarPanelHerramientas = false,
  onItemsSincronizados,
  onItemMutado,
}: Props): JSX.Element {
  const router = useRouter();
  const [items, setItems] = useState(itemsIniciales);
  const [formAlta, setFormAlta] = useState<Record<string, unknown>>({ [contextoFormulario?.clave ?? ""]: seccionSeleccionada });
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [detalle, setDetalle] = useState<DetalleLote | null>(null);
  const [registroEdicion, setRegistroEdicion] = useState<Record<string, unknown> | null>(null);
  const [estadoImagenAlta, setEstadoImagenAlta] = useState<EstadoImagenFormulario>({ estado: "idle", mensaje: "" });
  const [estadoImagenEdicion, setEstadoImagenEdicion] = useState<EstadoImagenFormulario>({ estado: "idle", mensaje: "" });
  const [importacionAbierta, setImportacionAbierta] = useState(false);

  useEffect(() => setItems(itemsIniciales), [itemsIniciales]);
  useEffect(() => {
    if (!contextoFormulario?.clave) return;
    setFormAlta((actual) => ({ ...actual, [contextoFormulario.clave]: seccionSeleccionada }));
  }, [contextoFormulario?.clave, seccionSeleccionada]);

  const campos = useMemo(() => [...camposComunes, ...camposEspecificos], [camposComunes, camposEspecificos]);
  const gruposFormulario = useMemo(() => agruparCamposFormulario(campos), [campos]);
  const filtrados = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(filtro.toLowerCase())), [items, filtro]);

  const recargarListadoReal = async (): Promise<void> => {
    const query = new URLSearchParams();
    if (modulo === "productos" && seccionSeleccionada) {
      query.set("seccion", seccionSeleccionada);
    }
    const actualizado = await obtenerListadoAdmin(modulo, query, token);
    if (actualizado.estado !== "ok") {
      throw new Error(actualizado.detalle);
    }
    setItems(actualizado.items);
    onItemsSincronizados?.(seccionSeleccionada, actualizado.items);
    router.refresh();
  };

  const sincronizarListadoTrasConfirmacion = async (): Promise<EstadoSincronizacionConfirmacion> => {
    if (modulo !== "productos") return { estado: "omitida" };
    try {
      await recargarListadoReal();
      return { estado: "sincronizada" };
    } catch (error) {
      return {
        estado: "pendiente",
        detalle: error instanceof Error && error.message ? error.message : "No se pudo refrescar el listado real.",
      };
    }
  };

  const ejecutarAccion = async (accion: () => Promise<void>, mensajeError: string) => {
    try {
      await accion();
      setError("");
    } catch (error) {
      setOk("");
      setError(error instanceof Error && error.message ? error.message : mensajeError);
    }
  };

  const guardar = async (formulario: Record<string, unknown>) => {
    const payload = construirPayloadSegunTipo(tipoPayload, formulario, seccionSeleccionada);
    const itemGuardado = await guardarRegistroAdmin(modulo, payload, token);
    onItemMutado?.(itemGuardado);
    await recargarListadoReal();
  };

  const onGuardarAlta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payloadValidacion = construirPayloadSegunTipo(tipoPayload, formAlta, seccionSeleccionada);
    const errorValidacion = validarFormulario?.(payloadValidacion);
    if (errorValidacion) return setError(errorValidacion);
    await ejecutarAccion(async () => {
      await guardar(formAlta);
      setFormAlta({ [contextoFormulario?.clave ?? ""]: seccionSeleccionada });
      setOk("Registro guardado.");
    }, "No se pudo guardar el registro.");
  };

  const onGuardarEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!registroEdicion) return;
    const payloadValidacion = construirPayloadSegunTipo(tipoPayload, registroEdicion, seccionSeleccionada);
    const errorValidacion = validarFormulario?.(payloadValidacion);
    if (errorValidacion) return setError(errorValidacion);
    await ejecutarAccion(async () => {
      await guardar(registroEdicion);
      setRegistroEdicion(null);
      setEstadoImagenEdicion({ estado: "idle", mensaje: "" });
      setOk("Cambios guardados.");
    }, "No se pudo guardar la edición.");
  };

  const onArchivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const faltantes = await validarCabeceraCsv(archivo, columnasObligatoriasImportacion);
    if (faltantes.length > 0) return setError(`Faltan columnas obligatorias: ${faltantes.join(", ")}.`);
    await ejecutarAccion(async () => {
      const formData = new FormData();
      formData.set("entidad", entidadImportacion);
      formData.set("archivo", archivo);
      const loteId = await crearLoteImportacion(formData, token);
      const data = await obtenerLoteImportacion(loteId, token);
      setDetalle(data);
      setImportacionAbierta(true);
      setOk("Lote cargado. Revisa filas antes de confirmar.");
    }, "No se pudo cargar el lote de importación.");
  };

  const onSeleccionFila = async (filaId: number, seleccionado: boolean) => {
    if (!detalle) return;
    await ejecutarAccion(async () => {
      const filaActualizada = await cambiarSeleccionFilaImportacion(Number(detalle.lote.id), filaId, seleccionado, token);
      actualizarDetalleLote(setDetalle, filaActualizada);
    }, "No se pudo actualizar la selección de la fila.");
  };

  const onAdjuntarImagen = async (filaId: number, archivo: File) => {
    if (!detalle) return;
    await ejecutarAccion(async () => {
      const filaActualizada = await adjuntarImagenFilaImportacion(Number(detalle.lote.id), filaId, archivo, token);
      actualizarDetalleLote(setDetalle, filaActualizada);
    }, "No se pudo adjuntar la imagen de la fila.");
  };

  const onEliminarImagen = async (filaId: number) => {
    if (!detalle) return;
    await ejecutarAccion(async () => {
      const filaActualizada = await eliminarImagenFilaImportacion(Number(detalle.lote.id), filaId, token);
      actualizarDetalleLote(setDetalle, filaActualizada);
    }, "No se pudo eliminar la imagen de la fila.");
  };

  const onDescartarFila = async (filaId: number) => {
    if (!detalle) return;
    await ejecutarAccion(async () => {
      const filaActualizada = await descartarFilaImportacion(Number(detalle.lote.id), filaId, token);
      actualizarDetalleLote(setDetalle, filaActualizada);
    }, "No se pudo descartar la fila.");
  };

  const onRevalidarLote = () => !detalle ? Promise.resolve() : ejecutarAccion(async () => {
    const respuesta = await revalidarLoteImportacion(Number(detalle.lote.id), token);
    setDetalle(respuesta.detalle);
    setOk("Lote revalidado.");
  }, "No se pudo revalidar el lote.");

  const onConfirmarLote = () => !detalle ? Promise.resolve() : ejecutarAccion(async () => {
    const seleccionadas = detalle.filas.filter((fila) => fila.seleccionado).map((fila) => fila.id);
    const respuesta = await confirmarLoteImportacion(Number(detalle.lote.id), seleccionadas, token);
    const feedback = construirFeedbackConfirmacionImportacion("Lote confirmado. Filas aplicadas", respuesta);
    setDetalle(feedback.detalle);
    const sincronizacion = await sincronizarListadoTrasConfirmacion();
    setOk(construirMensajeConfirmacionContextual(feedback.mensaje, sincronizacion));
  }, "No se pudo confirmar el lote.");



  const subirImagen = async (archivo: File, esEdicion: boolean) => {
    const asignar = esEdicion ? setEstadoImagenEdicion : setEstadoImagenAlta;
    asignar({ estado: "subiendo", mensaje: "" });
    try {
      const imagenUrl = await subirImagenBackoffice(archivo, prefijoImagenModulo(modulo), token);
      if (esEdicion) {
        if (!registroEdicion) return;
        setRegistroEdicion({ ...registroEdicion, imagen_url: imagenUrl });
      } else {
        setFormAlta({ ...formAlta, imagen_url: imagenUrl });
      }
      asignar({ estado: "ok", mensaje: "" });
    } catch (error) {
      asignar({ estado: "error", mensaje: error instanceof Error ? error.message : "No se pudo subir la imagen." });
    }
  };

  const quitarImagen = (esEdicion: boolean) => {
    if (esEdicion) {
      if (!registroEdicion) return;
      setRegistroEdicion({ ...registroEdicion, imagen_url: "" });
      setEstadoImagenEdicion({ estado: "idle", mensaje: "" });
      return;
    }
    setFormAlta({ ...formAlta, imagen_url: "" });
    setEstadoImagenAlta({ estado: "idle", mensaje: "" });
  };

  const controlImagenAlta: ControlImagenFormulario = {
    ...estadoImagenAlta,
    onSubirArchivo: (archivo) => {
      void subirImagen(archivo, false);
    },
    onQuitarImagen: () => quitarImagen(false),
  };

  const controlImagenEdicion: ControlImagenFormulario = {
    ...estadoImagenEdicion,
    onSubirArchivo: (archivo) => {
      void subirImagen(archivo, true);
    },
    onQuitarImagen: () => quitarImagen(true),
  };

  const descargar = async (tipo: "plantilla" | "inventario", formato: "csv" | "xlsx") => {
    const blob = await descargarExportacionAdmin(modulo, tipo, formato, token, seccionSeleccionada);
    descargarBlobNavegador(blob, construirNombreExportacion(modulo, tipo, formato, seccionSeleccionada));
    setOk(`Descarga lista: ${tipo.toUpperCase()} (${formato.toUpperCase()}).`);
  };

  const onSeleccionStaging = (fila: FilaImportacion) => void onSeleccionFila(fila.id, !fila.seleccionado);
  const onAdjuntarStaging = (fila: FilaImportacion, archivo?: File) => {
    if (!archivo) return;
    void onAdjuntarImagen(fila.id, archivo);
  };
  const onEliminarStaging = (fila: FilaImportacion) => void onEliminarImagen(fila.id);
  const onDescartarStaging = (fila: FilaImportacion) => void onDescartarFila(fila.id);

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / {titulo}</p>
      <div className="admin-resumen"><h2>{titulo}</h2></div>
      {ok ? <p className="admin-estado">{ok}</p> : null}
      {error ? <p className="admin-estado admin-estado--error">{error}</p> : null}
      {!error ? <PanelEstadoListadoAdmin estado={items.length > 0 ? { tipo: "datos", mensaje: "Datos cargados." } : estadoListadoInicial} /> : null}

      <section className="admin-bloque admin-acciones-modulo" aria-label="Acciones del módulo">
        <h3>Acciones rápidas</h3>
        <div className="admin-filtros">
          <button type="button" className="admin-boton admin-boton--secundario" onClick={() => setImportacionAbierta(true)}>Importar</button>
          <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("plantilla", "csv"), "No se pudo descargar la plantilla CSV.")}>Plantilla CSV</button>
          <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("plantilla", "xlsx"), "No se pudo descargar la plantilla XLSX.")}>Plantilla XLSX</button>
          <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("inventario", "csv"), "No se pudo exportar inventario CSV.")}>Inventario CSV</button>
          <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("inventario", "xlsx"), "No se pudo exportar inventario XLSX.")}>Inventario XLSX</button>
        </div>
      </section>

      <div className={mostrarPanelHerramientas ? "admin-disposicion-crud" : "admin-disposicion-crud admin-disposicion-crud--ancha"}>
        <div className="admin-columna-principal">
          <section className="admin-bloque admin-alta-manual">
            <h3>Formulario principal</h3>
            <p className="admin-subtitulo">Completa el registro por bloques para mantener una edición clara y consistente.</p>
            <form onSubmit={onGuardarAlta} className="admin-formulario-amplio admin-formulario-vertical">
              {contextoFormulario ? (
                <label className="admin-control-contexto admin-campo-control">
                  <span>{contextoFormulario.etiqueta}</span>
                  <small>{contextoFormulario.ayuda}</small>
                  <select value={String(formAlta[contextoFormulario.clave] ?? seccionSeleccionada)} onChange={(event) => {
                    const valor = event.target.value;
                    setFormAlta({ ...formAlta, [contextoFormulario.clave]: valor });
                    onCambioContexto?.(valor);
                  }}>
                    {contextoFormulario.opciones.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>)}
                  </select>
                </label>
              ) : null}
              {gruposFormulario.map((grupo) => <BloqueCampos key={grupo.id} modulo={modulo} grupo={grupo} formulario={formAlta} onCambio={(clave, valor) => setFormAlta({ ...formAlta, [clave]: valor })} controlImagen={controlImagenAlta} />)}
              <div className="admin-acciones-formulario">
                <button type="submit" className="admin-boton admin-boton--primario">Guardar</button>
              </div>
            </form>
          </section>

          <section className="admin-bloque admin-registros-existentes">
            <div className="admin-registros-cabecera">
              <h3>Registros existentes</h3>
              <input placeholder="Buscar por nombre, slug o contenido" value={filtro} onChange={(event) => setFiltro(event.target.value)} />
            </div>
            <table className="admin-tabla">
              <thead><tr><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={3}>{resolverMensajeTablaVacia(estadoListadoInicial, filtro.length > 0)}</td>
                  </tr>
                ) : null}
                {filtrados.map((item) => (
                  <tr key={String(item.id)}>
                    <td>{String(item.nombre ?? item.titulo ?? item.slug ?? item.id)}</td>
                    <td>{item[campoEstado] ? "Publicado" : "Borrador"}</td>
                    <td>
                      <div className="admin-acciones-fila">
                        <button type="button" className="admin-boton admin-boton--secundario" onClick={() => { setRegistroEdicion(prepararRegistroEdicion(modulo, campos, item)); setEstadoImagenEdicion({ estado: "idle", mensaje: "" }); }}>Editar</button>
                        <button
                          type="button"
                          className={item[campoEstado] ? "admin-boton admin-boton--peligro" : "admin-boton admin-boton--primario"}
                          onClick={() => void ejecutarAccion(async () => {
                            const itemActualizado = await cambiarPublicacionAdmin(modulo, String(item.id), !Boolean(item[campoEstado]), token);
                            onItemMutado?.(itemActualizado);
                            await recargarListadoReal();
                          }, "No se pudo actualizar la publicación.")}
                        >
                          {item[campoEstado] ? "Despublicar" : "Publicar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {mostrarPanelHerramientas ? (
          <aside className="admin-columna-herramientas" aria-label="Herramientas secundarias">
            <section className="admin-bloque admin-panel-herramientas">
              <h3>Herramientas</h3>
              <p>Accesos complementarios para operaciones frecuentes.</p>
              <button type="button" className="admin-boton admin-boton--secundario" onClick={() => setImportacionAbierta(true)}>Importar lote</button>
              <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("inventario", "xlsx"), "No se pudo exportar inventario XLSX.")}>Exportar inventario XLSX</button>
            </section>
          </aside>
        ) : null}
      </div>

      {importacionAbierta ? (
        <div className="admin-modal-fondo" role="presentation" onClick={() => setImportacionAbierta(false)}>
          <div className="admin-modal admin-modal--grande" role="dialog" aria-modal="true" aria-label="Importar lote" onClick={(event) => event.stopPropagation()}>
            <h3>Importación</h3>
            <p>Columnas obligatorias: {columnasObligatoriasImportacion.length ? columnasObligatoriasImportacion.join(", ") : "(sin restricciones)"}</p>
            <p>Columnas opcionales: {columnasOpcionalesImportacion.length ? columnasOpcionalesImportacion.join(", ") : "(sin opcionales)"}</p>
            <input type="file" accept=".csv,.xlsx" onChange={(event) => void onArchivo(event)} />
            <div className="admin-filtros">
              <button type="button" className="admin-boton admin-boton--primario" onClick={onConfirmarLote}>Confirmar lote seleccionado</button>
              <button type="button" className="admin-boton admin-boton--secundario" onClick={onRevalidarLote}>Revalidar lote</button>
              <button type="button" className="admin-boton admin-boton--secundario" onClick={() => setImportacionAbierta(false)}>Cerrar</button>
            </div>
            {detalle ? <TablaStagingImportacion detalleId={Number(detalle.lote.id)} filas={detalle.filas} onSeleccionar={onSeleccionStaging} onAdjuntar={onAdjuntarStaging} onEliminarImagen={onEliminarStaging} onDescartar={onDescartarStaging} /> : null}
          </div>
        </div>
      ) : null}

      {registroEdicion ? (
        <div className="admin-modal-fondo" role="presentation" onClick={() => setRegistroEdicion(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Editar registro" onClick={(event) => event.stopPropagation()}>
            <header className="admin-modal-cabecera">
              <h3>Editar registro</h3>
              <p>Revisa cada bloque antes de guardar para mantener consistencia editorial y comercial.</p>
            </header>
            <form onSubmit={onGuardarEdicion} className="admin-formulario-amplio admin-formulario-vertical">
              {gruposFormulario.map((grupo) => <BloqueCampos key={`editar-${grupo.id}`} modulo={modulo} grupo={grupo} formulario={registroEdicion} onCambio={(clave, valor) => setRegistroEdicion({ ...registroEdicion, [clave]: valor })} controlImagen={controlImagenEdicion} />)}
              <div className="admin-acciones-formulario admin-acciones-formulario--dialogo">
                <button type="submit" className="admin-boton admin-boton--primario">Guardar cambios</button>
                <button type="button" className="admin-boton admin-boton--secundario" onClick={() => setRegistroEdicion(null)}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
