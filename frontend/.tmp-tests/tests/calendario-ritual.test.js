"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("node:assert/strict");
const node_test_1 = require("node:test");
const calendarioRitual_1 = require("../infraestructura/api/calendarioRitual");
(0, node_test_1.test)("esFechaCalendarioValida acepta formato ISO corto", () => {
    assert.equal((0, calendarioRitual_1.esFechaCalendarioValida)("2026-03-22"), true);
    assert.equal((0, calendarioRitual_1.esFechaCalendarioValida)("22-03-2026"), false);
});
(0, node_test_1.test)("consultarCalendarioRitualPorFecha devuelve rituales mapeados", async () => {
    const originalFetch = global.fetch;
    global.fetch = (async () => ({
        ok: true,
        json: async () => ({
            fecha_consulta: "2026-03-22",
            rituales: [
                {
                    slug: "cierre-sereno",
                    nombre: "Cierre sereno",
                    contexto_breve: "Respira y prepara cierre lunar.",
                    nombre_regla: "Ventana prioritaria",
                    prioridad: 1,
                },
            ],
        }),
    }));
    const resultado = await (0, calendarioRitual_1.consultarCalendarioRitualPorFecha)("2026-03-22");
    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
        assert.equal(resultado.rituales.length, 1);
        assert.equal(resultado.rituales[0]?.urlDetalle, "/rituales/cierre-sereno");
    }
    global.fetch = originalFetch;
});
(0, node_test_1.test)("consultarCalendarioRitualPorFecha devuelve error para fecha inválida", async () => {
    const resultado = await (0, calendarioRitual_1.consultarCalendarioRitualPorFecha)("22-03-2026");
    assert.equal(resultado.estado, "error");
    if (resultado.estado === "error") {
        assert.equal(resultado.codigo, 400);
    }
});
(0, node_test_1.test)("consultarCalendarioRitualPorFecha cubre estado vacío", async () => {
    const originalFetch = global.fetch;
    global.fetch = (async () => ({
        ok: true,
        json: async () => ({ fecha_consulta: "2026-04-10", rituales: [] }),
    }));
    const resultado = await (0, calendarioRitual_1.consultarCalendarioRitualPorFecha)("2026-04-10");
    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
        assert.equal(resultado.rituales.length, 0);
    }
    global.fetch = originalFetch;
});
(0, node_test_1.test)("consultarCalendarioRitualPorFecha propaga error API", async () => {
    const originalFetch = global.fetch;
    global.fetch = (async () => ({
        ok: false,
        status: 400,
        json: async () => ({ detalle: "Formato de fecha inválido." }),
    }));
    const resultado = await (0, calendarioRitual_1.consultarCalendarioRitualPorFecha)("2026-13-50");
    assert.equal(resultado.estado, "error");
    if (resultado.estado === "error") {
        assert.match(resultado.mensaje, /formato de fecha/i);
    }
    global.fetch = originalFetch;
});
