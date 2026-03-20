import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

import {
  adjuntarImagenFilaImportacion,
  cambiarPublicacionAdmin,
  cambiarSeleccionFilaImportacion,
  cancelarLoteImportacion,
  confirmarLoteImportacion,
  confirmarValidasLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarExportacionAdmin,
  eliminarImagenFilaImportacion,
  guardarRegistroAdmin,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
  marcarPedidoPreparando,
  subirImagenBackoffice,
  resolverBaseBackoffice,
  obtenerPlantasAsociables,
} from "../infraestructura/api/backoffice";
import { validarFormularioProducto } from "../infraestructura/configuracion/validacionProductosBackoffice";


test("resuelve base de API para servidor y navegador", () => {
  assert.equal(resolverBaseBackoffice(false), "http://127.0.0.1:8000");
  assert.equal(resolverBaseBackoffice(true), "/api/backoffice/proxy");
});

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
  assert.match(componente, /setRegistroEdicion\(prepararRegistroEdicion\(modulo, campos, item\)\)/);
  assert.match(componente, /<BloqueCampos key=\{`editar-\$\{grupo.id\}`\} modulo=\{modulo\} grupo=\{grupo\} formulario=\{registroEdicion\}/);
  assert.match(componente, /role="dialog"/);
  assert.match(componente, /cambiarPublicacionAdmin/);
  assert.match(componente, /Registros existentes/);
  assert.match(componente, /useRouter/);
  assert.match(componente, /router\.refresh\(\)/);
});

test("feedback de éxito y error se informa en UI para alta, edición e importación", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /Registro guardado\./);
  assert.match(componente, /Cambios guardados\./);
  assert.match(componente, /Lote cargado\. Revisa filas antes de confirmar\./);
  assert.match(componente, /Lote confirmado\. Filas aplicadas:/);
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



test("alta y publicación recargan listado real en backend sin inserción optimista", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /obtenerListadoAdmin/);
  assert.match(componente, /await recargarListadoReal\(\)/);
  assert.doesNotMatch(componente, /setItems\(existe \? items\.map/);
});
test("publish/unpublish propaga detalle backend cuando toggle falla", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 400, json: async () => ({ detalle: "No se puede publicar una hierba a granel sin planta asociada.", operation_id: "op-123" }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => cambiarPublicacionAdmin("productos", "p-1", true, "token"), /No se puede publicar una hierba a granel sin planta asociada\..*operation_id: op-123/);
});

test("publish/unpublish incluye errores de validación del backend en el mensaje", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 400, json: async () => ({ detalle: "Publicación inválida", errores: { planta_id: "Selecciona una planta asociada." } }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => cambiarPublicacionAdmin("productos", "p-1", true, "token"), /Publicación inválida · planta_id: Selecciona una planta asociada\./);
});

test("publish/unpublish mantiene fallback seguro si backend no devuelve JSON", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 500, json: async () => { throw new Error("sin json"); } }) as unknown as Response) as unknown as typeof fetch;

  await assert.rejects(() => cambiarPublicacionAdmin("productos", "p-1", true, "token"), /No se pudo actualizar publicación/);
});

test("submit de alta propaga errores backend cuando guardar falla", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 400, json: async () => ({ detalle: "Nombre obligatorio" }) }) as Response) as unknown as typeof fetch;
  await assert.rejects(() => guardarRegistroAdmin("productos", { nombre: "fallido" }, "token"), /Nombre obligatorio/);
});



test("crear lote de importación propaga detalle backend cuando falta archivo", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 400, json: async () => ({ detalle: "Archivo requerido.", operation_id: "imp-001" }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => crearLoteImportacion(new FormData(), "token"), /Archivo requerido\..*operation_id: imp-001/);
});

test("obtener lote mantiene fallback seguro si backend no devuelve JSON", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 502, json: async () => { throw new Error("html"); } }) as unknown as Response) as unknown as typeof fetch;

  await assert.rejects(() => obtenerLoteImportacion(404, "token"), /No se pudo consultar el lote de importación\./);
});

test("acciones de lote propagan detalle backend cuando existe", async () => {
  const cola = [
    { detalle: "El lote ya fue confirmado.", operation_id: "lot-11" },
    { detalle: "No hay filas válidas para confirmar." },
    { detalle: "El lote ya no puede revalidarse." },
    { detalle: "El lote ya fue cancelado.", operation_id: "lot-12" },
  ];
  globalThis.fetch = (async () => ({ ok: false, status: 409, json: async () => cola.shift() }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => confirmarLoteImportacion(10, [1], "token"), /El lote ya fue confirmado\..*operation_id: lot-11/);
  await assert.rejects(() => confirmarValidasLoteImportacion(10, "token"), /No hay filas válidas para confirmar\./);
  await assert.rejects(() => revalidarLoteImportacion(10, "token"), /El lote ya no puede revalidarse\./);
  await assert.rejects(() => cancelarLoteImportacion(10, "token"), /El lote ya fue cancelado\..*operation_id: lot-12/);
});

test("adjuntar imagen de fila propaga detalle backend de validación WebP", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 422, json: async () => ({ detalle: "No fue posible convertir la imagen a WebP.", operation_id: "img-422" }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(
    () => adjuntarImagenFilaImportacion(10, 9, new File(["x"], "foto.png", { type: "image/png" }), "token"),
    /No fue posible convertir la imagen a WebP\..*operation_id: img-422/,
  );
});

test("exportación fallida propaga detalle backend", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 400, json: async () => ({ detalle: "Formato inválido.", operation_id: "exp-1" }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => descargarExportacionAdmin("productos", "inventario", "xlsx", "token"), /Formato inválido\..*operation_id: exp-1/);
});

