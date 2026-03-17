import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("panel de auth debug solo aparece con NEXT_PUBLIC_AUTH_DEBUG=true", () => {
  const formulario = readFileSync("componentes/admin/FormularioLoginBackoffice.tsx", "utf8");
  const env = readFileSync(".env.example", "utf8");

  assert.match(formulario, /process\.env\.NEXT_PUBLIC_AUTH_DEBUG === "true"/);
  assert.match(formulario, /authDebugActivo \? \(/);
  assert.match(formulario, /Panel de diagnóstico de auth/);
  assert.match(env, /NEXT_PUBLIC_AUTH_DEBUG=false/);
});

test("login usa endpoints /api/auth/* para diagnóstico sin secretos", () => {
  const formulario = readFileSync("componentes/admin/FormularioLoginBackoffice.tsx", "utf8");
  const loginRoute = readFileSync("app/api/backoffice/auth/login/route.ts", "utf8");

  assert.match(formulario, /fetch\("\/api\/auth\/csrf"/);
  assert.match(formulario, /fetch\("\/api\/auth\/login"/);
  assert.match(formulario, /fetch\("\/api\/auth\/status"/);
  assert.match(loginRoute, /reason_code/);
  assert.equal(loginRoute.includes("console.log"), false);
});
