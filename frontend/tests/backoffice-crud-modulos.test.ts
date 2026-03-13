import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("módulos admin implementan CRUD real y no plantilla pendiente", () => {
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const editorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");
  const secciones = readFileSync("app/admin/(panel)/secciones/page.tsx", "utf8");
  const componente = readFileSync("componentes/admin/ModuloCrudAdmin.tsx", "utf8");

  assert.match(rituales, /ModuloCrudAdmin/);
  assert.match(editorial, /ModuloCrudAdmin/);
  assert.match(secciones, /ModuloCrudAdmin/);
  assert.match(componente, /Guardar/);
  assert.match(componente, /Publicar/);
  assert.doesNotMatch(rituales, /Módulo preparado/);
});

test("importación admin tiene staging y confirmación", () => {
  const pagina = readFileSync("app/admin/(panel)/importacion/page.tsx", "utf8");
  const modulo = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");

  assert.match(modulo, /Validar archivo/);
  assert.match(modulo, /Confirmar filas válidas/);
  assert.match(modulo, /crearLoteImportacion/);
  assert.match(modulo, /confirmarLoteImportacion/);
  assert.match(pagina, /ModuloImportacionAdmin/);
});
