import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

test("la pantalla de pedido real muestra tracking y mensajes de estado operativo", () => {
  const archivo = fs.readFileSync(path.join(process.cwd(), "componentes/catalogo/checkout-real/ReciboPedidoReal.tsx"), "utf8");
  assert.equal(archivo.includes("Transportista:"), true);
  assert.equal(archivo.includes("Tracking:"), true);
  assert.equal(archivo.includes("pedido.expedicion.email_envio_enviado"), true);
  assert.equal(archivo.includes('pedido.estado === "enviado"'), true);
});

test("el módulo admin de pedidos ofrece acciones de preparación, envío y entrega", () => {
  const archivo = fs.readFileSync(path.join(process.cwd(), "componentes/admin/ModuloPedidosAdmin.tsx"), "utf8");
  assert.equal(archivo.includes("Marcar preparando"), true);
  assert.equal(archivo.includes("Marcar enviado"), true);
  assert.equal(archivo.includes("Marcar entregado"), true);
  assert.equal(archivo.includes("Envío sin tracking público"), true);
});
