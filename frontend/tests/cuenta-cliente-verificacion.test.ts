import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  describirEstadoVerificacion,
  describirResultadoReenvio,
  resolverMensajeConfirmacion,
  resolverMensajePostRegistro,
} from "../contenido/cuenta_cliente/verificacionEmail";
import { confirmarVerificacionEmail, reenviarVerificacionEmail } from "../infraestructura/api/cuentasCliente";

test("mensaje post-registro avisa que debe verificar el email", () => {
  assert.match(resolverMensajePostRegistro().toLowerCase(), /verifica tu email/);
});

test("panel de cuenta puede describir estado pendiente y verificado", () => {
  assert.equal(describirEstadoVerificacion({ email: "lore@test.dev", email_verificado: false }), "Email pendiente de verificación");
  assert.equal(describirEstadoVerificacion({ email: "lore@test.dev", email_verificado: true }), "Email verificado");
});

test("cta de reenvío devuelve copy sobria y profesional", () => {
  assert.match(describirResultadoReenvio({ email: "lore@test.dev", email_verificado: false }), /nuevo enlace de verificación/);
});

test("flujo de confirmación cubre éxito, token inválido y expirado", () => {
  assert.match(resolverMensajeConfirmacion("exito").toLowerCase(), /verificado correctamente/);
  assert.match(resolverMensajeConfirmacion("token_invalido").toLowerCase(), /solicita un nuevo email/);
  assert.match(resolverMensajeConfirmacion("token_expirado").toLowerCase(), /ha expirado/);
});

test("api de reenvío devuelve estado ok cuando backend responde verificación", async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({ verificacion: { email: "lore@test.dev", email_verificado: false, expira_en: null, reenviada: true } }), { status: 200 })) as typeof fetch;

  const resultado = await reenviarVerificacionEmail({ email: "lore@test.dev" });

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") assert.equal(resultado.verificacion.reenviada, true);
});

test("api de confirmación devuelve error estable cuando backend falla", async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({ detalle: "El token de verificación ha expirado." }), { status: 400 })) as typeof fetch;

  const resultado = await confirmarVerificacionEmail({ token: "caducado" });

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") assert.match(resultado.mensaje.toLowerCase(), /expirado/);
});
