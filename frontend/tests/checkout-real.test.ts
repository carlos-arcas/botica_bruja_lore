import { test } from "node:test";
import * as assert from "node:assert/strict";

import {
  construirEstadoInicialCheckoutReal,
  construirLineasPedidoReal,
  construirPayloadPedidoReal,
  validarCheckoutReal,
} from "../contenido/catalogo/checkoutReal";
import { construirUrlRetornoPedido, crearPedidoPublico, iniciarPagoPedido } from "../infraestructura/api/pedidos";

test("checkout real usa un payload propio y separado del demo", () => {
  const inicial = construirEstadoInicialCheckoutReal("tarot-bosque-interior");
  const lineas = construirLineasPedidoReal([], "tarot-bosque-interior", "2");
  const payload = construirPayloadPedidoReal(
    {
      ...inicial,
      email_contacto: "real@test.dev",
      nombre_contacto: "Lore",
      telefono_contacto: "600000000",
      nombre_destinatario: "Lore",
      linea_1: "Calle Luna 1",
      codigo_postal: "28001",
      ciudad: "Madrid",
      provincia: "Madrid",
    },
    lineas,
  );

  assert.equal("email" in payload, false);
  assert.equal("canal" in payload, false);
  assert.equal(payload.canal_checkout, "web_invitado");
  assert.equal(payload.direccion_entrega.ciudad, "Madrid");
});

test("checkout real valida dirección obligatoria y modo invitado por defecto", () => {
  const inicial = construirEstadoInicialCheckoutReal();
  const errores = validarCheckoutReal(inicial, []);
  assert.equal(inicial.canal_checkout, "web_invitado");
  assert.equal(Boolean(errores.nombre_destinatario), true);
  assert.equal(Boolean(errores.lineas), true);
});

test("checkout real puede operar como invitado sin id_usuario", () => {
  const datos = {
    ...construirEstadoInicialCheckoutReal("vela-intencion-clara"),
    email_contacto: "guest@test.dev",
    nombre_contacto: "Invitada",
    telefono_contacto: "611111111",
    nombre_destinatario: "Invitada",
    linea_1: "Calle Sol 3",
    codigo_postal: "41001",
    ciudad: "Sevilla",
    provincia: "Sevilla",
  };
  const lineas = construirLineasPedidoReal([], "vela-intencion-clara", "1");
  const payload = construirPayloadPedidoReal(datos, lineas);
  assert.equal(payload.id_usuario, undefined);
  assert.equal(payload.canal_checkout, "web_invitado");
});

test("cliente API de pedidos reales usa la ruta nueva /api/v1/pedidos/", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    return {
      ok: true,
      json: async () => ({ pedido: { id_pedido: "PED-1", estado: "pendiente_pago", estado_pago: "pendiente", canal_checkout: "web_invitado", moneda: "EUR", subtotal: "9.90", requiere_revision_manual: false, email_post_pago_enviado: false, cliente: { email_contacto: "real@test.dev", nombre_contacto: "Lore", telefono_contacto: "600", es_invitado: true }, direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", linea_2: "", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", observaciones: "" }, resumen: { cantidad_total_items: 1, subtotal: "9.90" }, lineas: [], notas_cliente: "", pago: {} } }),
    } as Response;
  }) as typeof fetch;

  const resultado = await crearPedidoPublico({
    email_contacto: "real@test.dev",
    nombre_contacto: "Lore",
    telefono_contacto: "600",
    canal_checkout: "web_invitado",
    direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES" },
    lineas: [{ id_producto: "p1", slug_producto: "vela", nombre_producto: "Vela", cantidad: 1, precio_unitario: "9.90", moneda: "EUR" }],
    moneda: "EUR",
  });

  assert.equal(resultado.estado, "ok");
  assert.equal(llamadas[0].endsWith("/api/v1/pedidos/"), true);
});

test("frontend real consume la nueva API de pago", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    return {
      ok: true,
      json: async () => ({ pago: { id_pedido: "PED-1", proveedor_pago: "stripe", id_externo_pago: "cs_test_123", estado_pago: "requiere_accion", moneda: "EUR", importe: "9.90", url_pago: "https://checkout.stripe.test/cs_test_123" } }),
    } as Response;
  }) as typeof fetch;

  const resultado = await iniciarPagoPedido("PED-1");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.pago.proveedor_pago, "stripe");
  }
  assert.equal(llamadas[0].endsWith("/api/v1/pedidos/PED-1/iniciar-pago/"), true);
});

test("frontend construye retornos success y cancel para la pantalla de pedido", () => {
  assert.equal(construirUrlRetornoPedido("PED-1", "success", "cs_123"), "/pedido/PED-1?retorno_pago=success&session_id=cs_123");
  assert.equal(construirUrlRetornoPedido("PED-1", "cancel"), "/pedido/PED-1?retorno_pago=cancel");
});
