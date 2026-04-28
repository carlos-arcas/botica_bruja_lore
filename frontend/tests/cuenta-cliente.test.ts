import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  RUTAS_CUENTA_CLIENTE,
  resumenCuentaRealV1,
} from "../contenido/cuenta_cliente/rutasCuentaCliente";

test("rutas canonicas de cuenta real separan acceso real y legado", () => {
  assert.equal(RUTAS_CUENTA_CLIENTE.registro, "/registro");
  assert.equal(RUTAS_CUENTA_CLIENTE.acceso, "/acceso");
  assert.equal(RUTAS_CUENTA_CLIENTE.cuenta, "/mi-cuenta");
  assert.equal(RUTAS_CUENTA_CLIENTE.recuperarPassword, "/recuperar-password");
  assert.equal(RUTAS_CUENTA_CLIENTE.pedidos, "/mi-cuenta/pedidos");
  assert.equal(RUTAS_CUENTA_CLIENTE.direcciones, "/mi-cuenta/direcciones");
  assert.equal(RUTAS_CUENTA_CLIENTE.legadoDemo, "/cuenta-demo");
});

test("resumenCuentaRealV1 documenta mi cuenta sin promocion publica del legado", () => {
  const resumen = resumenCuentaRealV1().join(" ").toLowerCase();

  assert.match(resumen, /cuenta de cliente|mi cuenta/);
  assert.match(resumen, /pedidos asociados/);
  assert.match(resumen, /mi cuenta/);
  assert.doesNotMatch(resumen, /cuentademo|cuenta demo/);
});

test("mi cuenta visible no ofrece CTA hacia cuenta-demo", () => {
  const panel = readFileSync(
    "componentes/cuenta_cliente/PanelCuentaCliente.tsx",
    "utf8",
  );

  assert.equal(panel.includes("RUTAS_CUENTA_CLIENTE.legadoDemo"), false);
  assert.equal(panel.includes("Legado demo"), false);
  assert.equal(panel.includes("Mis direcciones guardadas"), true);
  assert.equal(panel.includes("Descargar documento fiscal"), true);
});

test("continuarConGoogleCuentaCliente usa el endpoint dedicado y devuelve nueva cuenta", async () => {
  const originalFetch = globalThis.fetch;
  const llamadas: Array<{ url: string; method: string; body: string | null }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    llamadas.push({
      url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : null,
    });
    return new Response(
      JSON.stringify({
        cuenta: {
          id_usuario: "usr-google",
          email: "google@test.dev",
          nombre_visible: "Lore Google",
          activo: true,
          email_verificado: true,
          fecha_creacion: "2026-03-28T00:00:00Z",
          fecha_actualizacion: "2026-03-28T00:00:00Z",
        },
        es_nueva_cuenta: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  const resultado = await continuarConGoogleCuentaCliente({ credential: "cred-google" });

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.es_nueva_cuenta, true);
    assert.equal(resultado.cuenta.email, "google@test.dev");
  }
  assert.deepEqual(llamadas, [
    {
      url: "/api/cuenta/google",
      method: "POST",
      body: JSON.stringify({ credential: "cred-google" }),
    },
  ]);
  globalThis.fetch = originalFetch;
});
