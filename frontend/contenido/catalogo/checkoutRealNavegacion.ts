import { ItemEncargoPreseleccionado } from "./cestaRitual";

export function construirRutaConsultaManualCheckoutReal(
  items: ItemEncargoPreseleccionado[],
): string {
  if (items.length === 0) {
    return "/encargo?origen=seleccion";
  }

  const params = new URLSearchParams({
    origen: "seleccion",
  });

  return `/encargo?${params.toString()}`;
}

export function construirRutaRevisionSeleccionCheckoutReal(
  _items: ItemEncargoPreseleccionado[],
): string {
  return "/cesta";
}
