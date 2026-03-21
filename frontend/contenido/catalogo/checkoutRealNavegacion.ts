import {
  ItemEncargoPreseleccionado,
  serializarItemsEncargo,
} from "./cestaRitual";

export function construirRutaConsultaManualCheckoutReal(
  items: ItemEncargoPreseleccionado[],
): string {
  if (items.length === 0) {
    return "/encargo";
  }

  const params = new URLSearchParams({
    origen: "seleccion",
    cesta: serializarItemsEncargo(items),
  });

  return `/encargo?${params.toString()}`;
}

export function construirRutaRevisionSeleccionCheckoutReal(
  _items: ItemEncargoPreseleccionado[],
): string {
  return "/cesta";
}
