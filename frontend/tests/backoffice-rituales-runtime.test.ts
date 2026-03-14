import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { construirPayloadRitual, normalizarItemsRituales } from "../infraestructura/configuracion/adminRituales";
import { MODULOS_NAVEGACION_ADMIN, resolverHrefModuloAdmin } from "../infraestructura/configuracion/modulosAdmin";

test("navegación admin resuelve Rituales hacia /admin/rituales", () => {
  const moduloRituales = MODULOS_NAVEGACION_ADMIN.find((modulo) => modulo.clave === "rituales");

  assert.equal(moduloRituales?.href, "/admin/rituales");
  assert.equal(resolverHrefModuloAdmin("rituales"), "/admin/rituales");
  assert.notEqual(moduloRituales?.href, "/admin/productos");
});

test("página de rituales monta módulo correcto y no hereda configuración de productos", () => {
  const pagina = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");

  assert.match(pagina, /modulo="rituales"/);
  assert.doesNotMatch(pagina, /modulo="productos"/);
  assert.match(pagina, /tipoPayload="rituales"/);
  assert.doesNotMatch(pagina, /construirPayload=\{/);
});

test("componentes visibles del admin consumen navegación compartida sin hardcode de productos para Rituales", () => {
  const layout = readFileSync("app/admin/(panel)/layout.tsx", "utf8");
  const dashboard = readFileSync("app/admin/(panel)/page.tsx", "utf8");

  assert.match(layout, /obtenerEnlacesAdminVisibles\("sidebar"\)/);
  assert.match(dashboard, /obtenerEnlacesAdminVisibles\("tarjetas"\)/);
  assert.doesNotMatch(layout, /Rituales[^\n]*\/admin\/productos/);
  assert.doesNotMatch(dashboard, /Rituales[^\n]*\/admin\/productos/);
});

test("/admin/rituales no contiene redirección ni push hacia /admin/productos", () => {
  const pagina = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const middleware = readFileSync("middleware.ts", "utf8");

  assert.doesNotMatch(pagina, /redirect\(\s*["']\/admin\/productos["']\s*\)/);
  assert.doesNotMatch(pagina, /router\.push\(\s*["']\/admin\/productos["']\s*\)/);
  assert.doesNotMatch(middleware, /\/admin\/productos/);
});

test("normalización de rituales evita crash con shape parcial y conserva estado de publicación", () => {
  const [normalizado] = normalizarItemsRituales([
    { id: "rit-1", nombre: null, publicado: 1, intenciones_relacionadas: "limpieza, enfoque" },
  ]);

  assert.equal(normalizado.nombre, "");
  assert.equal(normalizado.publicado, true);
  assert.deepEqual(normalizado.intenciones_relacionadas, ["limpieza", "enfoque"]);
  assert.equal(normalizado.contexto_breve, "");
});

test("payload de ritual soporta alta/edición y homogeniza intenciones en lista", () => {
  const payloadAlta = construirPayloadRitual({
    nombre: "Ritual luna nueva",
    contexto_breve: "Preparación",
    intenciones_relacionadas: "claridad, proteccion",
    publicado: false,
  });

  assert.equal(payloadAlta.nombre, "Ritual luna nueva");
  assert.deepEqual(payloadAlta.intenciones_relacionadas, ["claridad", "proteccion"]);
  assert.equal(payloadAlta.publicado, false);

  const payloadEdicion = construirPayloadRitual({
    id: "rit-2",
    nombre: "Ritual editado",
    intenciones_relacionadas: ["orden", "calma"],
    publicado: true,
  });

  assert.equal(payloadEdicion.id, "rit-2");
  assert.deepEqual(payloadEdicion.intenciones_relacionadas, ["orden", "calma"]);
  assert.equal(payloadEdicion.publicado, true);
});

test("regresión de error de backend: la pantalla expone error controlado", () => {
  const pagina = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  assert.match(pagina, /No se pudieron cargar los rituales en este momento\./);
  assert.match(pagina, /errorInicial=\{errorInicial\}/);
});
