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
  obtenerEstadoBackoffice,
  obtenerListadoAdmin,
  obtenerPlantasAsociables,
} from "../infraestructura/api/backoffice";
import {
  construirFeedbackConfirmacionImportacion,
  construirMensajeConfirmacionImportacion,
  normalizarConfirmacionImportacion,
} from "../componentes/admin/importacion/feedbackConfirmacionImportacion";
import { construirMensajeConfirmacionContextual } from "../componentes/admin/importacion/confirmacionContextualImportacion";
import {
  actualizarItemsSeccion,
  actualizarItemsSecciones,
  construirDetalleSincronizacionSecciones,
  debeActualizarVistaLocal,
  resolverSeccionesAfectadasImportacion,
  sincronizarProductoMutado,
} from "../componentes/admin/sincronizacionProductosAdmin";
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
  assert.match(componente, /const \{ refrescarRouter = true \} = opciones/);
  assert.match(componente, /if \(refrescarRouter\) \{\s*router\.refresh\(\);\s*\}/);
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
  assert.match(contextual, /setDetalle\(feedback\.detalle\)/);
  assert.match(contextual, /const seccionesAfectadas = resolverSeccionesAfectadasImportacion\(feedback\.detalle, seccionSeleccionada\)/);
  assert.match(contextual, /const sincronizacion = await sincronizarListadoTrasConfirmacion\(seccionesAfectadas\)/);
  assert.match(contextual, /await recargarListadoReal\(seccion, \{ refrescarRouter: false \}\)/);
  assert.match(contextual, /if \(resultados\.some\(\(resultado\) => resultado\.estado === "sincronizada"\)\) \{\s*router\.refresh\(\);\s*\}/);
  assert.match(contextual, /setOk\(construirMensajeConfirmacionContextual\(feedback\.mensaje, sincronizacion\)\)/);
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
  assert.match(contextual, /if \(modulo !== "productos"\) return \{ estado: "omitida" \};/);
  assert.match(contextual, /await recargarListadoReal\(\)/);
  assert.match(contextual, /await recargarListadoReal\(seccion, \{ refrescarRouter: false \}\)/);
  assert.doesNotMatch(contextual, /const respuesta = await confirmarLoteImportacion[\s\S]*obtenerLoteImportacion\(Number\(detalle\.lote\.id\), token\)/);
});

test("mensaje contextual distingue confirmación exitosa de sincronización pendiente", () => {
  const exitoTotal = construirMensajeConfirmacionContextual("Lote confirmado. Filas aplicadas: 2.", { estado: "sincronizada" });
  const exitoParcial = construirMensajeConfirmacionContextual("Lote confirmado. Filas aplicadas: 2.", {
    estado: "pendiente",
    detalle: "Error de red.",
  });

  assert.equal(exitoTotal, "Lote confirmado. Filas aplicadas: 2.");
  assert.equal(
    exitoParcial,
    "Lote confirmado. Filas aplicadas: 2. El lote se confirmó, pero el listado real no pudo refrescarse todavía: Error de red.",
  );
});


test("estado backoffice preserva detalle útil y operation_id en 403", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 403, json: async () => ({ detalle: "Sesión expirada o usuario sin permisos staff.", operation_id: "auth-403" }) }) as Response) as unknown as typeof fetch;

  const estado = await obtenerEstadoBackoffice("token");

  assert.deepEqual(estado, { estado: "denegado", detalle: "Sesión expirada o usuario sin permisos staff.", operation_id: "auth-403" });
});

test("estado backoffice mantiene fallback claro ante 403 opaco y diferencia error backend", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 403, json: async () => ({}) }) as Response) as unknown as typeof fetch;
  const denegado = await obtenerEstadoBackoffice("token");
  assert.equal(denegado.estado, "denegado");
  assert.equal(denegado.detalle, "Debes iniciar sesión como staff para acceder al backoffice.");
  assert.equal("operation_id" in denegado ? denegado.operation_id : undefined, undefined);

  globalThis.fetch = (async () => ({ ok: false, status: 500, json: async () => ({ detalle: "Backend de autenticación degradado.", operation_id: "auth-500" }) }) as Response) as unknown as typeof fetch;
  const error = await obtenerEstadoBackoffice("token");
  assert.deepEqual(error, { estado: "error", detalle: "Backend de autenticación degradado. (operation_id: auth-500)", operation_id: "auth-500" });
});

