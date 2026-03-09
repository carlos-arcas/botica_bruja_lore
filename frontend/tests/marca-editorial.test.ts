import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  CTA_CIERRE_MARCA,
  FAQ_MARCA,
  HERO_MARCA,
  PASOS_CURADURIA,
  PRINCIPIOS_CASA,
} from "../contenido/marca/contenidoMarcaBotica";

test("contenido editorial de marca mantiene bloques comerciales mínimos", () => {
  assert.equal(HERO_MARCA.ctaPrincipal.href, "/colecciones");
  assert.equal(HERO_MARCA.ctaSecundaria.href, "/encargo");
  assert.equal(PASOS_CURADURIA.length >= 3, true);
  assert.equal(PRINCIPIOS_CASA.length >= 6, true);
  assert.equal(FAQ_MARCA.length >= 3, true);
});

test("cta final conecta con catálogo y encargo", () => {
  const rutas = CTA_CIERRE_MARCA.ctas.map((item) => item.href);

  assert.deepEqual(rutas, ["/colecciones", "/encargo"]);
});
