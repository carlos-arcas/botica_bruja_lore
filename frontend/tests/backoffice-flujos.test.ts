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
import {
  construirFeedbackConfirmacionImportacion,
  construirMensajeConfirmacionImportacion,
  normalizarConfirmacionImportacion,
} from "../componentes/admin/importacion/feedbackConfirmacionImportacion";
import {
  actualizarDetalleImportacion,
  construirResumenImportacion,
} from "../componentes/admin/importacion/resumenImportacion";
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
  assert.match(componente, /construirFeedbackConfirmacionImportacion\("Lote confirmado\. Filas aplicadas", respuesta\)/);
  assert.match(componente, /No se pudo cargar el lote de importación\./);
});



test("recalcula resumen local de importación tras acciones por fila", () => {
  const filas = [
    { id: 1, numero: 1, datos: {}, errores: [], warnings: [], estado: "valida", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "", identificador: "SKU-1", titulo: "Fila 1", tipo: "producto", resumen_datos: "ok" },
    { id: 2, numero: 2, datos: {}, errores: [], warnings: ["revisar"], estado: "valida_warning", seleccionado: false, imagen: "https://cdn.test/2.webp", estado_imagen: "optimizada" as const, resultado_confirmacion: "", identificador: "SKU-2", titulo: "Fila 2", tipo: "producto", resumen_datos: "ok" },
    { id: 3, numero: 3, datos: {}, errores: ["slug repetido"], warnings: [], estado: "descartada", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "", identificador: "SKU-3", titulo: "Fila 3", tipo: "producto", resumen_datos: "ok" },
    { id: 4, numero: 4, datos: {}, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "https://cdn.test/4.webp", estado_imagen: "optimizada" as const, resultado_confirmacion: "ok", identificador: "SKU-4", titulo: "Fila 4", tipo: "producto", resumen_datos: "ok" },
  ];

  const resumen = construirResumenImportacion(filas);

  assert.deepEqual(resumen, {
    total: 4,
    validas: 1,
    warnings: 1,
    invalidas: 0,
    descartadas: 1,
    confirmadas: 1,
    con_imagen: 2,
    sin_imagen: 2,
    seleccionadas: 2,
  });
});

