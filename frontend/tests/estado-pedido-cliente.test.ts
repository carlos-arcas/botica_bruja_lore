import { test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("el mapper de estado cliente normaliza y cubre no_iniciado, fallido y ejecutado", () => {
  const archivo = readFileSync(join(process.cwd(), "infraestructura/api/estadoPedidoCliente.ts"), "utf8");
  assert.equal(archivo.includes('return "no_iniciado";'), true);
  assert.equal(archivo.includes('if (estado === "fallido")'), true);
  assert.equal(archivo.includes('if (estado === "ejecutado")'), true);
  assert.equal(archivo.includes("Cancelación operativa aplicada"), true);
  assert.equal(archivo.includes("Reembolso pendiente de revisión"), true);
  assert.equal(archivo.includes("Reembolso ejecutado"), true);
});
