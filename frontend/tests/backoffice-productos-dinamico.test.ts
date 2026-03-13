import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("productos inicia por selección de sección y cambia formulario", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.match(modulo, /Selecciona sección/);
  assert.match(modulo, /Botica Natural/);
  assert.match(modulo, /Velas e Incienso/);
  assert.match(modulo, /CAMPOS_POR_SECCION/);
});

test("flujo normal no expone campos id y slug editables", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.doesNotMatch(modulo, /clave:\s*"slug"/);
  assert.doesNotMatch(modulo, /clave:\s*"id"/);
});
