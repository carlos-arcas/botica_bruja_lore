import { IntencionRitual } from "../../contenido/home/contenidoHome";

export function resolverIntencionActiva(
  activa: string,
  disponibles: IntencionRitual[],
): IntencionRitual {
  return disponibles.find((item) => item.id === activa) ?? disponibles[0];
}

export function alternarPreguntaFaq(actual: string, pregunta: string): string {
  return actual === pregunta ? "" : pregunta;
}