test("actualizar detalle de importación mantiene filas y resumen sincronizados", () => {
  const detalle = {
    lote: { id: 91 },
    resumen: { total: 2, validas: 1, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 1, con_imagen: 0, sin_imagen: 2, seleccionadas: 1 },
    filas: [
      { id: 1, numero: 1, datos: {}, errores: [], warnings: [], estado: "valida", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "", identificador: "SKU-1", titulo: "Fila 1", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: {}, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-2", titulo: "Fila 2", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const actualizado = actualizarDetalleImportacion(detalle, {
    ...detalle.filas[0],
    estado: "descartada",
    seleccionado: true,
    imagen: "https://cdn.test/1.webp",
    estado_imagen: "optimizada" as const,
  });

  assert.equal(actualizado.filas[0].estado, "descartada");
  assert.equal(actualizado.resumen.seleccionadas, 2);
  assert.equal(actualizado.resumen.descartadas, 1);
  assert.equal(actualizado.resumen.validas, 0);
  assert.equal(actualizado.resumen.con_imagen, 1);
  assert.equal(actualizado.resumen.sin_imagen, 1);
});

test("actualización secuencial del detalle conserva mutaciones rápidas encadenadas", () => {
  const detalleInicial = {
    lote: { id: 92 },
    resumen: { total: 2, validas: 2, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 0, con_imagen: 0, sin_imagen: 2, seleccionadas: 0 },
    filas: [
      { id: 1, numero: 1, datos: {}, errores: [], warnings: [], estado: "valida", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "", identificador: "SKU-1", titulo: "Fila 1", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: {}, errores: [], warnings: [], estado: "valida", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "", identificador: "SKU-2", titulo: "Fila 2", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const filaSeleccionada = {
    ...detalleInicial.filas[0],
    seleccionado: true,
  };
  const filaConImagen = {
    ...detalleInicial.filas[1],
    imagen: "https://cdn.test/2.webp",
    estado_imagen: "optimizada" as const,
  };

  const detalleTrasSeleccion = actualizarDetalleImportacion(detalleInicial, filaSeleccionada);
  const detalleFinal = actualizarDetalleImportacion(detalleTrasSeleccion, filaConImagen);
  const detallePisadoPorClosureObsoleto = actualizarDetalleImportacion(detalleInicial, filaConImagen);

  assert.equal(detalleFinal.filas[0].seleccionado, true);
  assert.equal(detalleFinal.filas[1].imagen, "https://cdn.test/2.webp");
  assert.equal(detalleFinal.resumen.seleccionadas, 1);
  assert.equal(detalleFinal.resumen.con_imagen, 1);
  assert.equal(detalleFinal.resumen.sin_imagen, 1);
  assert.equal(detallePisadoPorClosureObsoleto.filas[0].seleccionado, false);
});

test("normaliza el contrato de confirmación y construye feedback reutilizable sin serializar el objeto completo", () => {
  const detalle = {
    lote: { id: 44 },
    resumen: { total: 3, validas: 0, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 3, con_imagen: 0, sin_imagen: 3, seleccionadas: 3 },
    filas: [{ id: 1, numero: 1, datos: {}, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-1", titulo: "Producto", tipo: "producto", resumen_datos: "ok" }],
  };
  const resultado = { confirmadas: 3, detalle };

  const confirmacion = normalizarConfirmacionImportacion(resultado);
  const feedback = construirFeedbackConfirmacionImportacion("Lote confirmado. Filas aplicadas", resultado);
  const mensaje = construirMensajeConfirmacionImportacion("Lote confirmado. Filas aplicadas", resultado);

  assert.equal(confirmacion.confirmadas, 3);
  assert.equal(confirmacion.detalle.lote.id, 44);
  assert.equal(feedback.detalle, detalle);
  assert.equal(feedback.mensaje, "Lote confirmado. Filas aplicadas: 3.");
  assert.equal(mensaje, feedback.mensaje);
  assert.doesNotMatch(mensaje, /\[object Object\]/);
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

test("acciones de fila de importación propagan operation_id en errores trazables", async () => {
  const cola = [
    { detalle: "Lote no encontrado.", operation_id: "fila-lote-404" },
    { detalle: "Fila no encontrada.", operation_id: "fila-404" },
    { detalle: "La fila ya fue confirmada.", operation_id: "fila-409" },
    { detalle: "Imagen requerida.", operation_id: "img-400" },
  ];
  globalThis.fetch = (async () => ({ ok: false, status: 409, json: async () => cola.shift() }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => obtenerLoteImportacion(999, "token"), /Lote no encontrado\..*operation_id: fila-lote-404/);
  await assert.rejects(() => cambiarSeleccionFilaImportacion(10, 999, true, "token"), /Fila no encontrada\..*operation_id: fila-404/);
  await assert.rejects(() => descartarFilaImportacion(10, 9, "token"), /La fila ya fue confirmada\..*operation_id: fila-409/);
  await assert.rejects(() => adjuntarImagenFilaImportacion(10, 9, new File(["x"], "foto.png", { type: "image/png" }), "token"), /Imagen requerida\..*operation_id: img-400/);
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
    if (url.endsWith("/importacion/lotes/")) return { ok: true, json: async () => ({ lote_id: 22, operation_id: "imp-ok-1" }) } as Response;
    if (url.endsWith("/importacion/lotes/22/")) return { ok: true, json: async () => ({ lote: { id: 22 }, resumen: { total: 1, validas: 1, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 0, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 }, filas: [{ id: 1, seleccionado: true, identificador: "SKU", titulo: "Producto", tipo: "te", resumen_datos: "ok", errores: [], warnings: [], estado: "valida", imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "" }], operation_id: "imp-ok-2" }) } as Response;
    return { ok: true, json: async () => ({ confirmadas: 1, detalle: { lote: { id: 22 }, resumen: { total: 1, validas: 0, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 1, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 }, filas: [{ id: 1, seleccionado: true, identificador: "SKU", titulo: "Producto", tipo: "te", resumen_datos: "ok", errores: [], warnings: [], estado: "confirmada", imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok" }], operation_id: "imp-ok-3" }, operation_id: "imp-ok-3" }) } as Response;
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
    if (url.includes("/revalidar/")) return { ok: true, json: async () => ({ revalidado: true, detalle: { lote: { id: 10 }, resumen: { total: 1, validas: 1, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 0, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 }, filas: [], operation_id: "imp-op-1" }, operation_id: "imp-op-1" }) } as Response;
    if (url.includes("/seleccion/")) return { ok: true, json: async () => ({ fila: { id: 9, seleccionado: true }, operation_id: "imp-op-2" }) } as Response;
    if (url.includes("/descartar/")) return { ok: true, json: async () => ({ fila: { id: 9, estado: "descartada" }, operation_id: "imp-op-3" }) } as Response;
    if (url.includes("/imagen/eliminar/")) return { ok: true, json: async () => ({ fila: { id: 9, imagen: "" }, operation_id: "imp-op-4" }) } as Response;
    if (url.endsWith("/imagen/")) return { ok: true, json: async () => ({ fila: { id: 9, imagen: "https://cdn.test/ok.webp" }, operation_id: "imp-op-5" }) } as Response;
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

test("los dos flujos UI de importación consumen el mismo contrato sin doble fetch tras confirmar", () => {
  const contextual = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const importacion = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");
  const helper = readFileSync("componentes/admin/importacion/feedbackConfirmacionImportacion.ts", "utf8");

  assert.match(helper, /export function construirFeedbackConfirmacionImportacion/);
  assert.match(helper, /mensaje: `\$\{etiqueta\}: \$\{String\(confirmacion\.confirmadas\)\}\.`/);
  assert.match(contextual, /actualizarDetalleImportacion/);
  assert.match(contextual, /function actualizarDetalleLote/);
  assert.match(contextual, /const filaActualizada = await cambiarSeleccionFilaImportacion/);
  assert.match(contextual, /actualizarDetalleLote\(setDetalle, filaActualizada\)/);
  assert.match(contextual, /const respuesta = await revalidarLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
  assert.match(contextual, /setDetalle\(respuesta\.detalle\)/);
  assert.match(contextual, /const feedback = construirFeedbackConfirmacionImportacion\("Lote confirmado\. Filas aplicadas", respuesta\)/);
  assert.match(contextual, /setOk\(feedback\.mensaje\)/);
  assert.match(contextual, /setDetalle\(feedback\.detalle\)/);
  assert.doesNotMatch(contextual, /const onConfirmarLote = \(\) => !detalle \? Promise\.resolve\(\) : ejecutarAccion\(async \(\) => \{[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
  assert.match(importacion, /actualizarDetalleImportacion/);
  assert.match(importacion, /function actualizarDetalleLoteImportacion/);
  assert.match(importacion, /asignarDetalle\(\(detalleActual\) => \(!detalleActual \? detalleActual : actualizarDetalleImportacion\(detalleActual, filaActualizada\)\)\)/);
  assert.match(importacion, /actualizarDetalleLoteImportacion\(setDetalle, actualizada\)/);
  assert.match(importacion, /const feedback = construirFeedbackConfirmacionImportacion\("Filas confirmadas", respuesta\)/);
  assert.match(importacion, /const feedback = construirFeedbackConfirmacionImportacion\("Filas válidas confirmadas", respuesta\)/);
  assert.match(importacion, /setDetalle\(feedback\.detalle\)/);
});

test("acciones por fila del módulo dedicado aplican actualización funcional sin refetch redundante", () => {
  const importacion = readFileSync("componentes/admin/ModuloImportacionAdmin.tsx", "utf8");

  assert.match(importacion, /const cambiarSeleccion = \(fila: FilaImportacion\) => loteId \? ejecutarAccion\(async \(\) => \{/);
  assert.match(importacion, /const actualizada = await cambiarSeleccionFilaImportacion\(loteId, fila\.id, !fila\.seleccionado, token\)/);
  assert.match(importacion, /actualizarDetalleLoteImportacion\(setDetalle, actualizada\)/);
  assert.doesNotMatch(importacion, /const cambiarSeleccion[\s\S]*obtenerLoteImportacion\(loteId, token\)/);
  assert.match(importacion, /const descartarFila = \(fila: FilaImportacion\) => loteId \? ejecutarAccion\(async \(\) => \{/);
  assert.doesNotMatch(importacion, /const descartarFila[\s\S]*obtenerLoteImportacion\(loteId, token\)/);
  assert.match(importacion, /const eliminarImagen = \(fila: FilaImportacion\) => loteId \? ejecutarAccion\(async \(\) => \{/);
  assert.doesNotMatch(importacion, /const eliminarImagen[\s\S]*obtenerLoteImportacion\(loteId, token\)/);
  assert.match(importacion, /const adjuntarImagen = \(fila: FilaImportacion, archivo\?: File\) => loteId && archivo \? ejecutarAccion\(async \(\) => \{/);
  assert.doesNotMatch(importacion, /const adjuntarImagen[\s\S]*obtenerLoteImportacion\(loteId, token\)/);
});

test("acciones inline del CRUD contextual quedan blindadas frente a un GET posterior hipotéticamente fallido", () => {
  const contextual = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(contextual, /const onSeleccionFila = async \(filaId: number, seleccionado: boolean\) => \{/);
  assert.match(contextual, /const filaActualizada = await cambiarSeleccionFilaImportacion\(Number\(detalle\.lote\.id\), filaId, seleccionado, token\)/);
  assert.match(contextual, /actualizarDetalleLote\(setDetalle, filaActualizada\)/);
  assert.doesNotMatch(contextual, /const onSeleccionFila[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
  assert.match(contextual, /const onDescartarFila = async \(filaId: number\) => \{/);
  assert.doesNotMatch(contextual, /const onDescartarFila[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
  assert.match(contextual, /const onAdjuntarImagen = async \(filaId: number, archivo: File\) => \{/);
  assert.doesNotMatch(contextual, /const onAdjuntarImagen[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
  assert.match(contextual, /const onEliminarImagen = async \(filaId: number\) => \{/);
  assert.doesNotMatch(contextual, /const onEliminarImagen[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
  assert.match(contextual, /const onRevalidarLote = \(\) => !detalle \? Promise\.resolve\(\) : ejecutarAccion\(async \(\) => \{/);
  assert.match(contextual, /setDetalle\(respuesta\.detalle\)/);
  assert.doesNotMatch(contextual, /const onRevalidarLote[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
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

test("validación de producto distingue selector faltante de error de carga de plantas", () => {
  const errorCarga = validarFormularioProducto({
    nombre: "Producto",
    seccion_publica: "botica-natural",
    precio_numerico: "9.90",
    tipo_producto: "hierbas-a-granel",
    categoria_comercial: "hierbas",
    beneficio_principal: "calma",
    formato_comercial: "hoja-seca",
    modo_uso: "infusion",
    planta_id: "",
  }, "error");

  const cargando = validarFormularioProducto({
    nombre: "Producto",
    seccion_publica: "botica-natural",
    precio_numerico: "9.90",
    tipo_producto: "hierbas-a-granel",
    categoria_comercial: "hierbas",
    beneficio_principal: "calma",
    formato_comercial: "hoja-seca",
    modo_uso: "infusion",
    planta_id: "",
  }, "cargando");

  assert.equal(errorCarga, "No se pudieron cargar las plantas asociables. Reintenta la carga antes de guardar una hierba a granel.");
  assert.equal(cargando, "La lista de plantas asociables sigue cargando. Espera antes de guardar una hierba a granel.");
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


test("obtiene plantas asociables propagando detalle backend y operation_id", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 503, json: async () => ({ detalle: "Backend de plantas no disponible.", operation_id: "pla-op-9" }) }) as Response) as unknown as typeof fetch;

  await assert.rejects(() => obtenerPlantasAsociables("token"), /Backend de plantas no disponible\..*operation_id: pla-op-9/);
});

test("ui de productos distingue carga vacía frente a error de plantas y ofrece reintento", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");

  assert.match(modulo, /estadoPlantas\.estado === "cargando"/);
  assert.match(modulo, /estadoPlantas\.estado === "ok" && plantas\.length === 0/);
  assert.match(modulo, /estadoPlantas\.estado === "error"/);
  assert.match(modulo, /Reintentar carga de plantas/);
  assert.match(modulo, /No se pudieron cargar las plantas asociables\. Reintenta la carga antes de guardar o publicar una hierba a granel\./);
  assert.doesNotMatch(modulo, /catch\(\(\) => \{\s*if \(activo\) setPlantas\(\[\]\);/);
});

test("ui del campo planta asociada muestra ayuda contextual para ok vacío, error y éxito", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  const contextual = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(modulo, /Carga completada, pero todavía no hay plantas asociables publicadas para vincular\./);
  assert.match(modulo, /Selecciona la planta editorial que se vinculará con este producto herbal\./);
  assert.match(modulo, /ayuda: resolverAyudaPlantas\(estadoPlantas, plantas\)/);
  assert.match(contextual, /campo\.ayuda \? <small>\{campo\.ayuda\}<\/small> : null/);
});


test("la confirmación inline queda protegida frente a un GET posterior fallido porque ya no depende de ese segundo fetch", () => {
  const contextual = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(contextual, /const respuesta = await confirmarLoteImportacion\(Number\(detalle\.lote\.id\), seleccionadas, token\)/);
  assert.match(contextual, /const feedback = construirFeedbackConfirmacionImportacion\("Lote confirmado\. Filas aplicadas", respuesta\)/);
  assert.match(contextual, /setDetalle\(feedback\.detalle\)/);
  assert.doesNotMatch(contextual, /const respuesta = await confirmarLoteImportacion[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
});
