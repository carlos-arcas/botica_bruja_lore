import { test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const archivoFlujo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx"), "utf8");
const archivoPagina = readFileSync(join(process.cwd(), "app/checkout/page.tsx"), "utf8");
const archivoRecibo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/ReciboPedidoReal.tsx"), "utf8");

test("checkout real no depende de PayloadPedidoDemo ni de CuentaDemo", () => {
  assert.equal(archivoFlujo.includes("PayloadPedidoDemo"), false);
  assert.equal(archivoFlujo.includes("CuentaDemo"), false);
  assert.equal(archivoFlujo.includes("pedidosDemo"), false);
});

test("checkout real expone una ruta dedicada y recibo real propio", () => {
  assert.equal(archivoPagina.includes("FlujoCheckoutReal"), true);
  assert.equal(archivoFlujo.includes("/pedido/"), true);
});

test("recibo real permite iniciar o continuar el pago real sin tocar el flujo demo", () => {
  assert.equal(archivoRecibo.includes("Pagar ahora"), true);
  assert.equal(archivoRecibo.includes("iniciarPagoPedido"), true);
  assert.equal(archivoRecibo.includes("Stripe preparado para iniciar"), true);
});

test("checkout real muestra bloqueo explícito cuando hay líneas visibles no comprables", () => {
  assert.equal(archivoFlujo.includes("El pedido real queda bloqueado porque tu selección visible incluye líneas no comprables."), true);
  assert.equal(archivoFlujo.includes("Separa esas piezas como consulta manual antes de continuar con el pago."), true);
});

test("checkout real separa el modo múltiple del selector único heredado", () => {
  assert.equal(archivoFlujo.includes('modoCheckout === "producto_unico" ? ('), true);
  assert.equal(archivoFlujo.includes("BloquePedidoSeleccionMultiple"), true);
  assert.equal(archivoFlujo.includes("este modo no usa un selector único heredado"), true);
});

test("checkout real en modo múltiple muestra la selección real y las líneas bloqueadas por separado", () => {
  assert.equal(archivoFlujo.includes("Selección real que entra en el pedido"), true);
  assert.equal(archivoFlujo.includes("Selección visible bloqueada fuera del pedido real"), true);
  assert.equal(archivoFlujo.includes("lineasConvertibles.map"), true);
  assert.equal(archivoFlujo.includes("lineasNoConvertibles.map"), true);
});
