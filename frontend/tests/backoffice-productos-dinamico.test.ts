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
  assert.match(componente, /<select value=\{String\(formAlta\[contextoFormulario\.clave\]/);
});

test("flujo normal no expone campos id y slug editables", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.doesNotMatch(modulo, /clave:\s*"slug"/);
  assert.doesNotMatch(modulo, /clave:\s*"id"/);
});

test("listado de productos se renderiza al final y exportación encima", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const indiceAlta = componente.indexOf("Alta / edición manual");
  const indiceImportacion = componente.indexOf("Importación");
  const indiceExportacion = componente.indexOf("Exportación contextual");
  const indiceListado = componente.indexOf("Registros existentes");

  assert.ok(indiceAlta < indiceImportacion);
  assert.ok(indiceImportacion < indiceExportacion);
  assert.ok(indiceExportacion < indiceListado);
});
