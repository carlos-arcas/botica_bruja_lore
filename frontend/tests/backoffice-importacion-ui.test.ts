import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { MODULOS_NAVEGACION_ADMIN } from "../infraestructura/configuracion/modulosAdmin";

test("la ruta Next de importación masiva existe en el panel admin", () => {
  const page = readFileSync("app/admin/(panel)/importacion/page.tsx", "utf8");
  assert.match(page, /ModuloImportacionAdmin/);
});

test("la navegación moderna expone acceso a importación masiva", () => {
  const modulo = MODULOS_NAVEGACION_ADMIN.find((item) => item.clave === "importacion");
  assert.ok(modulo);
  assert.equal(modulo?.href, "/admin/importacion");
  assert.equal(modulo?.etiqueta, "Importación masiva");
});

test("la UI de importación renderiza estado vacío y estado con lote", () => {
  const componente = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");
  assert.match(componente, /Sin importación activa/);
  assert.match(componente, /Lote activo #/);
  assert.match(componente, /ResumenImportacionAdmin/);
  assert.match(componente, /TablaLoteImportacionAdmin/);
});

test("la UI expone acciones de lote y feedback coherente", () => {
  const componente = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");
  assert.match(componente, /Confirmar seleccionadas/);
  assert.match(componente, /Confirmar válidas/);
  assert.match(componente, /Revalidar lote/);
  assert.match(componente, /Cancelar importación/);
  assert.match(componente, /Lote validado en staging/);
});
