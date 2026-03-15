import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("cada pestaña admin monta CRUD contextual con herramientas secundarias", () => {
  const productos = readFileSync("app/admin/(panel)/productos/page.tsx", "utf8");
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const editorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");
  const secciones = readFileSync("app/admin/(panel)/secciones/page.tsx", "utf8");
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(productos, /ModuloProductosAdmin/);
  assert.match(rituales, /ModuloCrudContextualAdmin/);
  assert.match(editorial, /ModuloCrudContextualAdmin/);
  assert.match(secciones, /ModuloCrudContextualAdmin/);

  assert.match(componente, /Herramientas/);
  assert.match(componente, /className="admin-disposicion-crud"/);
  assert.match(componente, /className="admin-columna-herramientas"/);
  assert.match(componente, />Importar<\/button>/);
  assert.match(componente, /plantilla CSV/i);
  assert.match(componente, /plantilla XLSX/i);
  assert.match(componente, /inventario CSV/i);
  assert.match(componente, /inventario XLSX/i);
});

test("importación abre diálogo grande y mantiene staging por filas", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const tablaStaging = readFileSync("componentes/admin/TablaStagingImportacion.tsx", "utf8");

  assert.match(componente, /setImportacionAbierta\(true\)/);
  assert.match(componente, /admin-modal--grande/);
  assert.match(componente, /Columnas obligatorias/);
  assert.match(componente, /Confirmar lote seleccionado/);
  assert.match(componente, /Revalidar lote/);
  assert.match(tablaStaging, /Staging por filas/);
  assert.match(tablaStaging, /Adjuntar\/Reemplazar imagen/);
  assert.match(tablaStaging, /Eliminar imagen/);
  assert.match(tablaStaging, /Descartar/);
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


test("naming editorial del admin evita jerga interna en labels visibles", () => {
  const paginaEditorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");
  const moduloImportacion = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");

  assert.doesNotMatch(paginaEditorial, /Sección pública/);
  assert.match(paginaEditorial, /Dónde se mostrará/);
  assert.doesNotMatch(paginaEditorial, /titulo="Editorial"/);
  assert.match(paginaEditorial, /titulo="Artículos"/);
  assert.doesNotMatch(moduloImportacion, /<option value="articulos_editoriales">Editorial<\/option>/);
  assert.match(moduloImportacion, /<option value="articulos_editoriales">Artículos<\/option>/);
});


test("regresión módulos: productos, rituales, artículos y categorías siguen usando CRUD contextual", () => {
  const productos = readFileSync("app/admin/(panel)/productos/page.tsx", "utf8");
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const editorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");
  const secciones = readFileSync("app/admin/(panel)/secciones/page.tsx", "utf8");

  assert.match(productos, /ModuloProductosAdmin/);
  assert.match(rituales, /titulo="Rituales"/);
  assert.match(editorial, /titulo="Artículos"/);
  assert.match(secciones, /titulo="Categorías de catálogo"/);
});
