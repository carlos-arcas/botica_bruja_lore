import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("visor debug existe como pantalla técnica no indexable", () => {
  const page = readFileSync("app/debug/logs/page.tsx", "utf8");
  assert.match(page, /robots: \{ index: false/);
  assert.match(page, /DebugLogViewer/);
});

test("proxy debug reenvía clave por cabecera", () => {
  const routeLogs = readFileSync("app/api/debug/logs/route.ts", "utf8");
  const routeClear = readFileSync("app/api/debug/logs/clear/route.ts", "utf8");

  assert.match(routeLogs, /X-Debug-Log-Key/);
  assert.match(routeClear, /X-Debug-Log-Key/);
});
