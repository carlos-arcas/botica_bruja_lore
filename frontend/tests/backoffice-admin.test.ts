import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { obtenerEstadoBackoffice, obtenerProductosAdmin } from "../infraestructura/api/backoffice";

test("renderiza rutas principales del backoffice en App Router", () => {
  const dashboard = readFileSync("app/admin/page.tsx", "utf8");
  const productos = readFileSync("app/admin/productos/page.tsx", "utf8");

  assert.match(dashboard, /Admin \/ Dashboard/);
  assert.match(productos, /Admin \/ Productos/);
});

test("estado backoffice resuelve denegado cuando backend devuelve 403", async () => {
  globalThis.fetch = (async () => ({ status: 403, ok: false })) as unknown as typeof fetch;

  const estado = await obtenerEstadoBackoffice("sessionid=abc");

  assert.equal(estado.estado, "denegado");
});

test("listado productos soporta estado vacío", async () => {
  globalThis.fetch = (async () => ({
    status: 200,
    ok: true,
    json: async () => ({ productos: [], metricas: { total: 0, publicados: 0, borrador: 0 } }),
  })) as unknown as typeof fetch;

  const resultado = await obtenerProductosAdmin(new URLSearchParams(), "sessionid=abc");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.productos.length, 0);
  }
});

test("listado productos maneja estado error", async () => {
  globalThis.fetch = (async () => ({ status: 500, ok: false })) as unknown as typeof fetch;

  const resultado = await obtenerProductosAdmin(new URLSearchParams(), "sessionid=abc");

  assert.equal(resultado.estado, "error");
});
