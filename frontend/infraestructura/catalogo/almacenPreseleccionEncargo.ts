import {
  ItemEncargoPreseleccionado,
  deserializarItemsEncargo,
  serializarItemsEncargo,
} from "@/contenido/catalogo/cestaRitual";

export const CLAVE_PRESELECCION_ENCARGO = "botica:encargo-preseleccion";

export function leerPreseleccionEncargoLocal(): ItemEncargoPreseleccionado[] {
  if (!esEntornoNavegador()) {
    return [];
  }

  return deserializarItemsEncargo(
    window.sessionStorage.getItem(CLAVE_PRESELECCION_ENCARGO),
  );
}

export function guardarPreseleccionEncargoLocal(
  items: ItemEncargoPreseleccionado[],
): void {
  if (!esEntornoNavegador()) {
    return;
  }

  if (items.length === 0) {
    limpiarPreseleccionEncargoLocal();
    return;
  }

  window.sessionStorage.setItem(
    CLAVE_PRESELECCION_ENCARGO,
    serializarItemsEncargo(items),
  );
}

export function limpiarPreseleccionEncargoLocal(): void {
  if (!esEntornoNavegador()) {
    return;
  }

  window.sessionStorage.removeItem(CLAVE_PRESELECCION_ENCARGO);
}

function esEntornoNavegador(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}
