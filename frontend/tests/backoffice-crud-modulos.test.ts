import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("cada pestaña admin monta CRUD contextual con importación y exportación", () => {
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
  assert.match(componente, /Columnas obligatorias/);
  assert.match(componente, /Staging por filas/);
  assert.match(componente, /Confirmar/);
  assert.match(componente, /Revalidar/);
  assert.match(componente, /Adjuntar\/Reemplazar imagen/);
  assert.match(componente, /Eliminar imagen/);
  assert.match(componente, /Descartar/);
  assert.match(componente, /Descargar plantilla CSV/);
  assert.match(componente, /Descargar plantilla XLSX/);
  assert.match(componente, /Exportar inventario CSV/);
  assert.match(componente, /Exportar inventario XLSX/);
});

test("listado de registros mantiene edición por diálogo y publicar/despublicar", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(componente, /setRegistroEdicion\(\{ \.\.\.item \}\)/);
  assert.match(componente, /role="dialog"/);
  assert.match(componente, /Cerrar/);
  assert.match(componente, /cambiarPublicacionAdmin/);
  assert.match(componente, /\? "Despublicar" : "Publicar"/);
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

test("regresión: módulo contextual no contiene JSX inválido en staging", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.doesNotMatch(componente, /<\/td>\s*<\/td>/);
});
