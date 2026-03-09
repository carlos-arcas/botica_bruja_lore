import * as assert from "node:assert/strict";
import { test } from "node:test";

import { construirEstadoContadorCesta } from "../contenido/shell/cestaGlobal";
import { ENLACES_FOOTER, NAVEGACION_GLOBAL, esRutaActiva } from "../contenido/shell/navegacionGlobal";

test("esRutaActiva marca inicio solo en la ruta exacta", () => {
  assert.equal(esRutaActiva("/", "/"), true);
  assert.equal(esRutaActiva("/colecciones", "/"), false);
});

test("esRutaActiva soporta rutas hijas para navegación principal", () => {
  assert.equal(esRutaActiva("/colecciones/bruma-lavanda", "/colecciones"), true);
  assert.equal(esRutaActiva("/encargo", "/colecciones"), false);
});

test("contador de cesta usa fallback textual cuando no hay unidades", () => {
  const estado = construirEstadoContadorCesta(0);

  assert.equal(estado.total, 0);
  assert.equal(estado.etiquetaVisual, "vacía");
  assert.equal(estado.ariaLabel, "Cesta ritual vacía");
});

test("contador de cesta comunica unidades cuando hay selección", () => {
  const estado = construirEstadoContadorCesta(3);

  assert.equal(estado.etiquetaVisual, "3");
  assert.match(estado.ariaLabel, /3 unidades en cesta ritual/);
});

test("navegación y footer global conservan rutas públicas clave", () => {
  assert.equal(NAVEGACION_GLOBAL.some((enlace) => enlace.href === "/cesta"), true);
  assert.equal(NAVEGACION_GLOBAL.some((enlace) => enlace.href === "/encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/colecciones"), true);
});
