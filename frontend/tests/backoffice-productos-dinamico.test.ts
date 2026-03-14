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
  assert.match(modulo, /contextoFormulario/);
  assert.match(modulo, /tipoPayload="productos"/);
  assert.match(modulo, /camposEspecificos=\{CAMPOS_POR_SECCION\[seccion\] \?\? \[\]\}/);
});

test("alta manual usa combobox humano de sección comercial", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(modulo, /etiqueta: "Sección comercial"/);
  assert.match(componente, /<select\s+value=\{String\(formAlta\[contextoFormulario\.clave\]/);
});

test("flujo normal no expone campos id y slug editables", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.doesNotMatch(modulo, /clave:\s*"slug"/);
  assert.doesNotMatch(modulo, /clave:\s*"id"/);
});

test("registros siguen debajo del formulario y herramientas quedan en lateral", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const indiceAlta = componente.indexOf("Alta / edición manual");
  const indiceListado = componente.indexOf("Registros existentes");
  const indiceHerramientas = componente.indexOf("Herramientas");

  assert.ok(indiceAlta >= 0);
  assert.ok(indiceListado > indiceAlta);
  assert.ok(indiceHerramientas >= 0);
  assert.match(componente, /admin-columna-principal/);
  assert.match(componente, /admin-columna-herramientas/);
  assert.doesNotMatch(componente, /<section className="admin-bloque">\s*<h3>Importación<\/h3>/);
});
