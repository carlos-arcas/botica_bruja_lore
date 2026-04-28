import { test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { agregarProducto, crearCestaVacia } from "../contenido/catalogo/cestaRitual";
import { convertirCestaAItemsCheckoutReal, resolverResumenCestaReal } from "../contenido/catalogo/cestaReal";
import {
  construirEstadoInicialCheckoutReal,
  construirPayloadPedidoReal,
  construirResultadoLineasPedidoReal,
} from "../contenido/catalogo/checkoutReal";
import { resolverEsPagoSimuladoLocal } from "../contenido/pedidos/pagoSimuladoLocal";
import { crearPedidoPublico, confirmarPagoSimuladoPedido, iniciarPagoPedido } from "../infraestructura/api/pedidos";

const raiz = process.cwd();

test("recorrido frontend convierte cesta comprable en payload real sin contrato demo", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const resumen = resolverResumenCestaReal(cesta);
  const itemsCheckout = convertirCestaAItemsCheckoutReal(cesta);
  const resultado = construirResultadoLineasPedidoReal(itemsCheckout, "", "1");
  const payload = construirPayloadPedidoReal(_datosCheckout(), resultado.lineasConvertibles);

  assert.equal(resumen.puedeFinalizarCompra, true);
  assert.equal(itemsCheckout.length, 1);
  assert.equal(payload.canal_checkout, "web_invitado");
  assert.equal("email" in payload, false);
  assert.equal("canal" in payload, false);
  assert.equal("precio_unitario_demo" in payload.lineas[0], false);
});

test("cliente frontend completa pedido real con pago simulado sin rutas legacy", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    if (url.endsWith("/api/pedidos")) return _respuestaOk({ pedido: _pedido("pendiente_pago", "pendiente") });
    if (url.endsWith("/api/pedidos/PED-LOCAL-1/iniciar-pago")) return _respuestaOk({ pago: _pagoSimulado() });
    if (url.endsWith("/api/pedidos/PED-LOCAL-1/confirmar-pago-simulado")) {
      return _respuestaOk({ pedido: _pedido("pagado", "pagado") });
    }
    throw new Error(`Ruta inesperada: ${url}`);
  }) as typeof fetch;

  const crear = await crearPedidoPublico(_payloadApi());
  assert.equal(crear.estado, "ok");
  const pago = await iniciarPagoPedido("PED-LOCAL-1");
  const confirmar = await confirmarPagoSimuladoPedido("PED-LOCAL-1");

  assert.equal(pago.estado, "ok");
  assert.equal(confirmar.estado, "ok");
  if (pago.estado === "ok") assert.equal(resolverEsPagoSimuladoLocal(pago.pago), true);
  if (confirmar.estado === "ok") assert.equal(confirmar.pedido.estado_pago, "pagado");
  assert.deepEqual(llamadas, [
    "/api/pedidos",
    "/api/pedidos/PED-LOCAL-1/iniciar-pago",
    "/api/pedidos/PED-LOCAL-1/confirmar-pago-simulado",
  ]);
  assert.equal(llamadas.some((url) => /pedido-demo|cuenta-demo|encargo/.test(url)), false);
});

test("contrato estatico protege CTAs principales hacia checkout y cuenta real", () => {
  const navegacion = _leer("contenido/shell/navegacionGlobal.ts");
  const cesta = _leer("componentes/catalogo/cesta/VistaCestaRitual.tsx");
  const ficha = _leer("componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx");
  const checkout = _leer("componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx");
  const recibo = _leer("componentes/catalogo/checkout-real/ReciboPedidoReal.tsx");

  assert.equal(navegacion.includes('href: "/checkout"'), true);
  assert.equal(navegacion.includes('href: "/mi-cuenta"'), true);
  assert.equal(navegacion.includes("cuenta-demo"), false);
  assert.equal(cesta.includes("Finalizar compra"), true);
  assert.equal(cesta.includes("href={hrefCheckout}"), true);
  assert.equal(ficha.includes("/checkout"), true);
  assert.equal(checkout.includes("PedidoDemo"), false);
  assert.equal(recibo.includes("confirmarPagoSimuladoPedido"), true);
  assert.equal(recibo.includes("Descargar documento fiscal"), true);
});

function _datosCheckout() {
  return {
    ...construirEstadoInicialCheckoutReal(),
    email_contacto: "local@test.dev",
    nombre_contacto: "Lore",
    telefono_contacto: "600000000",
    nombre_destinatario: "Lore",
    linea_1: "Calle Luna 1",
    codigo_postal: "28001",
    ciudad: "Madrid",
    provincia: "Madrid",
  };
}

function _payloadApi() {
  return {
    ...construirPayloadPedidoReal(_datosCheckout(), [
      {
        id_producto: "prod-1",
        slug_producto: "infusion-bruma-lavanda",
        nombre_producto: "Infusion",
        cantidad_comercial: 1,
        unidad_comercial: "ud",
        precio_unitario: "6.90",
        moneda: "EUR",
      },
    ]),
  };
}

function _pedido(estado: string, estadoPago: string) {
  return {
    id_pedido: "PED-LOCAL-1",
    estado,
    estado_pago: estadoPago,
    canal_checkout: "web_invitado",
    moneda: "EUR",
    subtotal: "6.90",
    total: "14.28",
    inventario_descontado: estadoPago === "pagado",
    requiere_revision_manual: false,
    email_post_pago_enviado: estadoPago === "pagado",
    cliente: { email_contacto: "local@test.dev", nombre_contacto: "Lore", telefono_contacto: "600000000", es_invitado: true },
    direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", linea_2: "", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", observaciones: "" },
    resumen: { cantidad_total_items: 1, subtotal: "6.90", importe_envio: "4.90", base_imponible: "11.80", importe_impuestos: "2.48", total: "14.28" },
    lineas: [],
    notas_cliente: "",
    pago: { proveedor_pago: "simulado_local", estado_pago: estadoPago },
    expedicion: { transportista: "", codigo_seguimiento: "", envio_sin_seguimiento: false, fecha_preparacion: null, fecha_envio: null, fecha_entrega: null, observaciones_operativas: "", email_envio_enviado: false },
  };
}

function _pagoSimulado() {
  return {
    id_pedido: "PED-LOCAL-1",
    proveedor_pago: "simulado_local",
    id_externo_pago: "SIM-PED-LOCAL-1-op",
    estado_pago: "requiere_accion",
    moneda: "EUR",
    importe: "14.28",
    url_pago: "/pedido/PED-LOCAL-1?pago=simulado",
  };
}

function _respuestaOk(payload: object): Response {
  return { ok: true, json: async () => payload } as Response;
}

function _leer(ruta: string): string {
  return readFileSync(join(raiz, ruta), "utf8");
}
