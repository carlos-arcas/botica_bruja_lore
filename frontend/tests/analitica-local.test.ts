import { test } from "node:test";
import * as assert from "node:assert/strict";

import {
  analiticaLocalActiva,
  construirEventoEmbudoLocal,
  contieneCamposPersonales,
  emitirEventoEmbudoLocal,
} from "../contenido/analitica/embudoLocal";
import { confirmarPagoSimuladoPedido, iniciarPagoPedido } from "../infraestructura/api/pedidos";

test("analitica local construye eventos sin PII", () => {
  const evento = construirEventoEmbudoLocal(
    "producto_anadido_cesta",
    { slug_producto: "infusion-bruma-lavanda", cantidad: 2 },
    "2026-04-28T10:00:00.000Z",
  );

  assert.equal(evento.tipo, "producto_anadido_cesta");
  assert.equal(evento.slug_producto, "infusion-bruma-lavanda");
  assert.equal(evento.cantidad, 2);
  assert.equal(contieneCamposPersonales(evento as unknown as Record<string, unknown>), false);
});

test("analitica local se puede desactivar por configuracion", () => {
  assert.equal(analiticaLocalActiva("false"), false);
  assert.equal(analiticaLocalActiva("true"), true);
});

test("emisor local usa consola estructurada solo cuando esta activo", () => {
  const anterior = process.env.NEXT_PUBLIC_ANALITICA_LOCAL;
  const llamadas: unknown[][] = [];
  const infoOriginal = console.info;
  console.info = (...args: unknown[]) => {
    llamadas.push(args);
  };
  try {
    process.env.NEXT_PUBLIC_ANALITICA_LOCAL = "false";
    emitirEventoEmbudoLocal("checkout_iniciado", { ruta: "/checkout" });
    process.env.NEXT_PUBLIC_ANALITICA_LOCAL = "true";
    emitirEventoEmbudoLocal("checkout_iniciado", { ruta: "/checkout" });
  } finally {
    console.info = infoOriginal;
    process.env.NEXT_PUBLIC_ANALITICA_LOCAL = anterior;
  }

  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0][0], "botica_embudo_local");
  assert.equal((llamadas[0][1] as { tipo: string }).tipo, "checkout_iniciado");
});

test("api de pedidos emite hitos de pago simulado sin datos personales", async () => {
  const anterior = process.env.NEXT_PUBLIC_ANALITICA_LOCAL;
  const eventos: Array<{ tipo: string; id_pedido?: string; proveedor_pago?: string }> = [];
  const infoOriginal = console.info;
  console.info = (_etiqueta: unknown, evento: unknown) => {
    eventos.push(evento as { tipo: string; id_pedido?: string; proveedor_pago?: string });
  };
  globalThis.fetch = (async (url: string) => {
    if (url.endsWith("/iniciar-pago")) return respuestaOk({ pago: pagoSimulado() });
    if (url.endsWith("/confirmar-pago-simulado")) return respuestaOk({ pedido: pedidoPagado() });
    throw new Error(`Ruta inesperada: ${url}`);
  }) as typeof fetch;

  try {
    process.env.NEXT_PUBLIC_ANALITICA_LOCAL = "true";
    await iniciarPagoPedido("PED-LOCAL-1");
    await confirmarPagoSimuladoPedido("PED-LOCAL-1");
  } finally {
    console.info = infoOriginal;
    process.env.NEXT_PUBLIC_ANALITICA_LOCAL = anterior;
  }

  assert.deepEqual(eventos.map((evento) => evento.tipo), [
    "pago_simulado_iniciado",
    "pago_simulado_confirmado",
    "pedido_pagado",
  ]);
  assert.equal(eventos.some((evento) => contieneCamposPersonales(evento as Record<string, unknown>)), false);
});

function pagoSimulado() {
  return {
    id_pedido: "PED-LOCAL-1",
    proveedor_pago: "simulado_local",
    id_externo_pago: "SIM-PED-LOCAL-1-op",
    estado_pago: "requiere_accion",
    moneda: "EUR",
    importe: "14.28",
  };
}

function pedidoPagado() {
  return {
    id_pedido: "PED-LOCAL-1",
    estado: "pagado",
    estado_pago: "pagado",
    canal_checkout: "web_invitado",
    moneda: "EUR",
    subtotal: "6.90",
    importe_envio: "4.90",
    base_imponible: "11.80",
    tipo_impositivo: "0.21",
    importe_impuestos: "2.48",
    total: "14.28",
    requiere_revision_manual: false,
    email_post_pago_enviado: true,
    cliente: { email_contacto: "local@test.dev", nombre_contacto: "Lore", telefono_contacto: "600000000", es_invitado: true },
    direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", linea_2: "", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", observaciones: "" },
    resumen: { cantidad_total_items: 1, subtotal: "6.90", importe_envio: "4.90", base_imponible: "11.80", importe_impuestos: "2.48", total: "14.28" },
    lineas: [],
    notas_cliente: "",
    pago: { proveedor_pago: "simulado_local", estado_pago: "pagado" },
    expedicion: { transportista: "", codigo_seguimiento: "", envio_sin_seguimiento: false, fecha_preparacion: null, fecha_envio: null, fecha_entrega: null, observaciones_operativas: "", email_envio_enviado: false },
  };
}

function respuestaOk(payload: object): Response {
  return { ok: true, json: async () => payload } as Response;
}
