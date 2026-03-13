import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("productos inicia por selección de sección y cambia formulario", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.match(modulo, /Selecciona sección/);
  assert.match(modulo, /Botica Natural/);
  assert.match(modulo, /Velas e Incienso/);
  assert.match(modulo, /Minerales y Energía/);
  assert.match(modulo, /Herramientas Esotéricas/);
  assert.match(modulo, /CAMPOS_POR_SECCION/);
  assert.match(modulo, /camposEspecificos=\{CAMPOS_POR_SECCION\[seccion\] \?\? \[\]\}/);
});

test("flujo normal no expone campos id y slug editables", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.doesNotMatch(modulo, /clave:\s*"slug"/);
  assert.doesNotMatch(modulo, /clave:\s*"id"/);
});

test("listado de productos se renderiza debajo del bloque superior", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const indicePanel = componente.indexOf('className="admin-bloque admin-panel-superior"');
  const indiceListado = componente.indexOf("Registros existentes");

  assert.notEqual(indicePanel, -1);
  assert.notEqual(indiceListado, -1);
  assert.ok(indiceListado > indicePanel);
});
