import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { obtenerEnlacesAdminVisibles } from "../componentes/admin/enlacesAdmin";

test("topbar muestra navegación administrativa sin sidebar", () => {
  const layout = readFileSync("app/admin/(panel)/layout.tsx", "utf8");
  assert.doesNotMatch(layout, /admin-grid/);
  assert.match(layout, /NavegacionLateralAdmin/);
});

test("enlace visible de Rituales en topbar apunta a /admin/rituales", () => {
  const rituales = obtenerEnlacesAdminVisibles("topbar").find((modulo) => modulo.clave === "rituales");

  assert.ok(rituales);
  assert.equal(rituales?.href, "/admin/rituales");
  assert.notEqual(rituales?.href, "/admin/productos");
});

test("topbar respeta naming humano y muestra módulos obligatorios", () => {
  const topbar = obtenerEnlacesAdminVisibles("topbar");
  assert.equal(topbar.some((modulo) => modulo.clave === "importacion"), false);
  assert.equal(topbar.some((modulo) => modulo.etiqueta === "Artículos"), true);
  assert.equal(topbar.some((modulo) => modulo.etiqueta === "Categorías de catálogo"), true);
  assert.equal(topbar.some((modulo) => modulo.etiqueta === "Imágenes"), true);
  assert.equal(topbar.some((modulo) => modulo.etiqueta === "Ajustes"), true);
});

test("topbar marca módulo activo mediante aria-current y clase activa", () => {
  const nav = readFileSync("componentes/admin/NavegacionLateralAdmin.tsx", "utf8");

  assert.match(nav, /aria-current=\{activo \? "page" : undefined\}/);
  assert.match(nav, /admin-nav-link--activo/);
});
