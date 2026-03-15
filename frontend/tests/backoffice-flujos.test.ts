import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  adjuntarImagenFilaImportacion,
  cambiarPublicacionAdmin,
  cambiarSeleccionFilaImportacion,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarExportacionAdmin,
  eliminarImagenFilaImportacion,
  guardarRegistroAdmin,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
  subirImagenBackoffice,
} from "../infraestructura/api/backoffice";

test("submit real de alta usa endpoint guardar y devuelve item", async () => {
  let url = "";
  let method = "";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
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
  assert.match(componente, /setRegistroEdicion\(\{ \.\.\.item \}\)/);
  assert.match(componente, /<BloqueCampos key=\{`editar-\$\{grupo.id\}`\} grupo=\{grupo\} formulario=\{registroEdicion\}/);
  assert.match(componente, /role="dialog"/);
  assert.match(componente, /cambiarPublicacionAdmin/);
  assert.match(componente, /Registros existentes/);
});

test("feedback de éxito y error se informa en UI para alta, edición e importación", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /Registro guardado\./);
  assert.match(componente, /Cambios guardados\./);
  assert.match(componente, /Lote cargado\. Revisa filas antes de confirmar\./);
  assert.match(componente, /Lote confirmado\. Filas aplicadas:/);
  assert.match(componente, /No se pudo guardar el registro\./);
  assert.match(componente, /No se pudo guardar la edición\./);
  assert.match(componente, /No se pudo cargar el lote de importación\./);
});

test("publish/unpublish llama endpoint de publicación", async () => {
  let url = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    url = String(input);
    return { ok: true, json: async () => ({ item: { id: "x", publicado: true } }) } as Response;
  }) as unknown as typeof fetch;

  const item = await cambiarPublicacionAdmin("editorial", 9, true, "token");

  assert.match(url, /\/api\/v1\/backoffice\/editorial\/9\/publicacion\/$/);
  assert.equal(item.publicado, true);
});

test("submit de alta propaga errores backend cuando guardar falla", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 500, json: async () => ({}) }) as Response) as unknown as typeof fetch;
  await assert.rejects(() => guardarRegistroAdmin("productos", { nombre: "fallido" }, "token"), /No se pudo guardar/);
});

test("flujo de importación confirmada: crear lote, consultar y confirmar", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
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

test("importación permite revalidar, seleccionar, descartar y gestionar imagen por fila", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    llamadas.push(url);
    const method = String(init?.method ?? "GET");
    if (url.includes("/revalidar/")) return { ok: true, json: async () => ({ revalidado: true }) } as Response;
    if (url.includes("/seleccion/")) return { ok: true, json: async () => ({ fila: { id: 9, seleccionado: true } }) } as Response;
    if (url.includes("/descartar/")) return { ok: true, json: async () => ({ fila: { id: 9, estado: "descartada" } }) } as Response;
    if (url.includes("/imagen/eliminar/")) return { ok: true, json: async () => ({ fila: { id: 9, imagen: "" } }) } as Response;
    if (url.endsWith("/imagen/")) return { ok: true, json: async () => ({ fila: { id: 9, imagen: "https://cdn.test/ok.webp" } }) } as Response;
    return { ok: method === "POST", json: async () => ({}) } as Response;
  }) as unknown as typeof fetch;

  await revalidarLoteImportacion(10, "token");
  await cambiarSeleccionFilaImportacion(10, 9, true, "token");
  await descartarFilaImportacion(10, 9, "token");
  await adjuntarImagenFilaImportacion(10, 9, new File(["x"], "foto.png", { type: "image/png" }), "token");
  await eliminarImagenFilaImportacion(10, 9, "token");

  assert.equal(llamadas.length, 5);
  assert.match(llamadas.join("\n"), /\/revalidar\//);
  assert.match(llamadas.join("\n"), /\/seleccion\//);
  assert.match(llamadas.join("\n"), /\/descartar\//);
  assert.match(llamadas.join("\n"), /\/imagen\//);
});

test("exportación por módulo usa endpoint contextual", async () => {
  let url = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    url = String(input);
    return { ok: true, blob: async () => new Blob(["ok"], { type: "text/csv" }) } as Response;
  }) as unknown as typeof fetch;

  await descargarExportacionAdmin("productos", "inventario", "csv", "token", "botica-natural");
  assert.match(url, /\/api\/v1\/backoffice\/productos\/exportar\/\?tipo=inventario&formato=csv&seccion=botica-natural/);
});


test("ui de importación valida columnas faltantes y muestra mensaje claro", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /Faltan columnas obligatorias/);
  assert.match(componente, /columnasObligatoriasImportacion/);
});


test("subida de imagen manual usa endpoint de backoffice y reporta url", async () => {
  let url = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    url = String(input);
    return { ok: true, json: async () => ({ imagen_url: "https://cdn.test/demo.webp" }) } as Response;
  }) as unknown as typeof fetch;

  const imagen = await subirImagenBackoffice(new File(["x"], "demo.png", { type: "image/png" }), "backoffice/productos", "token");

  assert.match(url, /\/api\/v1\/backoffice\/imagenes\/subir\/$/);
  assert.equal(imagen, "https://cdn.test/demo.webp");
});

test("formulario usa componente visual de imagen en alta y edición", () => {
  const modulo = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const campoImagen = readFileSync("componentes/admin/CampoImagenAdmin.tsx", "utf8");

  assert.match(modulo, /controlImagenAlta/);
  assert.match(modulo, /controlImagenEdicion/);
  assert.match(modulo, /subirImagenBackoffice/);
  assert.match(modulo, /controlImagen=\{campo\.clave/);
  assert.match(campoImagen, /Arrastra una imagen aquí/);
  assert.match(campoImagen, /o selecciónala desde tu PC/);
  assert.match(campoImagen, /Reemplazar/);
  assert.match(campoImagen, /Quitar/);
});
