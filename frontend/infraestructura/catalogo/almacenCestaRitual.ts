import { CestaRitual, crearCestaVacia, deserializarCesta, serializarCesta } from "@/contenido/catalogo/cestaRitual";

export const CLAVE_CESTA_RITUAL = "botica:cesta-ritual";
export const EVENTO_CESTA_RITUAL = "cesta-ritual:actualizada";

export function leerCestaRitualLocal(): CestaRitual {
  if (!esEntornoNavegador()) {
    return crearCestaVacia();
  }

  return deserializarCesta(window.localStorage.getItem(CLAVE_CESTA_RITUAL));
}

export function guardarCestaRitualLocal(cesta: CestaRitual): void {
  if (!esEntornoNavegador()) {
    return;
  }

  window.localStorage.setItem(CLAVE_CESTA_RITUAL, serializarCesta(cesta));
  window.dispatchEvent(new Event(EVENTO_CESTA_RITUAL));
}

export function limpiarCestaRitualLocal(): void {
  if (!esEntornoNavegador()) {
    return;
  }

  window.localStorage.removeItem(CLAVE_CESTA_RITUAL);
  window.dispatchEvent(new Event(EVENTO_CESTA_RITUAL));
}

function esEntornoNavegador(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
