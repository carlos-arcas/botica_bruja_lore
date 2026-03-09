import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  ENLACES_FOOTER,
  NAVEGACION_PRINCIPAL,
  construirTextoContadorCesta,
  debeMostrarContadorCesta,
  esRutaActiva,
} from "../contenido/shell/navegacionGlobal";

test("navegación principal expone accesos comerciales clave", () => {
  const rutas = NAVEGACION_PRINCIPAL.map((enlace) => enlace.href);

  assert.deepEqual(rutas, ["/", "/colecciones", "/la-botica", "/cesta", "/encargo"]);
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
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/condiciones-encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/envios-y-preparacion"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/privacidad"), true);

});
