import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RUTAS_CUENTA_CLIENTE, construirRutaOnboardingEnvioCuenta, resumenCuentaRealV1 } from "../contenido/cuenta_cliente/rutasCuentaCliente";
import { continuarConGoogleCuentaCliente } from "../infraestructura/api/cuentasCliente";

test("rutas canonicas de cuenta real separan acceso real y legado demo", () => {
  assert.equal(RUTAS_CUENTA_CLIENTE.registro, "/registro");
  assert.equal(RUTAS_CUENTA_CLIENTE.acceso, "/acceso");
  assert.equal(RUTAS_CUENTA_CLIENTE.cuenta, "/mi-cuenta");
  assert.equal(RUTAS_CUENTA_CLIENTE.recuperarPassword, "/recuperar-password");
  assert.equal(RUTAS_CUENTA_CLIENTE.pedidos, "/mi-cuenta/pedidos");
  assert.equal(construirRutaOnboardingEnvioCuenta(), "/mi-cuenta/direcciones?onboarding=1");
  assert.equal(
    construirRutaOnboardingEnvioCuenta("Completa tu envio despues"),
    "/mi-cuenta/direcciones?onboarding=1&mensaje=Completa+tu+envio+despues",
  );
  assert.equal(RUTAS_CUENTA_CLIENTE.legadoDemo, "/cuenta-demo");
});

test("resumenCuentaRealV1 documenta sesion real, Google y onboarding", () => {
  const resumen = resumenCuentaRealV1().join(" ").toLowerCase();
  assert.match(resumen, /sesion segura|sesi.n segura/);
  assert.match(resumen, /google/);
  assert.match(resumen, /onboarding opcional/);
  assert.match(resumen, /pedidos reales/);
  assert.match(resumen, /cuentademo|cuenta demo/);
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
