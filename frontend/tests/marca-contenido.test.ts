import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  CTA_MARCA,
  FAQ_MARCA,
  HERO_MARCA,
  MANIFIESTO_BOTICA,
  METADATA_LA_BOTICA,
  PASOS_CURADURIA,
  PRINCIPIOS_BOTICA,
} from "../contenido/marca/contenidoMarca";

test("contenido editorial de marca expone bloques mínimos del recorrido", () => {
  assert.equal(HERO_MARCA.acciones.length, 2);
  assert.equal(PASOS_CURADURIA.length >= 4, true);
  assert.equal(PRINCIPIOS_BOTICA.length >= 6, true);
  assert.equal(FAQ_MARCA.length >= 3, true);
  assert.equal(MANIFIESTO_BOTICA.length >= 3, true);
});

test("cta de marca conecta con rutas indexables del catálogo", () => {
  assert.equal(CTA_MARCA.primaria.href, "/colecciones");
  assert.equal(CTA_MARCA.secundaria.href, "/rituales");
});

test("hero y metadata mantienen narrativa y destino comercial", () => {
  assert.equal(HERO_MARCA.acciones[0].href, "/colecciones");
  assert.equal(HERO_MARCA.acciones[1].href, "/hierbas");
  assert.equal(METADATA_LA_BOTICA.title.includes("La Botica"), true);
  assert.equal(METADATA_LA_BOTICA.description.includes("colecciones"), true);
});
