import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("visor debug existe como pantalla técnica no indexable", () => {
  const page = readFileSync("app/debug/logs/page.tsx", "utf8");
  assert.match(page, /robots: \{ index: false/);
  assert.match(page, /debugLogViewerHabilitado/);
});

test("visor debug arranca bloqueado y usa sessionStorage", () => {
  const viewer = readFileSync("componentes/debug/DebugLogViewer.tsx", "utf8");
  assert.match(viewer, /const \[estadoVisor, setEstadoVisor\] = useState<EstadoVisor>\("bloqueado"\)/);
  assert.match(viewer, /sessionStorage\.setItem/);
  assert.match(viewer, /sessionStorage\.getItem/);
  assert.match(viewer, /sessionStorage\.removeItem/);
  assert.match(viewer, /Bloquear/);
});

test("frontend no envía clave por query string y usa cabecera canónica", () => {
  const viewer = readFileSync("componentes/debug/DebugLogViewer.tsx", "utf8");
  assert.doesNotMatch(viewer, /debug_key/);
  assert.match(viewer, /X-Debug-Log-Key/);
});

test("visor maneja 403 con estado bloqueado y mensaje claro", () => {
  const viewer = readFileSync("componentes/debug/DebugLogViewer.tsx", "utf8");
  assert.match(viewer, /respuesta\.status === 403/);
  assert.match(viewer, /setEstadoVisor\("bloqueado"\)/);
  assert.match(viewer, /Clave inválida o faltante/);
});

test("proxy debug reenvía clave por cabecera", () => {
  const routeLogs = readFileSync("app/api/debug/logs/route.ts", "utf8");
  const routeClear = readFileSync("app/api/debug/logs/clear/route.ts", "utf8");

  assert.match(routeLogs, /X-Debug-Log-Key/);
  assert.match(routeClear, /X-Debug-Log-Key/);
});
