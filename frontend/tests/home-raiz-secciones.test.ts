import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  obtenerSeccionesPrincipalesOrdenadas,
  SECCIONES_PRINCIPALES,
} from "../contenido/home/seccionesPrincipales";

const RUTAS_ESPERADAS = [
  "/botica-natural",
  "/velas-e-incienso",
  "/minerales-y-energia",
  "/herramientas-esotericas",
  "/tarot",
  "/rituales",
  "/agenda-mistica",
];

test("la home define exactamente 7 cards en orden obligatorio", () => {
  const secciones = obtenerSeccionesPrincipalesOrdenadas();

  assert.equal(secciones.length, 7);
  assert.deepEqual(
    secciones.map((seccion) => seccion.id),
    [
      "botica-natural",
      "velas-e-incienso",
      "minerales-y-energia",
      "herramientas-esotericas",
      "tarot",
      "rituales",
      "agenda-mistica",
    ],
  );
});

test("cada card navega a su ruta principal correcta", () => {
  const secciones = obtenerSeccionesPrincipalesOrdenadas();

  assert.deepEqual(
    secciones.map((seccion) => seccion.ruta),
    RUTAS_ESPERADAS,
  );
});

test("el contrato card -> hero está centralizado y consistente", () => {
  assert.equal(SECCIONES_PRINCIPALES.length, 7);

  for (const seccion of SECCIONES_PRINCIPALES) {
    assert.equal(seccion.imagenCard.endsWith("_card.webp"), true);
    assert.equal(seccion.imagenHero.endsWith("_hero.webp"), true);
    assert.equal(seccion.imagenCard.includes(seccion.id.replace(/-/g, "_")), true);
    assert.equal(seccion.imagenHero.includes(seccion.id.replace(/-/g, "_")), true);
  }
});

test("la home raíz solo compone hero principal + rejilla de secciones", () => {
  const pagina = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");

  assert.equal(pagina.includes("<HeroPortada />"), true);
  assert.equal(pagina.includes("<RejillaSeccionesPrincipales />"), true);
  assert.equal(pagina.includes("<ContextoEditorialHome />"), false);
  assert.equal(pagina.includes("<FaqHome />"), false);
  assert.equal(pagina.includes("<CtaFinalHome />"), false);
});

test("las páginas de sección usan su hero correspondiente", () => {
  const tarot = readFileSync(join(process.cwd(), "app/tarot/page.tsx"), "utf8");
  const rituales = readFileSync(join(process.cwd(), "app/rituales/page.tsx"), "utf8");
  const botica = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");

  assert.equal(tarot.includes('idSeccion="tarot"'), true);
  assert.equal(rituales.includes('idSeccion="rituales"'), true);
  assert.equal(botica.includes('idSeccion="botica-natural"'), true);
});
