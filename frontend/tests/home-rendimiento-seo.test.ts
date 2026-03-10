import * as assert from "node:assert/strict";
import { test } from "node:test";

import { CONFIGURACION_IMAGEN_HERO } from "../componentes/home/configuracionImagenHero";

test("la imagen hero define sizes responsive para LCP", () => {
  assert.equal(CONFIGURACION_IMAGEN_HERO.sizes, "(max-width: 640px) 92vw, 980px");
});

test("la imagen hero sigue usando el asset oficial existente", () => {
  assert.equal(CONFIGURACION_IMAGEN_HERO.src, "/fondos/Fondo_Hero.webp");
});
