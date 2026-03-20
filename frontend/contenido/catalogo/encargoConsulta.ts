import { ItemEncargoPreseleccionado, construirResumenItemsEncargo, deserializarItemsEncargo } from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import { obtenerProductoPorSlug } from "./detalleCatalogo";
import { LineaSeleccionEncargo, construirResumenHumanoSeleccion } from "./seleccionEncargo";

export const MENSAJES_VALIDACION = {
  nombre: "Comparte tu nombre para preparar la consulta.",
  contacto: "Indica un email válido o un teléfono (mínimo 9 dígitos).",
  producto: "Selecciona una pieza de la colección para continuar.",
  mensaje: "Cuéntanos brevemente tu intención o contexto.",
  consentimiento: "Necesitamos tu confirmación para gestionar esta solicitud.",
} as const;

export type ModoConsulta = "producto" | "seleccion";

export type DatosConsulta = {
  nombre: string;
  email: string;
  telefono: string;
  productoSlug: string;
  cantidad: string;
  mensaje: string;
  consentimiento: boolean;
};

export type ContextoPreseleccionConsulta = {
  modo: ModoConsulta;
  productoPreseleccionado: ProductoCatalogo | null;
  itemsPreseleccionados: ItemEncargoPreseleccionado[];
};

export type ErroresConsulta = Partial<Record<keyof DatosConsulta, string>>;

export function resolverProductoPreseleccionado(slug: string | null, productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO): ProductoCatalogo | null {
  return slug ? obtenerProductoPorSlug(slug, productos) : null;
}

export function resolverContextoPreseleccionado(
  slug: string | null,
  cestaSerializada: string | null,
  origen: string | null = null,
): ContextoPreseleccionConsulta {
  const itemsPreseleccionados = deserializarItemsEncargo(cestaSerializada);
  const modo = origen === "seleccion" || itemsPreseleccionados.length > 0 ? "seleccion" : "producto";

  return {
    modo,
    productoPreseleccionado: resolverProductoPreseleccionado(slug),
    itemsPreseleccionados,
  };
}

export function construirEstadoInicialConsulta(
  contexto: ContextoPreseleccionConsulta,
  lineasSeleccion: LineaSeleccionEncargo[] = [],
): DatosConsulta {
  if (contexto.modo === "seleccion") {
    return {
      nombre: "",
      email: "",
      telefono: "",
      productoSlug: "",
      cantidad: "A definir durante la revisión artesanal",
      mensaje: construirResumenHumanoSeleccion(lineasSeleccion),
      consentimiento: false,
    };
  }

  return {
    nombre: "",
    email: "",
    telefono: "",
    productoSlug: contexto.productoPreseleccionado?.slug ?? "",
    cantidad: "1 unidad",
    mensaje: "",
    consentimiento: false,
  };
}

export function validarSolicitudConsulta(datos: DatosConsulta, modo: ModoConsulta): ErroresConsulta {
  const errores: ErroresConsulta = {};

  if (datos.nombre.trim().length < 2) {
    errores.nombre = MENSAJES_VALIDACION.nombre;
  }
  if (!tieneContactoValido(datos.email, datos.telefono)) {
    errores.email = MENSAJES_VALIDACION.contacto;
  }
  if (modo === "producto" && !datos.productoSlug.trim()) {
    errores.productoSlug = MENSAJES_VALIDACION.producto;
  }
  if (datos.mensaje.trim().length < 12) {
    errores.mensaje = MENSAJES_VALIDACION.mensaje;
  }
  if (!datos.consentimiento) {
    errores.consentimiento = MENSAJES_VALIDACION.consentimiento;
  }

  return errores;
}

export function construirResumenConsulta(
  datos: DatosConsulta,
  producto: ProductoCatalogo | null,
  modo: ModoConsulta,
  lineasSeleccion: LineaSeleccionEncargo[] = [],
): string {
  const contacto = datos.email.trim() || `Teléfono: ${datos.telefono.trim()}`;
  const bloqueSeleccion = modo === "seleccion"
    ? `Selección: ${construirResumenHumanoSeleccion(lineasSeleccion) || construirResumenItemsEncargo(lineasSeleccion.map(({ slug, cantidad }) => ({ slug: slug ?? "pieza-sin-slug", cantidad })))}`
    : `Producto: ${producto?.nombre ?? "Producto pendiente de selección"}`;

  return [
    "Consulta de encargo · La Botica de la Bruja Lore",
    `Nombre: ${datos.nombre.trim()}`,
    `Contacto: ${contacto}`,
    bloqueSeleccion,
    `Cantidad/Formato: ${datos.cantidad.trim() || "A convenir"}`,
    `Intención: ${datos.mensaje.trim()}`,
  ].join("\n");
}

function tieneContactoValido(email: string, telefono: string): boolean {
  return esEmailValido(email.trim()) || esTelefonoValido(telefono.trim());
}

function esEmailValido(email: string): boolean {
  return Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esTelefonoValido(telefono: string): boolean {
  return telefono.replace(/\D/g, "").length >= 9;
}
