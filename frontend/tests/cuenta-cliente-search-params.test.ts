import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const leerArchivo = (rutaRelativa: string): string => readFileSync(join(process.cwd(), rutaRelativa), "utf8");

test("las páginas de cuenta real aíslan search params tras Suspense", () => {
  const paginaCuenta = leerArchivo("app/mi-cuenta/page.tsx");
  const paginaPedidos = leerArchivo("app/mi-cuenta/pedidos/page.tsx");

  assert.match(paginaCuenta, /Suspense/);
  assert.match(paginaCuenta, /PanelCuentaClienteSearchParams/);
  assert.match(paginaPedidos, /Suspense/);
  assert.match(paginaPedidos, /PanelCuentaClienteSearchParams/);
});

test("las pantallas de recuperación y verificación usan wrappers cliente acotados", () => {
  const paginaRecuperacion = leerArchivo("app/recuperar-password/page.tsx");
  const paginaVerificacion = leerArchivo("app/verificar-email/page.tsx");
  const wrapperRecuperacion = leerArchivo("componentes/cuenta_cliente/FormularioRecuperacionPasswordSearchParams.tsx");
  const wrapperVerificacion = leerArchivo("componentes/cuenta_cliente/PantallaVerificarEmailSearchParams.tsx");

  assert.match(paginaRecuperacion, /Suspense/);
  assert.match(paginaRecuperacion, /FormularioRecuperacionPasswordSearchParams/);
  assert.match(paginaVerificacion, /Suspense/);
  assert.match(paginaVerificacion, /PantallaVerificarEmailSearchParams/);
  assert.match(wrapperRecuperacion, /useSearchParams/);
  assert.match(wrapperVerificacion, /useSearchParams/);
});

test("los componentes de presentación reciben token o mensaje desde props en lugar de leer search params", () => {
  const panelCuenta = leerArchivo("componentes/cuenta_cliente/PanelCuentaCliente.tsx");
  const formularioRecuperacion = leerArchivo("componentes/cuenta_cliente/FormularioRecuperacionPassword.tsx");
  const pantallaVerificacion = leerArchivo("componentes/cuenta_cliente/PantallaVerificarEmail.tsx");

  assert.doesNotMatch(panelCuenta, /useSearchParams/);
  assert.match(panelCuenta, /mensajeAlta\?: string \| null/);
  assert.doesNotMatch(formularioRecuperacion, /useSearchParams/);
  assert.match(formularioRecuperacion, /token\?: string \| null/);
  assert.doesNotMatch(pantallaVerificacion, /useSearchParams/);
  assert.match(pantallaVerificacion, /token\?: string \| null/);
});
