import * as assert from "node:assert/strict";
import { test } from "node:test";

import { obtenerEnlacesAdminVisibles } from "../componentes/admin/enlacesAdmin";

test("enlace visible de Rituales en sidebar apunta a /admin/rituales", () => {
  const rituales = obtenerEnlacesAdminVisibles("sidebar").find((modulo) => modulo.clave === "rituales");

  assert.ok(rituales);
  assert.equal(rituales?.href, "/admin/rituales");
  assert.notEqual(rituales?.href, "/admin/productos");
});

test("tarjetas de dashboard mantienen Rituales en su módulo correcto", () => {
  const tarjetas = obtenerEnlacesAdminVisibles("tarjetas");
  const rituales = tarjetas.find((modulo) => modulo.clave === "rituales");

  assert.ok(rituales);
  assert.equal(rituales?.href, "/admin/rituales");
  assert.equal(tarjetas.some((modulo) => modulo.clave === "imagenes"), false);
  assert.equal(tarjetas.some((modulo) => modulo.clave === "ajustes"), false);
});

test("normalización evita drift si configuración base de rituales muta", () => {
  const sidebar = obtenerEnlacesAdminVisibles("sidebar");
  const rituales = sidebar.find((modulo) => modulo.etiqueta === "Rituales");

  assert.ok(rituales);
  assert.equal(rituales?.href, "/admin/rituales");
});

test("sidebar no muestra importación masiva y usa naming humano unificado", () => {
  const sidebar = obtenerEnlacesAdminVisibles("sidebar");
  assert.equal(sidebar.some((modulo) => modulo.clave === "importacion"), false);
  assert.equal(sidebar.some((modulo) => modulo.etiqueta === "Editorial"), false);
  assert.equal(sidebar.some((modulo) => modulo.etiqueta === "Artículos"), true);
  assert.equal(sidebar.some((modulo) => modulo.etiqueta === "Colecciones web"), false);
  assert.equal(sidebar.some((modulo) => modulo.etiqueta === "Categorías de catálogo"), true);
});
