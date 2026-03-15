import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Rituales y Artículos usan layout ancho sin panel lateral fijo", () => {
  const modulo = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const editorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");

  assert.match(modulo, /admin-disposicion-crud--ancha/);
  assert.match(modulo, /mostrarPanelHerramientas = false/);
  assert.equal(rituales.includes("mostrarPanelHerramientas"), false);
  assert.equal(editorial.includes("mostrarPanelHerramientas"), false);
});

test("Productos conserva formulario funcional y permite herramientas compactas", () => {
  const productos = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.match(productos, /mostrarPanelHerramientas/);
  assert.match(productos, /ModuloCrudContextualAdmin/);
});

test("Formato/peso usa combo con opción personalizada y campo condicional", () => {
  const productos = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  const moduloCrud = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(productos, /OPCIONES_FORMATO_PESO/);
  assert.match(productos, /Otro \/ personalizado/);
  assert.match(productos, /tipo_producto_personalizado/);
  assert.match(moduloCrud, /debeMostrarCampo/);
  assert.match(moduloCrud, /formulario\.tipo_producto \?\? ""\) === "personalizado"/);
});

test("botones principales del admin usan variantes visuales y no estilo navegador por defecto", () => {
  const login = readFileSync("componentes/admin/FormularioLoginBackoffice.tsx", "utf8");
  const logout = readFileSync("componentes/admin/BotonLogoutBackoffice.tsx", "utf8");
  const staging = readFileSync("componentes/admin/TablaStagingImportacion.tsx", "utf8");

  assert.match(login, /admin-boton admin-boton--primario/);
  assert.match(logout, /admin-boton admin-boton--secundario/);
  assert.match(staging, /admin-boton admin-boton--peligro/);
});

test("no regresión: navegación de Rituales y modales de edición/importación siguen presentes", () => {
  const nav = readFileSync("componentes/admin/enlacesAdmin.ts", "utf8");
  const modulo = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(nav, /"\/admin\/rituales"/);
  assert.match(modulo, /role="dialog"/);
  assert.match(modulo, /aria-label="Importar lote"/);
  assert.match(modulo, /aria-label="Editar registro"/);
});
