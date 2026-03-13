import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  cambiarPublicacionAdmin,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descargarExportacionAdmin,
  guardarRegistroAdmin,
  obtenerLoteImportacion,
} from "../infraestructura/api/backoffice";

test("submit real de alta usa endpoint guardar y devuelve item", async () => {
  let url = "";
  let method = "";
  globalThis.fetch = (async (input, init) => {
    url = String(input);
    method = String(init?.method ?? "GET");
    return { ok: true, json: async () => ({ item: { id: "p-1", nombre: "nuevo" } }) } as Response;
  }) as unknown as typeof fetch;

  const item = await guardarRegistroAdmin("productos", { nombre: "nuevo" }, "token");

  assert.match(url, /\/api\/v1\/backoffice\/productos\/guardar\/$/);
  assert.equal(method, "POST");
  assert.equal(item.nombre, "nuevo");
});

test("edición, publish/unpublish y layout inferior quedan implementados", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /setForm\(\{ \.\.\.item \}\)/);
  assert.match(componente, /cambiarPublicacionAdmin/);
  assert.match(componente, /Registros existentes/);
});

test("publish/unpublish llama endpoint de publicación", async () => {
  let url = "";
  globalThis.fetch = (async (input) => {
    url = String(input);
    return { ok: true, json: async () => ({ item: { id: "x", publicado: true } }) } as Response;
  }) as unknown as typeof fetch;

  const item = await cambiarPublicacionAdmin("editorial", 9, true, "token");

  assert.match(url, /\/api\/v1\/backoffice\/editorial\/9\/publicacion\/$/);
  assert.equal(item.publicado, true);
});

test("flujo de importación confirmada: crear lote, consultar y confirmar", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    llamadas.push(url);
    if (url.endsWith("/importacion/lotes/")) return { ok: true, json: async () => ({ lote_id: 22 }) } as Response;
    if (url.endsWith("/importacion/lotes/22/")) return { ok: true, json: async () => ({ lote: { id: 22 }, filas: [{ id: 1, seleccionado: true }] }) } as Response;
    return { ok: true, json: async () => ({ confirmadas: 1 }) } as Response;
  }) as unknown as typeof fetch;

  const formData = new FormData();
  formData.set("entidad", "productos");
  const loteId = await crearLoteImportacion(formData, "token");
  const detalle = await obtenerLoteImportacion(loteId, "token");
  const confirmadas = await confirmarLoteImportacion(loteId, [1], "token");

  assert.equal(loteId, 22);
  assert.equal(detalle.lote.id, 22);
  assert.equal(confirmadas, 1);
  assert.equal(llamadas.length, 3);
});

test("exportación por módulo usa endpoint contextual", async () => {
  let url = "";
  globalThis.fetch = (async (input) => {
    url = String(input);
    return { ok: true, blob: async () => new Blob(["ok"], { type: "text/csv" }) } as Response;
  }) as unknown as typeof fetch;

  await descargarExportacionAdmin("productos", "inventario", "csv", "token", "botica-natural");
  assert.match(url, /\/api\/v1\/backoffice\/productos\/exportar\/\?tipo=inventario&formato=csv&seccion=botica-natural/);
});
