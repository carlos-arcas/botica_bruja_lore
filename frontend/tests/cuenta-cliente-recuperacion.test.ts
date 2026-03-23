import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  describirRecuperacionGenerica,
  resolverEstadoRecuperacionPorCodigo,
  resolverMensajeEstadoRecuperacion,
  validarPasswordRecuperacion,
} from "../contenido/cuenta_cliente/recuperacionPassword";
import { confirmarRecuperacionPassword, solicitarRecuperacionPassword } from "../infraestructura/api/cuentasCliente";

test("ruta de cuenta real expone recuperación de contraseña", () => {
  assert.match(describirRecuperacionGenerica().toLowerCase(), /si existe una cuenta/);
});

test("valida formulario de nueva contraseña", () => {
  assert.match(validarPasswordRecuperacion("123", "123") ?? "", /al menos 8 caracteres/);
  assert.match(validarPasswordRecuperacion("ClaveNueva123", "OtraClave123") ?? "", /no coinciden/);
  assert.equal(validarPasswordRecuperacion("ClaveNueva123", "ClaveNueva123"), null);
});

test("interpreta estados inválido, expirado y usado", () => {
  assert.equal(resolverEstadoRecuperacionPorCodigo("token_invalido"), "token_invalido");
  assert.equal(resolverEstadoRecuperacionPorCodigo("token_expirado"), "token_expirado");
  assert.equal(resolverEstadoRecuperacionPorCodigo("token_usado"), "token_usado");
  assert.match(resolverMensajeEstadoRecuperacion("token_expirado").toLowerCase(), /expirado/);
});

test("api de solicitud devuelve éxito genérico", async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({
    detalle: "Si existe una cuenta para ese email, te hemos enviado un enlace para restablecer la contraseña.",
    recuperacion: { email: "lore@test.dev", expira_en: null, solicitud_generada: false },
  }), { status: 200 })) as typeof fetch;

  const resultado = await solicitarRecuperacionPassword({ email: "lore@test.dev" });

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") assert.match(resultado.mensaje.toLowerCase(), /si existe una cuenta/);
});

test("api de confirmación distingue token inválido y éxito", async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({ detalle: "El token de recuperación no es válido.", codigo: "token_invalido" }), { status: 400 })) as typeof fetch;
  const error = await confirmarRecuperacionPassword({ token: "x", password: "ClaveNueva123" });
  assert.equal(error.estado, "error");
  if (error.estado === "error") assert.equal(error.codigo, "token_invalido");

  globalThis.fetch = (async () => new Response(JSON.stringify({ cuenta: { id_usuario: "usr-1", email: "lore@test.dev", nombre_visible: "Lore", activo: true, email_verificado: true, fecha_creacion: "2026-03-22", fecha_actualizacion: "2026-03-22" } }), { status: 200 })) as typeof fetch;
  const ok = await confirmarRecuperacionPassword({ token: "ok", password: "ClaveNueva123" });
  assert.equal(ok.estado, "ok");
});
