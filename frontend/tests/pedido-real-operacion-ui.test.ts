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

test("la pantalla de pedido real refleja cancelación operativa y estado de reembolso para cliente", () => {
  const archivo = fs.readFileSync(path.join(process.cwd(), "componentes/catalogo/checkout-real/ReciboPedidoReal.tsx"), "utf8");
  const mapper = fs.readFileSync(path.join(process.cwd(), "infraestructura/api/estadoPedidoCliente.ts"), "utf8");
  assert.equal(archivo.includes("resolverEstadoVisiblePedidoCliente"), true);
  assert.equal(mapper.includes("Cancelación operativa aplicada"), true);
  assert.equal(mapper.includes("Reembolso pendiente de revisión"), true);
  assert.equal(mapper.includes("Reembolso ejecutado"), true);
});

test("mi cuenta pedidos reutiliza resumen visible de cancelación y reembolso sin duplicar condicionales", () => {
  const archivo = fs.readFileSync(path.join(process.cwd(), "componentes/cuenta_cliente/PanelCuentaCliente.tsx"), "utf8");
  assert.equal(archivo.includes("resolverEstadoVisiblePedidoCliente"), true);
  assert.equal(archivo.includes("cancelación operativa"), true);
  assert.equal(archivo.includes("estadoVisible.reembolso.titulo.toLowerCase()"), true);
});

test("el módulo admin de pedidos ofrece acciones de preparación, envío y entrega", () => {
  const archivo = fs.readFileSync(path.join(process.cwd(), "componentes/admin/ModuloPedidosAdmin.tsx"), "utf8");
  assert.equal(archivo.includes("Marcar preparando"), true);
  assert.equal(archivo.includes("Marcar enviado"), true);
  assert.equal(archivo.includes("Marcar entregado"), true);
  assert.equal(archivo.includes("Envío sin tracking público"), true);
});
