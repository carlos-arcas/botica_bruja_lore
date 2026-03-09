import {
  ItemEncargoPreseleccionado,
  construirResumenItemsEncargo,
  deserializarItemsEncargo,
} from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import { obtenerProductoPorSlug } from "./detalleCatalogo";

export const MENSAJES_VALIDACION = {
  nombre: "Comparte tu nombre para preparar la consulta.",
  contacto: "Indica un email válido o un teléfono (mínimo 9 dígitos).",
  producto: "Selecciona una pieza de la colección para continuar.",
  mensaje: "Cuéntanos brevemente tu intención o contexto.",
  consentimiento: "Necesitamos tu confirmación para gestionar esta solicitud.",
} as const;

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
  productoPreseleccionado: ProductoCatalogo | null;
  itemsPreseleccionados: ItemEncargoPreseleccionado[];
};

export type ErroresConsulta = Partial<Record<keyof DatosConsulta, string>>;

export function resolverProductoPreseleccionado(
  slug: string | null,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): ProductoCatalogo | null {
  if (!slug) {
    return null;
  }

  return obtenerProductoPorSlug(slug, productos);
}

export function resolverContextoPreseleccionado(
  slug: string | null,
  cestaSerializada: string | null,
): ContextoPreseleccionConsulta {
  return {
    productoPreseleccionado: resolverProductoPreseleccionado(slug),
    itemsPreseleccionados: deserializarItemsEncargo(cestaSerializada),
  };
}

export function construirEstadoInicialConsulta(contexto: ContextoPreseleccionConsulta): DatosConsulta {
  if (contexto.itemsPreseleccionados.length > 0) {
    return {
      nombre: "",
      email: "",
      telefono: "",
      productoSlug: contexto.itemsPreseleccionados[0].slug,
      cantidad: "Selección múltiple desde cesta",
      mensaje: construirResumenItemsEncargo(contexto.itemsPreseleccionados),
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

export function validarSolicitudConsulta(datos: DatosConsulta): ErroresConsulta {
  const errores: ErroresConsulta = {};

  if (datos.nombre.trim().length < 2) {
    errores.nombre = MENSAJES_VALIDACION.nombre;
  }

  if (!tieneContactoValido(datos.email, datos.telefono)) {
    errores.email = MENSAJES_VALIDACION.contacto;
  }

  if (!datos.productoSlug.trim()) {
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

export function construirResumenConsulta(datos: DatosConsulta, producto: ProductoCatalogo | null): string {
  const nombreProducto = producto?.nombre ?? "Producto pendiente de selección";
  const contacto = datos.email.trim() || `Teléfono: ${datos.telefono.trim()}`;

  return [
    "Consulta de encargo · La Botica de la Bruja Lore",
    `Nombre: ${datos.nombre.trim()}`,
    `Contacto: ${contacto}`,
    `Producto: ${nombreProducto}`,
    `Cantidad/Formato: ${datos.cantidad.trim() || "A convenir"}`,
    `Intención: ${datos.mensaje.trim()}`,
  ].join("\n");
}

function tieneContactoValido(email: string, telefono: string): boolean {
  return esEmailValido(email.trim()) || esTelefonoValido(telefono.trim());
}

function esEmailValido(email: string): boolean {
  if (!email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esTelefonoValido(telefono: string): boolean {
  const digitos = telefono.replace(/\D/g, "");
  return digitos.length >= 9;
}
