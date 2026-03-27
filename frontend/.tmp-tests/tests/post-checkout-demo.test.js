"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("node:assert/strict");
const node_test_1 = require("node:test");
const pedidoRecienteDemo_1 = require("../contenido/cuenta_demo/pedidoRecienteDemo");
(0, node_test_1.test)("guardarPedidoRecienteDemo persiste el último pedido autenticado tras checkout exitoso", () => {
    const originalWindow = global.window;
    const originalDateNow = Date.now;
    const storage = new Map();
    Date.now = () => Date.parse("2026-03-19T10:00:00.000Z");
    global.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => void storage.set(key, value),
            removeItem: (key) => void storage.delete(key),
        },
    };
    (0, pedidoRecienteDemo_1.guardarPedidoRecienteDemo)("PD-321", { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" });
    const pedidoReciente = (0, pedidoRecienteDemo_1.leerPedidoRecienteDemo)();
    assert.equal(pedidoReciente?.idPedido, "PD-321");
    assert.equal(pedidoReciente?.idUsuario, "usr-10");
    Date.now = originalDateNow;
    global.window = originalWindow;
});
(0, node_test_1.test)("guardarPedidoRecienteDemo ignora invitado o datos inválidos", () => {
    const originalWindow = global.window;
    const storage = new Map();
    global.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => void storage.set(key, value),
            removeItem: (key) => void storage.delete(key),
        },
    };
    (0, pedidoRecienteDemo_1.guardarPedidoRecienteDemo)("   ", { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" });
    (0, pedidoRecienteDemo_1.guardarPedidoRecienteDemo)("PD-999", null);
    assert.equal((0, pedidoRecienteDemo_1.leerPedidoRecienteDemo)(), null);
    global.window = originalWindow;
});
(0, node_test_1.test)("pedidoRecientePerteneceASesion valida la continuidad contra la sesión demo activa", () => {
    const pertenece = (0, pedidoRecienteDemo_1.pedidoRecientePerteneceASesion)({ idPedido: "PD-123", idUsuario: "usr-10", creadoEn: "2026-03-19T10:00:00.000Z" }, { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" }, "PD-123");
    const noPertenece = (0, pedidoRecienteDemo_1.pedidoRecientePerteneceASesion)({ idPedido: "PD-123", idUsuario: "usr-11", creadoEn: "2026-03-19T10:00:00.000Z" }, { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" }, "PD-123");
    assert.equal(pertenece, true);
    assert.equal(noPertenece, false);
});
(0, node_test_1.test)("limpiarPedidoRecienteDemo elimina el estado de continuidad tras consumirlo", () => {
    const originalWindow = global.window;
    const storage = new Map();
    global.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => void storage.set(key, value),
            removeItem: (key) => void storage.delete(key),
        },
    };
    (0, pedidoRecienteDemo_1.guardarPedidoRecienteDemo)("PD-333", { id_usuario: "usr-10", email: "demo@botica.test", nombre_visible: "Lore" });
    (0, pedidoRecienteDemo_1.limpiarPedidoRecienteDemo)();
    assert.equal((0, pedidoRecienteDemo_1.leerPedidoRecienteDemo)(), null);
    global.window = originalWindow;
});
(0, node_test_1.test)("leerPedidoRecienteDemo invalida y limpia estados caducados", () => {
    const originalWindow = global.window;
    const originalDateNow = Date.now;
    const storage = new Map();
    Date.now = () => Date.parse("2026-03-19T12:00:00.000Z");
    storage.set("botica.cuenta_demo.pedido_reciente.v1", JSON.stringify({
        version: 1,
        idPedido: "PD-444",
        idUsuario: "usr-10",
        creadoEn: "2026-03-19T10:00:00.000Z",
    }));
    global.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => void storage.set(key, value),
            removeItem: (key) => void storage.delete(key),
        },
    };
    assert.equal((0, pedidoRecienteDemo_1.leerPedidoRecienteDemo)(), null);
    assert.equal(storage.has("botica.cuenta_demo.pedido_reciente.v1"), false);
    Date.now = originalDateNow;
    global.window = originalWindow;
});
