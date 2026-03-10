import * as assert from "node:assert/strict";
import { test } from "node:test";

import { esFechaIsoValida } from "../contenido/rituales/calendarioRitual";
import { consultarCalendarioRitualPorFecha } from "../infraestructura/api/calendarioRitual";

test("esFechaIsoValida valida formato ISO y fechas reales", () => {
  assert.equal(esFechaIsoValida("2026-03-22"), true);
  assert.equal(esFechaIsoValida("2026-02-30"), false);
  assert.equal(esFechaIsoValida("22-03-2026"), false);
  assert.equal(esFechaIsoValida(""), false);
});

test("consultarCalendarioRitualPorFecha devuelve error de fecha inválida sin llamar API", async () => {
  const originalFetch = global.fetch;
  let llamadas = 0;
  global.fetch = (async () => {
    llamadas += 1;
    return { ok: true, json: async () => ({}) } as Response;
  }) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("10-04-2026");

  assert.equal(resultado.estado, "fecha_invalida");
  assert.equal(llamadas, 0);
  global.fetch = originalFetch;
});

test("consultarCalendarioRitualPorFecha devuelve rituales aplicables", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({
      fecha_consulta: "2026-03-22",
      rituales: [
        {
          slug: "limpieza-lunar",
          nombre: "Limpieza lunar",
          contexto_breve: "Ritual breve de depuración.",
          nombre_regla: "equinoccio",
          prioridad: 1,
        },
      ],
    }),
  })) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("2026-03-22");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.fechaConsulta, "2026-03-22");
    assert.equal(resultado.rituales.length, 1);
    assert.equal(resultado.rituales[0]?.urlDetalle, "/rituales/limpieza-lunar");
  }
  global.fetch = originalFetch;
});

test("consultarCalendarioRitualPorFecha propaga error de API", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: false,
    status: 400,
    json: async () => ({ detalle: "Formato inválido" }),
  })) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("2026-03-22");

  assert.equal(resultado.estado, "error");
  global.fetch = originalFetch;
});

test("consultarCalendarioRitualPorFecha cubre estado vacío", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ fecha_consulta: "2026-03-22", rituales: [] }),
  })) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("2026-03-22");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.rituales.length, 0);
  }
  global.fetch = originalFetch;
});