test("listado admin preserva detalle útil y operation_id en 401/403 sin degradar a mensaje fijo", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 401, json: async () => ({ detalle: "Tu sesión staff ha caducado.", operation_id: "list-401" }) }) as Response) as unknown as typeof fetch;

  const resultado = await obtenerListadoAdmin("productos", new URLSearchParams("q=rosa"), "token");

  assert.deepEqual(resultado, { estado: "denegado", detalle: "Tu sesión staff ha caducado.", operation_id: "list-401" });
});

test("listado admin diferencia denegado, backend y red", async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 503, json: async () => ({ detalle: "Servicio editorial no disponible.", operation_id: "list-503" }) }) as Response) as unknown as typeof fetch;
  const errorBackend = await obtenerListadoAdmin("editorial", new URLSearchParams(), "token");
  assert.deepEqual(errorBackend, { estado: "error", detalle: "Servicio editorial no disponible. (operation_id: list-503)", operation_id: "list-503" });

  globalThis.fetch = (async () => { throw new Error("network"); }) as unknown as typeof fetch;
  const errorRed = await obtenerListadoAdmin("editorial", new URLSearchParams(), "token");
  assert.deepEqual(errorRed, { estado: "error", detalle: "Error de red." });
});


test("resincronización multisección separa store global y vista local de la pestaña activa", () => {
  const s0 = [
    { id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: false },
    { id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: false },
  ];
  const itemsA = [{ id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: true }];
  const itemsB = [{ id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: true }];

  const storeTrasA = actualizarItemsSeccion(s0, "botica-natural", itemsA);
  const vistaTrasA = debeActualizarVistaLocal({
    modulo: "productos",
    seccionSincronizada: "botica-natural",
    seccionVisible: "botica-natural",
  })
    ? itemsA
    : s0.filter((item) => item.seccion_publica === "botica-natural");

  const storeFinal = actualizarItemsSeccion(storeTrasA, "velas-e-incienso", itemsB);
  const vistaFinal = debeActualizarVistaLocal({
    modulo: "productos",
    seccionSincronizada: "velas-e-incienso",
    seccionVisible: "botica-natural",
  })
    ? itemsB
    : vistaTrasA;

  assert.deepEqual(storeFinal.filter((item) => item.seccion_publica === "botica-natural"), itemsA);
  assert.deepEqual(storeFinal.filter((item) => item.seccion_publica === "velas-e-incienso"), itemsB);
  assert.deepEqual(vistaFinal, itemsA);
});

test("al cambiar a la pestaña resincronizada después, la vista local puede pintar la sección B actualizada", () => {
  const itemsB = [{ id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: true }];

  const vistaB = debeActualizarVistaLocal({
    modulo: "productos",
    seccionSincronizada: "velas-e-incienso",
    seccionVisible: "velas-e-incienso",
  })
    ? itemsB
    : [];

  assert.deepEqual(vistaB, itemsB);
});

test("caso monosección y módulos no contextuales siguen actualizando la vista local", () => {
  assert.equal(
    debeActualizarVistaLocal({
      modulo: "productos",
      seccionSincronizada: "botica-natural",
      seccionVisible: "botica-natural",
    }),
    true,
  );
  assert.equal(
    debeActualizarVistaLocal({
      modulo: "editorial",
      seccionSincronizada: "blog",
      seccionVisible: "inicio",
    }),
    true,
  );
});

