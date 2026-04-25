import { DireccionCuentaCliente } from "../../infraestructura/api/cuentasCliente";

import { DatosCheckoutReal, ModoDireccionCheckoutReal } from "./checkoutReal";

export function resolverModoDireccionInicialCheckoutReal(
  direcciones: DireccionCuentaCliente[],
): ModoDireccionCheckoutReal {
  return direcciones.length > 0 ? "guardada" : "manual";
}

export function resolverDireccionPredeterminadaCheckoutReal(
  direcciones: DireccionCuentaCliente[],
): DireccionCuentaCliente | null {
  return direcciones.find((direccion) => direccion.predeterminada) ?? direcciones[0] ?? null;
}

export function aplicarDireccionGuardadaADatosCheckoutReal(
  datos: DatosCheckoutReal,
  direccion: DireccionCuentaCliente | null,
): DatosCheckoutReal {
  if (!direccion) {
    return { ...datos, id_direccion_guardada: "", modo_direccion: "manual" };
  }
  return {
    ...datos,
    modo_direccion: "guardada",
    id_direccion_guardada: direccion.id_direccion,
    nombre_contacto: datos.nombre_contacto.trim() || direccion.nombre_destinatario,
    telefono_contacto: direccion.telefono_contacto,
    nombre_destinatario: direccion.nombre_destinatario,
    linea_1: direccion.linea_1,
    linea_2: direccion.linea_2,
    codigo_postal: direccion.codigo_postal,
    ciudad: direccion.ciudad,
    provincia: direccion.provincia,
    pais_iso: direccion.pais_iso,
  };
}
