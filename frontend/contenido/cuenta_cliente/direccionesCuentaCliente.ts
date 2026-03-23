export type FormularioDireccionCuenta = {
  alias: string;
  nombre_destinatario: string;
  telefono_contacto: string;
  linea_1: string;
  linea_2: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais_iso: string;
};

export function construirFormularioDireccionVacio(): FormularioDireccionCuenta {
  return {
    alias: "",
    nombre_destinatario: "",
    telefono_contacto: "",
    linea_1: "",
    linea_2: "",
    codigo_postal: "",
    ciudad: "",
    provincia: "",
    pais_iso: "ES",
  };
}

export function descripcionEstadoVacioDirecciones(): string {
  return "Todavía no has guardado direcciones. Añade una dirección de entrega real para dejar tu cuenta preparada para el siguiente paso del checkout.";
}

export function resumenDireccion(valor: Pick<FormularioDireccionCuenta, "linea_1" | "linea_2" | "codigo_postal" | "ciudad" | "provincia" | "pais_iso">): string {
  return [valor.linea_1, valor.linea_2, `${valor.codigo_postal} ${valor.ciudad}`.trim(), valor.provincia, valor.pais_iso]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" · ");
}
