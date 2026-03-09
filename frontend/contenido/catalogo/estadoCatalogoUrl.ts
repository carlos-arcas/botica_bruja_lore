import { OPCIONES_CATEGORIA, OPCIONES_INTENCION } from "./catalogo";
import { OrdenCatalogo } from "./filtrosCatalogo";

const ORDENES_VALIDOS: OrdenCatalogo[] = ["destacados", "precio-asc", "nombre-asc"];

export type EstadoCatalogo = {
  busqueda: string;
  intencion: string;
  categoria: string;
  orden: OrdenCatalogo;
};

export const ESTADO_CATALOGO_DEFECTO: EstadoCatalogo = {
  busqueda: "",
  intencion: "todas",
  categoria: "todas",
  orden: "destacados",
};

export function serializarEstadoCatalogo(estado: EstadoCatalogo): string {
  const parametros = new URLSearchParams();

  if (estado.busqueda.trim()) parametros.set("q", estado.busqueda.trim());
  if (estado.intencion !== ESTADO_CATALOGO_DEFECTO.intencion) parametros.set("in", estado.intencion);
  if (estado.categoria !== ESTADO_CATALOGO_DEFECTO.categoria) parametros.set("cat", estado.categoria);
  if (estado.orden !== ESTADO_CATALOGO_DEFECTO.orden) parametros.set("ord", estado.orden);

  return parametros.toString();
}


export function deserializarEstadoCatalogoDesdeObjeto(parametros?: Record<string, string | undefined>): EstadoCatalogo {
  const query = new URLSearchParams();

  if (!parametros) return ESTADO_CATALOGO_DEFECTO;

  for (const [clave, valor] of Object.entries(parametros)) {
    if (typeof valor === "string") query.set(clave, valor);
  }

  return deserializarEstadoCatalogo(query);
}

export function deserializarEstadoCatalogo(parametros: URLSearchParams): EstadoCatalogo {
  const busqueda = (parametros.get("q") ?? "").trim();
  const intencion = esIntencionValida(parametros.get("in")) ? (parametros.get("in") as string) : ESTADO_CATALOGO_DEFECTO.intencion;
  const categoria = esCategoriaValida(parametros.get("cat")) ? (parametros.get("cat") as string) : ESTADO_CATALOGO_DEFECTO.categoria;
  const orden = esOrdenValido(parametros.get("ord")) ? (parametros.get("ord") as OrdenCatalogo) : ESTADO_CATALOGO_DEFECTO.orden;

  return { busqueda, intencion, categoria, orden };
}

function esIntencionValida(valor: string | null): boolean {
  return OPCIONES_INTENCION.some((opcion) => opcion.valor === valor);
}

function esCategoriaValida(valor: string | null): boolean {
  return OPCIONES_CATEGORIA.some((opcion) => opcion.valor === valor);
}

function esOrdenValido(valor: string | null): boolean {
  return ORDENES_VALIDOS.includes(valor as OrdenCatalogo);
}
