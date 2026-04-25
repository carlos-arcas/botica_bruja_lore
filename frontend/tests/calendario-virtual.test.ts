import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  actualizarAgendaCalendario,
  construirRejillaCalendario,
  desplazarClaveMes,
  normalizarAgendaCalendario,
  resolverClaveMes,
} from "../contenido/calendario_ritual/calendarioVirtual";

test("resolverClaveMes y desplazarClaveMes navegan meses de forma estable", () => {
  assert.equal(resolverClaveMes("2026-03-28"), "2026-03");
  assert.equal(desplazarClaveMes("2026-03", -1), "2026-02");
  assert.equal(desplazarClaveMes("2026-12", 1), "2027-01");
});

test("actualizarAgendaCalendario elimina dias vacios y deduplica rituales", () => {
  const agenda = actualizarAgendaCalendario({}, "2026-03-28", "  nota breve  ", [
    "descanso-melisa-lavanda",
    "descanso-melisa-lavanda",
    "altar-lunar-cuarzo",
  ]);

  assert.deepEqual(agenda["2026-03-28"], {
    nota: "nota breve",
    rituales: ["descanso-melisa-lavanda", "altar-lunar-cuarzo"],
  });

  const sinContenido = actualizarAgendaCalendario(agenda, "2026-03-28", "   ", []);
  assert.equal("2026-03-28" in sinContenido, false);
});

test("normalizarAgendaCalendario ignora fechas invalidas y entradas sin contenido", () => {
  const agenda = normalizarAgendaCalendario({
    "2026-03-28": { nota: "  cierre ritual  ", rituales: ["uno", "uno", "dos"] },
    "2026-99-28": { nota: "ignorar", rituales: ["x"] },
    "2026-03-29": { nota: "   ", rituales: [] },
  });

  assert.deepEqual(agenda, {
    "2026-03-28": { nota: "cierre ritual", rituales: ["uno", "dos"] },
    "2026-99-28": { nota: "ignorar", rituales: ["x"] },
  });
});

test("construirRejillaCalendario marca hoy y contenido guardado", () => {
  const dias = construirRejillaCalendario(
    "2026-03",
    {
      "2026-03-05": { nota: "nota", rituales: ["uno"] },
      "2026-03-28": { nota: "", rituales: ["dos", "tres"] },
    },
    "2026-03-28",
  );

  assert.equal(dias.length, 42);

  const diaConNota = dias.find((dia) => dia.fechaISO === "2026-03-05");
  assert.deepEqual(
    diaConNota && {
      tieneNota: diaConNota.tieneNota,
      totalRituales: diaConNota.totalRituales,
      perteneceMesVisible: diaConNota.perteneceMesVisible,
    },
    { tieneNota: true, totalRituales: 1, perteneceMesVisible: true },
  );

  const diaHoy = dias.find((dia) => dia.fechaISO === "2026-03-28");
  assert.equal(diaHoy?.esHoy, true);
  assert.equal(diaHoy?.totalRituales, 2);
});
