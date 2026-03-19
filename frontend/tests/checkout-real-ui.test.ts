import { test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const archivoFlujo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx"), "utf8");

const archivoPagina = readFileSync(join(process.cwd(), "app/checkout/page.tsx"), "utf8");

test("checkout real no depende de PayloadPedidoDemo ni de CuentaDemo", () => {
  assert.equal(archivoFlujo.includes("PayloadPedidoDemo"), false);
  assert.equal(archivoFlujo.includes("CuentaDemo"), false);
  assert.equal(archivoFlujo.includes("pedidosDemo"), false);
});

test("checkout real expone una ruta dedicada y recibo real propio", () => {
  assert.equal(archivoPagina.includes("FlujoCheckoutReal"), true);
  assert.equal(archivoFlujo.includes("/pedido/"), true);
});
