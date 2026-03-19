import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  guardarPedidoRecienteDemo,
  leerPedidoRecienteDemo,
  limpiarPedidoRecienteDemo,
  pedidoRecientePerteneceASesion,
} from "../contenido/cuenta_demo/pedidoRecienteDemo";

test("guardarPedidoRecienteDemo persiste el último pedido autenticado tras checkout exitoso", () => {
  const originalWindow = global.window;
  const originalDateNow = Date.now;
  const storage = new Map<string, string>();

  Date.now = () => Date.parse("2026-03-19T10:00:00.000Z");
  global.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  } as Window & typeof globalThis;

  guardarPedidoRecienteDemo("PD-321", { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" });
  const pedidoReciente = leerPedidoRecienteDemo();

  assert.equal(pedidoReciente?.idPedido, "PD-321");
  assert.equal(pedidoReciente?.idUsuario, "usr-10");

  Date.now = originalDateNow;
  global.window = originalWindow;
});

test("guardarPedidoRecienteDemo ignora invitado o datos inválidos", () => {
  const originalWindow = global.window;
  const storage = new Map<string, string>();

  global.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  } as Window & typeof globalThis;

  guardarPedidoRecienteDemo("   ", { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" });
  guardarPedidoRecienteDemo("PD-999", null);

  assert.equal(leerPedidoRecienteDemo(), null);
  global.window = originalWindow;
});

test("pedidoRecientePerteneceASesion valida la continuidad contra la sesión demo activa", () => {
  const pertenece = pedidoRecientePerteneceASesion(
    { idPedido: "PD-123", idUsuario: "usr-10", creadoEn: "2026-03-19T10:00:00.000Z" },
    { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" },
    "PD-123",
  );

  const noPertenece = pedidoRecientePerteneceASesion(
    { idPedido: "PD-123", idUsuario: "usr-11", creadoEn: "2026-03-19T10:00:00.000Z" },
    { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" },
    "PD-123",
  );

  assert.equal(pertenece, true);
  assert.equal(noPertenece, false);
});

test("limpiarPedidoRecienteDemo elimina el estado de continuidad tras consumirlo", () => {
  const originalWindow = global.window;
  const storage = new Map<string, string>();

  global.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  } as Window & typeof globalThis;

  guardarPedidoRecienteDemo("PD-333", { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" });
  limpiarPedidoRecienteDemo();

  assert.equal(leerPedidoRecienteDemo(), null);
  global.window = originalWindow;
});

test("leerPedidoRecienteDemo invalida y limpia estados caducados", () => {
  const originalWindow = global.window;
  const originalDateNow = Date.now;
  const storage = new Map<string, string>();

  Date.now = () => Date.parse("2026-03-19T12:00:00.000Z");
  storage.set("botica.cuenta_demo.pedido_reciente.v1", JSON.stringify({
    version: 1,
    idPedido: "PD-444",
    idUsuario: "usr-10",
    creadoEn: "2026-03-19T10:00:00.000Z",
  }));

  global.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  } as Window & typeof globalThis;

  assert.equal(leerPedidoRecienteDemo(), null);
  assert.equal(storage.has("botica.cuenta_demo.pedido_reciente.v1"), false);

  Date.now = originalDateNow;
  global.window = originalWindow;
});
