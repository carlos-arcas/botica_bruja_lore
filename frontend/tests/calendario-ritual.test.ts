import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  consultarCalendarioRitualPorFecha,
  esFechaCalendarioValida,
} from "../infraestructura/api/calendarioRitual";

test("esFechaCalendarioValida acepta formato ISO corto", () => {
  assert.equal(esFechaCalendarioValida("2026-03-22"), true);
  assert.equal(esFechaCalendarioValida("22-03-2026"), false);
});

test("consultarCalendarioRitualPorFecha devuelve rituales mapeados", async () => {
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
  })) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("2026-03-22");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.rituales.length, 1);
    assert.equal(resultado.rituales[0]?.urlDetalle, "/rituales/cierre-sereno");
  }
  global.fetch = originalFetch;
});

test("consultarCalendarioRitualPorFecha devuelve error para fecha inválida", async () => {
  const resultado = await consultarCalendarioRitualPorFecha("22-03-2026");

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.equal(resultado.codigo, 400);
  }
});

test("consultarCalendarioRitualPorFecha cubre estado vacío", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ fecha_consulta: "2026-04-10", rituales: [] }),
  })) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("2026-04-10");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.rituales.length, 0);
  }
  global.fetch = originalFetch;
});

test("consultarCalendarioRitualPorFecha propaga error API", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: false,
    status: 400,
    json: async () => ({ detalle: "Formato de fecha inválido." }),
  })) as unknown as typeof fetch;

  const resultado = await consultarCalendarioRitualPorFecha("2026-13-50");

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.match(resultado.mensaje, /formato de fecha/i);
  }
  global.fetch = originalFetch;
});
