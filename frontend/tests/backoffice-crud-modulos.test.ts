import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("módulos admin integran alta manual + importación + exportación contextual", () => {
  const productos = readFileSync("app/admin/(panel)/productos/page.tsx", "utf8");
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const editorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");
  const secciones = readFileSync("app/admin/(panel)/secciones/page.tsx", "utf8");
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(productos, /ModuloProductosAdmin/);
  assert.match(rituales, /ModuloCrudContextualAdmin/);
  assert.match(editorial, /ModuloCrudContextualAdmin/);
  assert.match(secciones, /ModuloCrudContextualAdmin/);
  assert.match(componente, /Importación contextual/);
  assert.match(componente, /Descargar plantilla CSV/);
  assert.match(componente, /Exportar inventario XLSX/);
});

test("pantalla /admin/importacion usa el módulo real de importación", () => {
  const pagina = readFileSync("app/admin/(panel)/importacion/page.tsx", "utf8");
  const componente = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");
  assert.match(pagina, /ModuloImportacionAdmin/);
  assert.match(componente, /Confirmar filas seleccionadas/);
  assert.match(componente, /Revalidar lote/);
  assert.match(componente, /Arrastra imagen o selecciona/);
  assert.match(componente, /Exportar inventario XLSX/);
});
