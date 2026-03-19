import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  autenticarCuentaDemo,
  obtenerHistorialCuentaDemo,
  obtenerPerfilCuentaDemo,
  registrarCuentaDemo,
} from "../infraestructura/api/cuentasDemo";
import {
  guardarSesionCuentaDemo,
  leerSesionCuentaDemo,
  limpiarSesionCuentaDemo,
  validarCamposAutenticacionDemo,
  validarCamposRegistroDemo,
} from "../contenido/cuenta_demo/estadoCuentaDemo";
import { resolverRetornoCuentaDemo } from "../contenido/cuenta_demo/retornoCuentaDemo";

test("validarCamposRegistroDemo detecta campos inválidos", () => {
  const errores = validarCamposRegistroDemo({ email: "demo", nombre_visible: "", clave_acceso_demo: "1" });
  assert.equal(errores.length, 3);
});

test("validarCamposAutenticacionDemo detecta email/clave vacíos", () => {
  const errores = validarCamposAutenticacionDemo({ email: "", clave_acceso_demo: "" });
  assert.equal(errores.length, 2);
});

test("registrarCuentaDemo devuelve cuenta al crear registro válido", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ cuenta: { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Demo" } }),
  })) as unknown as typeof fetch;

  const resultado = await registrarCuentaDemo({
    email: "demo@botica.test",
    nombre_visible: "Demo",
    clave_acceso_demo: "bruma",
  });

  assert.equal(resultado.estado, "ok");
  global.fetch = originalFetch;
});

test("registrarCuentaDemo propaga error de validación backend", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: false,
    status: 400,
    json: async () => ({ detalle: "El campo 'email' es obligatorio y debe ser texto." }),
  })) as unknown as typeof fetch;

  const resultado = await registrarCuentaDemo({ email: "", nombre_visible: "", clave_acceso_demo: "" });

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.match(resultado.mensaje, /email/i);
  }
  global.fetch = originalFetch;
});

test("autenticarCuentaDemo devuelve cuenta para credencial válida", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ cuenta: { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Demo" } }),
  })) as unknown as typeof fetch;

  const resultado = await autenticarCuentaDemo({ email: "demo@botica.test", clave_acceso_demo: "bruma" });

  assert.equal(resultado.estado, "ok");
  global.fetch = originalFetch;
});

test("autenticarCuentaDemo devuelve error para clave inválida", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: false,
    status: 401,
    json: async () => ({ detalle: "Credencial demo inválida para la cuenta indicada." }),
  })) as unknown as typeof fetch;

  const resultado = await autenticarCuentaDemo({ email: "demo@botica.test", clave_acceso_demo: "x" });

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.match(resultado.mensaje, /inválida/i);
  }
  global.fetch = originalFetch;
});

test("obtenerPerfilCuentaDemo carga perfil por id_usuario", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ perfil: { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Demo" } }),
  })) as unknown as typeof fetch;

  const resultado = await obtenerPerfilCuentaDemo("usr-10");
  assert.equal(resultado.estado, "ok");

  global.fetch = originalFetch;
});

test("obtenerHistorialCuentaDemo cubre historial vacío", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ id_usuario: "usr-10", pedidos: [] }),
  })) as unknown as typeof fetch;

  const resultado = await obtenerHistorialCuentaDemo("usr-10");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.pedidos.length, 0);
  }
  global.fetch = originalFetch;
});

test("obtenerHistorialCuentaDemo cubre historial con pedidos", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({
      id_usuario: "usr-10",
      pedidos: [
        {
          id_pedido: "PD-01",
          estado: "creado",
          canal: "autenticado",
          email: "demo@botica.test",
          resumen: { cantidad_total_items: 2, subtotal_demo: "34.00" },
        },
      ],
    }),
  })) as unknown as typeof fetch;

  const resultado = await obtenerHistorialCuentaDemo("usr-10");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.pedidos.length, 1);
  }
  global.fetch = originalFetch;
});

test("obtenerPerfilCuentaDemo devuelve error de API en no encontrado", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: false,
    status: 404,
    json: async () => ({ detalle: "Cuenta demo no encontrada." }),
  })) as unknown as typeof fetch;

  const resultado = await obtenerPerfilCuentaDemo("usr-nope");

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.equal(resultado.codigo, 404);
  }
  global.fetch = originalFetch;
});

test("leerSesionCuentaDemo recupera sesión guardada para reutilizarla en checkout", () => {
  const originalWindow = global.window;
  const storage = new Map<string, string>();

  global.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  } as Window & typeof globalThis;

  guardarSesionCuentaDemo({ id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Demo" });
  const cuenta = leerSesionCuentaDemo();

  assert.equal(cuenta?.id_usuario, "usr-10");
  assert.equal(cuenta?.email, "demo@botica.test");

  global.window = originalWindow;
});

test("limpiarSesionCuentaDemo elimina sesión persistida", () => {
  const originalWindow = global.window;
  const storage = new Map<string, string>();

  global.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  } as Window & typeof globalThis;

  guardarSesionCuentaDemo({ id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Demo" });
  limpiarSesionCuentaDemo();

  assert.equal(leerSesionCuentaDemo(), null);
  global.window = originalWindow;
});


test("resolverRetornoCuentaDemo devuelve /encargo cuando el retorno es válido", () => {
  assert.equal(resolverRetornoCuentaDemo("/encargo"), "/encargo");
});

test("resolverRetornoCuentaDemo ignora returnTo externo o inválido", () => {
  assert.equal(resolverRetornoCuentaDemo("https://evil.test"), null);
  assert.equal(resolverRetornoCuentaDemo("//evil.test"), null);
  assert.equal(resolverRetornoCuentaDemo("/cuenta-demo"), null);
});
