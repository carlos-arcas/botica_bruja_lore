import * as assert from "node:assert/strict";
import { test } from "node:test";

import { NextRequest } from "next/server";

import { NOMBRE_COOKIE_CUENTA_CLIENTE } from "../infraestructura/auth/configuracion";
import { reenviarCuenta } from "../infraestructura/auth/cuentaClienteProxy";

function crearRequestCuenta(url: string, init: RequestInit = {}): NextRequest {
  return new NextRequest(url, init);
}

test("reenviarCuenta devuelve 503 JSON cuando fetch falla por red", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  const respuesta = await reenviarCuenta(crearRequestCuenta("http://localhost/api/cuenta/sesion"), ["sesion"]);
  const payload = await respuesta.json();

  assert.equal(respuesta.status, 503);
  assert.equal(respuesta.headers.get("content-type"), "application/json");
  assert.match(String(payload.detalle), /servicio no disponible/i);
  global.fetch = originalFetch;
});

test("reenviarCuenta mantiene cuerpo, status y cookie de sesión en éxito", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () =>
    new Response(JSON.stringify({ cuenta: { email: "lore@botica.test" } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "sessionid=sesion-demo; Path=/; HttpOnly",
      },
    })) as typeof fetch;

  const respuesta = await reenviarCuenta(crearRequestCuenta("http://localhost/api/cuenta/sesion"), ["sesion"]);
  const payload = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.deepEqual(payload, { cuenta: { email: "lore@botica.test" } });
  assert.match(respuesta.headers.get("set-cookie") ?? "", new RegExp(`${NOMBRE_COOKIE_CUENTA_CLIENTE}=sesion-demo`));
  global.fetch = originalFetch;
});