test("acciones operativas de pedidos propagan detalle backend", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 400, json: async () => ({ detalle: "El pedido ya está en preparación.", operation_id: "ped-77" }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => marcarPedidoPreparando("ped-1", "token"), /El pedido ya está en preparación\..*operation_id: ped-77/);
});

test("flujo de importación confirmada: crear lote, consultar y confirmar", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    llamadas.push(url);
    if (url.endsWith("/importacion/lotes/")) return { ok: true, json: async () => ({ lote_id: 22 }) } as Response;
    if (url.endsWith("/importacion/lotes/22/")) return { ok: true, json: async () => ({ lote: { id: 22 }, resumen: { total: 1, validas: 1, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 0, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 }, filas: [{ id: 1, seleccionado: true, identificador: "SKU", titulo: "Producto", tipo: "te", resumen_datos: "ok", errores: [], warnings: [], estado: "valida", imagen: "", estado_imagen: "ausente", resultado_confirmacion: "" }] }) } as Response;
    return { ok: true, json: async () => ({ confirmadas: 1, detalle: { lote: { id: 22 }, resumen: { total: 1, validas: 0, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 1, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 }, filas: [{ id: 1, seleccionado: true, identificador: "SKU", titulo: "Producto", tipo: "te", resumen_datos: "ok", errores: [], warnings: [], estado: "confirmada", imagen: "", estado_imagen: "ausente", resultado_confirmacion: "ok" }] } }) } as Response;
  }) as unknown as typeof fetch;

  const formData = new FormData();
  formData.set("entidad", "productos");
  const loteId = await crearLoteImportacion(formData, "token");
  const detalle = await obtenerLoteImportacion(loteId, "token");
  const confirmadas = await confirmarLoteImportacion(loteId, [1], "token");

  assert.equal(loteId, 22);
  assert.equal(detalle.lote.id, 22);
  assert.equal(confirmadas.confirmadas, 1);
  assert.equal(llamadas.length, 3);
});

test("importación permite revalidar, seleccionar, descartar y gestionar imagen por fila", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    llamadas.push(url);
    const method = String(init?.method ?? "GET");
    if (url.includes("/revalidar/")) return { ok: true, json: async () => ({ revalidado: true, detalle: { lote: { id: 10 }, resumen: { total: 1, validas: 1, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 0, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 }, filas: [] } }) } as Response;
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


test("campo precio del backoffice usa input numérico real", () => {
  const campos = readFileSync(join(process.cwd(), "componentes/admin/CamposFormularioAdmin.tsx"), "utf8");
  assert.equal(campos.includes('type="number"'), true);
  assert.equal(campos.includes('step="0.01"'), true);
  assert.equal(campos.includes('aria-label="Precio visible en euros"'), true);
});


test("validación de producto bloquea payload incompleto de botica en alta y edición", () => {
  const invalido = validarFormularioProducto({
    nombre: "Producto",
    seccion_publica: "botica-natural",
    precio_numerico: "9.90",
    tipo_producto: "hierbas-a-granel",
    categoria_comercial: "hierbas",
    beneficio_principal: "calma",
    formato_comercial: "hoja-seca",
    modo_uso: "infusion",
    planta_id: "",
  });

  const valido = validarFormularioProducto({
    nombre: "Producto",
    seccion_publica: "botica-natural",
    precio_numerico: "9.90",
    tipo_producto: "hierbas-a-granel",
    categoria_comercial: "hierbas",
    beneficio_principal: "calma",
    formato_comercial: "hoja-seca",
    modo_uso: "infusion",
    planta_id: "pla-1",
  });

  assert.equal(invalido, "Las hierbas a granel requieren planta asociada.");
  assert.equal(valido, null);
});

test("validación de producto exige precio numérico", () => {
  const invalido = validarFormularioProducto({ nombre: "Producto", seccion_publica: "botica-natural", precio_numerico: "" });
  assert.equal(invalido, "El precio debe ser numérico y válido.");
});


test("obtiene plantas asociables para selector humano", async () => {
  let url = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    url = String(input);
    return { ok: true, json: async () => ({ items: [{ id: "pla-1", nombre: "Melisa" }] }) } as Response;
  }) as unknown as typeof fetch;

  const plantas = await obtenerPlantasAsociables("token");

  assert.match(url, /\/api\/v1\/backoffice\/productos\/plantas-asociables\/$/);
  assert.equal(plantas[0]?.nombre, "Melisa");
  assert.equal(plantas[0]?.id, "pla-1");
});
