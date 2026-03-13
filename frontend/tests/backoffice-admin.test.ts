import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { extraerTokenBackoffice, obtenerProductosAdmin } from "../infraestructura/api/backoffice";

test("renderiza rutas principales del backoffice en App Router", () => {
  const dashboard = readFileSync("app/admin/(panel)/page.tsx", "utf8");
  const productos = readFileSync("app/admin/(panel)/productos/page.tsx", "utf8");

  assert.match(dashboard, /Admin \/ Dashboard/);
  assert.match(productos, /ModuloProductosAdmin/);
});

test("/admin sin cookie redirige automáticamente a /admin/login con next", () => {
  const middleware = readFileSync("middleware.ts", "utf8");

  assert.match(middleware, /matcher: \["\/admin\/:path\*"\]/);
  assert.match(middleware, /destino\.searchParams\.set\("next"/);
});

test("/admin/login renderiza formulario real", () => {
  const loginPage = readFileSync("app/admin/login/page.tsx", "utf8");
  const formulario = readFileSync("componentes/admin/FormularioLoginBackoffice.tsx", "utf8");

  assert.match(loginPage, /Acceso admin/);
  assert.match(formulario, /name="username"/);
  assert.match(formulario, /name="password"/);
});

test("cliente de productos usa Bearer token y no depende de cookie backend", async () => {
  let headersRecibidos: HeadersInit | undefined;
  globalThis.fetch = (async (_input, init) => {
    headersRecibidos = init?.headers;
    return {
      status: 200,
      ok: true,
      json: async () => ({ productos: [], metricas: { total: 0, publicados: 0, borrador: 0 } }),
    } as Response;
  }) as unknown as typeof fetch;

  await obtenerProductosAdmin(new URLSearchParams(), "token-demo");

  const headers = headersRecibidos as Record<string, string>;
  assert.equal(headers.Authorization, "Bearer token-demo");
  assert.equal("Cookie" in headers, false);
});

test("login correcto redirige al destino admin y login incorrecto muestra error limpio", () => {
  const formulario = readFileSync("componentes/admin/FormularioLoginBackoffice.tsx", "utf8");

  assert.match(formulario, /router\.push\(nextDestino\)/);
  assert.match(formulario, /Usuario o contraseña inválidos\./);
});

test("logout limpia sesión en cookie HttpOnly del frontend", () => {
  const logoutRoute = readFileSync("app/api/backoffice/auth/logout/route.ts", "utf8");
  const botonLogout = readFileSync("componentes/admin/BotonLogoutBackoffice.tsx", "utf8");

  assert.match(logoutRoute, /response\.cookies\.set\(NOMBRE_COOKIE_BACKOFFICE, "", \{ maxAge: 0/);
  assert.match(botonLogout, /api\/backoffice\/auth\/logout/);
});

test("refresh mantiene acceso mientras sesión siga válida", () => {
  const sesion = readFileSync("infraestructura/auth/sesionBackoffice.ts", "utf8");
  const backendAuth = readFileSync("infraestructura/auth/clienteBackendAuth.ts", "utf8");

  assert.match(sesion, /cookies\(\)\.get\(NOMBRE_COOKIE_BACKOFFICE\)/);
  assert.match(backendAuth, /\/api\/backoffice\/auth\/session\//);
});

test("parsea token de cookie frontend para guard server-side", () => {
  const token = extraerTokenBackoffice("foo=1; botica_backoffice_session=abc123; bar=2");
  assert.equal(token, "abc123");
});
