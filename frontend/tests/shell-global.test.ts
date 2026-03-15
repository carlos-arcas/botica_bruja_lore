import * as assert from "node:assert/strict";
import { test } from "node:test";

import { readFileSync } from "node:fs";

import {
  ENLACES_FOOTER,
  ETIQUETA_ENLACE_ADMIN_CABECERA,
  NAVEGACION_PRINCIPAL,
  construirTextoContadorCesta,
  debeMostrarContadorCesta,
  esRutaActiva,
} from "../contenido/shell/navegacionGlobal";

test("navegación principal expone accesos comerciales clave", () => {
  const rutas = NAVEGACION_PRINCIPAL.map((enlace) => enlace.href);

  assert.equal(rutas.includes("/"), true);
  assert.equal(rutas.includes("/colecciones"), true);
  assert.equal(rutas.includes("/la-botica"), true);
  assert.equal(rutas.includes("/guias"), true);
  assert.equal(rutas.includes("/tarot"), true);
  assert.equal(rutas.includes("/encargo"), true);
});

test("esRutaActiva resuelve coincidencia exacta y por prefijo", () => {
  const colecciones = NAVEGACION_PRINCIPAL[1]!;
  const inicio = NAVEGACION_PRINCIPAL[0]!;

  const laBotica = NAVEGACION_PRINCIPAL[2]!;

  assert.equal(esRutaActiva("/colecciones", colecciones), true);
  assert.equal(esRutaActiva("/colecciones/kit-luna", colecciones), true);
  assert.equal(esRutaActiva("/", inicio), true);
  assert.equal(esRutaActiva("/rituales", inicio), false);
  assert.equal(esRutaActiva("/la-botica", laBotica), true);
  assert.equal(esRutaActiva("/la-botica/historia", laBotica), false);
});

test("contador de cesta muestra fallback correcto", () => {
  assert.equal(debeMostrarContadorCesta(0), false);
  assert.equal(debeMostrarContadorCesta(3), true);
  assert.equal(construirTextoContadorCesta(1), "1 unidad en cesta");
  assert.equal(construirTextoContadorCesta(2), "2 unidades en cesta");
});

test("footer mantiene enlaces de continuidad editorial-comercial", () => {
  assert.equal(ENLACES_FOOTER.length >= 8, true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/la-botica"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/tarot"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/calendario-ritual"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/condiciones-encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/envios-y-preparacion"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/privacidad"), true);
});

test("cabecera comercial apunta al backoffice interno /admin", () => {
  const cabecera = readFileSync("componentes/shell/CabeceraComercial.tsx", "utf-8");

  assert.match(cabecera, /href="\/admin"/);
  assert.equal(ETIQUETA_ENLACE_ADMIN_CABECERA.length > 0, true);
});


test("navbar comercial define estado activo visible y patrón editorial", () => {
  const componente = readFileSync("componentes/shell/NavegacionPrincipal.tsx", "utf-8");
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(componente, /aria-current=\{activa \? "page" : undefined\}/);
  assert.match(estilos, /\.enlaceActiva/);
  assert.match(estilos, /\.navegacion ul/);
  assert.match(estilos, /repeating-linear-gradient/);
  assert.match(estilos, /\.enlaceActiva::after/);
});

test("navbar comercial mantiene estados hover y focus visibles", () => {
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(estilos, /\.enlace:hover/);
  assert.match(estilos, /\.enlace:focus-visible/);
  assert.match(estilos, /outline: 2px solid/);
});

test("navbar comercial conserva estructura responsive para móvil", () => {
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(estilos, /@media \(max-width: 780px\)/);
  assert.match(estilos, /\.navegacion ul \{[\s\S]*width: 100%/);
  assert.match(estilos, /\.enlace \{[\s\S]*font-size: 0\.9rem/);
});