test("productos sincroniza una única fuente de verdad tras mutación y cambio de sección", () => {
  const moduloProductos = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  const moduloCrud = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(moduloProductos, /const \[itemsProductos, setItemsProductos\] = useState\(itemsIniciales\)/);
  assert.match(moduloProductos, /itemsProductos\.filter\(\(item\) => item\.seccion_publica === seccion\)/);
  assert.match(moduloProductos, /onItemsSincronizados=\{sincronizarListadoSeccion\}/);
  assert.match(moduloProductos, /onItemMutado=\{sincronizarProducto\}/);
  assert.match(moduloCrud, /const seccionVisibleRef = useRef\(seccionSeleccionada\)/);
  assert.match(moduloCrud, /seccionVisibleRef\.current = seccionSeleccionada/);
  assert.match(moduloCrud, /const debeActualizarVista = debeActualizarVistaLocal\(\{/);
  assert.match(moduloCrud, /seccionSincronizada: seccionObjetivo/);
  assert.match(moduloCrud, /seccionVisible: seccionVisibleRef\.current/);
  assert.match(moduloCrud, /if \(debeActualizarVista\) \{/);
  assert.match(moduloCrud, /setItems\(actualizado\.items\)/);
  assert.match(moduloCrud, /onItemsSincronizados\?\.\(seccionObjetivo, actualizado\.items\)/);
  assert.match(moduloCrud, /onItemMutado\?\.\(itemGuardado\)/);
});

test("regresión S0→S1 en productos evita resucitar snapshot obsoleto al volver de pestaña", () => {
  const s0 = [
    { id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: false },
    { id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: true },
  ];
  const s1Botica = [{ id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: true }];

  const trasMutacion = actualizarItemsSeccion(s0, "botica-natural", s1Botica);
  const vistaBoticaTrasVolver = trasMutacion.filter((item) => item.seccion_publica === "botica-natural");
  const snapshotViejo = s0.filter((item) => item.seccion_publica === "botica-natural");

  assert.equal(snapshotViejo[0]?.publicado, false);
  assert.equal(vistaBoticaTrasVolver[0]?.publicado, true);
  assert.notDeepEqual(vistaBoticaTrasVolver, snapshotViejo);
});

test("sincronización S0→S1 del padre conserva otras secciones y evita reintroducir snapshot viejo tras importar", () => {
  const s0 = [
    { id: "prod-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: false },
    { id: "prod-2", nombre: "Vela", seccion_publica: "velas-e-incienso", publicado: true },
  ];
  const s1 = [
    { id: "prod-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: true },
    { id: "prod-3", nombre: "Lavanda", seccion_publica: "botica-natural", publicado: true },
  ];

  const sincronizado = actualizarItemsSeccion(s0, "botica-natural", s1);

  assert.deepEqual(
    sincronizado.filter((item) => item.seccion_publica === "botica-natural"),
    s1,
  );
  assert.deepEqual(
    sincronizado.filter((item) => item.seccion_publica === "velas-e-incienso"),
    [{ id: "prod-2", nombre: "Vela", seccion_publica: "velas-e-incienso", publicado: true }],
  );
});

test("importación contextual multisección detecta todas las secciones confirmadas desde el staging", () => {
  const detalle = {
    lote: { id: 100 },
    resumen: { total: 3, validas: 0, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 2, con_imagen: 0, sin_imagen: 3, seleccionadas: 2 },
    filas: [
      { id: 1, numero: 1, datos: { seccion_publica: "botica-natural" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-1", titulo: "Rosa", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: { seccion_publica: "velas-e-incienso" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-2", titulo: "Vela", tipo: "producto", resumen_datos: "ok" },
      { id: 3, numero: 3, datos: { seccion_publica: "minerales-y-energia" }, errores: [], warnings: [], estado: "valida", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "", identificador: "SKU-3", titulo: "Cuarzo", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const secciones = resolverSeccionesAfectadasImportacion(detalle, "botica-natural");

  assert.deepEqual(secciones, ["botica-natural", "velas-e-incienso"]);
});

test("resolver secciones afectadas ignora proxies ambiguos en resultado_confirmacion", () => {
  const detalle = {
    lote: { id: 102 },
    resumen: { total: 4, validas: 1, warnings: 2, invalidas: 1, descartadas: 0, confirmadas: 1, con_imagen: 0, sin_imagen: 4, seleccionadas: 2 },
    filas: [
      { id: 1, numero: 1, datos: { seccion_publica: "botica-natural" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-1", titulo: "Rosa", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: { seccion_publica: "velas-e-incienso" }, errores: [], warnings: ["revisar"], estado: "valida_warning", seleccionado: true, imagen: "", estado_imagen: "pendiente" as const, resultado_confirmacion: "pendiente", identificador: "SKU-2", titulo: "Vela", tipo: "producto", resumen_datos: "ok" },
      { id: 3, numero: 3, datos: { seccion_publica: "minerales-y-energia" }, errores: [], warnings: [], estado: "valida", seleccionado: true, imagen: "", estado_imagen: "optimizada" as const, resultado_confirmacion: "ausente", identificador: "SKU-3", titulo: "Cuarzo", tipo: "producto", resumen_datos: "ok" },
      { id: 4, numero: 4, datos: { seccion_publica: "amuletos-y-talismenes" }, errores: ["Error backend"], warnings: [], estado: "invalida", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "Error backend: slug duplicado", identificador: "SKU-4", titulo: "Amuleto", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const secciones = resolverSeccionesAfectadasImportacion(detalle, "botica-natural");

  assert.deepEqual(secciones, ["botica-natural"]);
});

test("regresión explícita A+B confirmadas no arrastra C con filas fallidas, ausentes o descartadas", () => {
  const detalle = {
    lote: { id: 103 },
    resumen: { total: 5, validas: 0, warnings: 2, invalidas: 1, descartadas: 1, confirmadas: 2, con_imagen: 0, sin_imagen: 5, seleccionadas: 3 },
    filas: [
      { id: 1, numero: 1, datos: { seccion_publica: "botica-natural" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-1", titulo: "Rosa", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: { seccion_publica: "velas-e-incienso" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-2", titulo: "Vela", tipo: "producto", resumen_datos: "ok" },
      { id: 3, numero: 3, datos: { seccion_publica: "minerales-y-energia" }, errores: [], warnings: ["sin imagen"], estado: "valida_warning", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "pendiente", identificador: "SKU-3", titulo: "Cuarzo", tipo: "producto", resumen_datos: "ok" },
      { id: 4, numero: 4, datos: { seccion_publica: "minerales-y-energia" }, errores: [], warnings: [], estado: "descartada", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ausente", identificador: "SKU-4", titulo: "Pirita", tipo: "producto", resumen_datos: "ok" },
      { id: 5, numero: 5, datos: { seccion_publica: "minerales-y-energia" }, errores: ["slug duplicado"], warnings: [], estado: "invalida", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "Error de validación", identificador: "SKU-5", titulo: "Obsidiana", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const secciones = resolverSeccionesAfectadasImportacion(detalle, "botica-natural");

  assert.deepEqual(secciones, ["botica-natural", "velas-e-incienso"]);
  assert.equal(secciones.includes("minerales-y-energia"), false);
});

test("regresión explícita A+B+C actualiza store global sin tocar la vista local activa", () => {
  const s0 = [
    { id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: false },
    { id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: false },
    { id: "c-1", nombre: "Cuarzo", seccion_publica: "minerales-y-energia", publicado: false },
  ];
  const s1a = [{ id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: true }];
  const s1b = [{ id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: true }];
  const s1c = [{ id: "c-1", nombre: "Cuarzo", seccion_publica: "minerales-y-energia", publicado: true }];

  const storeSincronizado = actualizarItemsSecciones(s0, {
    "botica-natural": s1a,
    "velas-e-incienso": s1b,
    "minerales-y-energia": s1c,
  });

  const vistaLocalProtegida = debeActualizarVistaLocal({
    modulo: "productos",
    seccionSincronizada: "velas-e-incienso",
    seccionVisible: "botica-natural",
  })
    ? s1b
    : storeSincronizado.filter((item) => item.seccion_publica === "botica-natural");

  assert.deepEqual(storeSincronizado.filter((item) => item.seccion_publica === "botica-natural"), s1a);
  assert.deepEqual(storeSincronizado.filter((item) => item.seccion_publica === "velas-e-incienso"), s1b);
  assert.deepEqual(storeSincronizado.filter((item) => item.seccion_publica === "minerales-y-energia"), s1c);
  assert.deepEqual(vistaLocalProtegida, s1a);
});

test("regresión de refresh multisección A+B+C delega un único refresh global al final", () => {
  const contextual = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(contextual, /const recargarListadoReal = async \([\s\S]*opciones: \{ refrescarRouter\?: boolean \} = \{\},/);
  assert.match(contextual, /const \{ refrescarRouter = true \} = opciones/);
  assert.match(contextual, /await recargarListadoReal\(seccion, \{ refrescarRouter: false \}\)/);
  assert.match(contextual, /if \(resultados\.some\(\(resultado\) => resultado\.estado === "sincronizada"\)\) \{\s*router\.refresh\(\);\s*\}/);
});

test("regresión explícita A+B sincroniza S1a y S1b sin resucitar snapshots previos al cambiar de pestaña", () => {
  const s0 = [
    { id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: false },
    { id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: false },
  ];
  const s1a = [{ id: "a-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: true }];
  const s1b = [{ id: "b-1", nombre: "Vela lunar", seccion_publica: "velas-e-incienso", publicado: true }];

  const sincronizado = actualizarItemsSecciones(s0, {
    "botica-natural": s1a,
    "velas-e-incienso": s1b,
  });

  assert.deepEqual(sincronizado.filter((item) => item.seccion_publica === "botica-natural"), s1a);
  assert.deepEqual(sincronizado.filter((item) => item.seccion_publica === "velas-e-incienso"), s1b);
  assert.notDeepEqual(sincronizado.filter((item) => item.seccion_publica === "botica-natural"), s0.filter((item) => item.seccion_publica === "botica-natural"));
  assert.notDeepEqual(sincronizado.filter((item) => item.seccion_publica === "velas-e-incienso"), s0.filter((item) => item.seccion_publica === "velas-e-incienso"));
});

test("sincronización parcial conserva éxito del lote y no finge refresco completo de secciones hermanas", () => {
  const detalle = construirDetalleSincronizacionSecciones({
    seccionesSincronizadas: ["botica-natural"],
    seccionesPendientes: [{ seccion: "velas-e-incienso", detalle: "Error de red." }],
  });
  const mensaje = construirMensajeConfirmacionContextual("Lote confirmado. Filas aplicadas: 2.", { estado: "pendiente", detalle });

  assert.match(mensaje, /Lote confirmado\. Filas aplicadas: 2\./);
  assert.match(mensaje, /Secciones sincronizadas: botica-natural\./);
  assert.match(mensaje, /Sincronización pendiente en: velas-e-incienso \(Error de red\.\)\./);
  assert.doesNotMatch(mensaje, /minerales-y-energia/);
});

test("lote monosección mantiene fallback a la pestaña activa cuando el staging no expone otra sección", () => {
  const detalle = {
    lote: { id: 101 },
    resumen: { total: 1, validas: 0, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 1, con_imagen: 0, sin_imagen: 1, seleccionadas: 1 },
    filas: [{ id: 1, numero: 1, datos: {}, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-1", titulo: "Rosa", tipo: "producto", resumen_datos: "ok" }],
  };

  const secciones = resolverSeccionesAfectadasImportacion(detalle, "botica-natural");

  assert.deepEqual(secciones, ["botica-natural"]);
});

test("fallback sin confirmadas detectables usa solo la sección activa y no expande el lote", () => {
  const detalle = {
    lote: { id: 104 },
    resumen: { total: 3, validas: 1, warnings: 1, invalidas: 0, descartadas: 1, confirmadas: 0, con_imagen: 0, sin_imagen: 3, seleccionadas: 1 },
    filas: [
      { id: 1, numero: 1, datos: { seccion_publica: "botica-natural" }, errores: [], warnings: [], estado: "valida", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "pendiente", identificador: "SKU-1", titulo: "Rosa", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: { seccion_publica: "velas-e-incienso" }, errores: [], warnings: ["imagen ausente"], estado: "valida_warning", seleccionado: false, imagen: "", estado_imagen: "pendiente" as const, resultado_confirmacion: "optimizada", identificador: "SKU-2", titulo: "Vela", tipo: "producto", resumen_datos: "ok" },
      { id: 3, numero: 3, datos: { seccion_publica: "minerales-y-energia" }, errores: [], warnings: [], estado: "descartada", seleccionado: false, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ausente", identificador: "SKU-3", titulo: "Cuarzo", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const secciones = resolverSeccionesAfectadasImportacion(detalle, "velas-e-incienso");

  assert.deepEqual(secciones, ["velas-e-incienso"]);
});

test("sincronizarProductoMutado mantiene fuente de verdad única del padre antes del refresco contextual", () => {
  const base = [
    { id: "prod-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: false },
    { id: "prod-2", nombre: "Vela", seccion_publica: "velas-e-incienso", publicado: true },
  ];
  const mutado = { id: "prod-1", nombre: "Rosa", seccion_publica: "botica-natural", publicado: true };

  const sincronizado = sincronizarProductoMutado(base, mutado);

  assert.equal(sincronizado.find((item) => item.id === "prod-1")?.publicado, true);
  assert.equal(sincronizado.find((item) => item.id === "prod-2")?.publicado, true);
});

test("publicar o despublicar sincroniza el item mutado antes del refresco contextual", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /const itemActualizado = await cambiarPublicacionAdmin\(modulo, String\(item\.id\), !Boolean\(item\[campoEstado\]\), token\);/);
  assert.match(componente, /onItemMutado\?\.\(itemActualizado\);/);
});
