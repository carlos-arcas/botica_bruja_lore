import * as assert from "node:assert/strict";
import { test } from "node:test";

import { INTENCIONES_DESTACADAS } from "../contenido/home/contenidoHome";
import { alternarPreguntaFaq, resolverIntencionActiva } from "../componentes/home/interaccionesHome";

test("resolverIntencionActiva devuelve la seleccionada", () => {
  const activa = resolverIntencionActiva("calma", INTENCIONES_DESTACADAS);
  assert.equal(activa.id, "calma");
});

test("resolverIntencionActiva usa fallback a la primera", () => {
  const activa = resolverIntencionActiva("no-existe", INTENCIONES_DESTACADAS);
  assert.equal(activa.id, INTENCIONES_DESTACADAS[0].id);
});

test("alternarPreguntaFaq abre y cierra la misma pregunta", () => {
  const pregunta = "¿Necesito experiencia previa para empezar un ritual?";
  const abierta = alternarPreguntaFaq("", pregunta);
  const cerrada = alternarPreguntaFaq(abierta, pregunta);

  assert.equal(abierta, pregunta);
  assert.equal(cerrada, "");
});
