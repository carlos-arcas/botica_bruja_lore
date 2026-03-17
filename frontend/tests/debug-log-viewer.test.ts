import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("visor de logs incluye autoactualizacion y refresco manual", () => {
  const visor = readFileSync("componentes/debug/DebugLogViewer.tsx", "utf8");
  assert.equal(visor.includes("Autoactualizar"), true);
  assert.equal(visor.includes("setInterval"), true);
  assert.equal(visor.includes("Refrescar ahora"), true);
});

test("clear de logs se realiza contra proxy interno con clave debug", () => {
  const route = readFileSync("app/api/debug/logs/clear/route.ts", "utf8");
  assert.equal(route.includes('"X-Debug-Log-Key"'), true);
  assert.equal(route.includes('method: "POST"'), true);
});
