import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  normalizarEstadoDisponibilidadPublica,
} from "../infraestructura/api/herbal";
import { obtenerFichaRitualConectada } from "../infraestructura/api/rituales";

test("normalizarEstadoDisponibilidadPublica acota valores fuera de contrato", () => {
  assert.equal(normalizarEstadoDisponibilidadPublica("disponible"), "disponible");
  assert.equal(normalizarEstadoDisponibilidadPublica("bajo_stock"), "bajo_stock");
  assert.equal(normalizarEstadoDisponibilidadPublica("no_disponible"), "no_disponible");
  assert.equal(normalizarEstadoDisponibilidadPublica("agotado"), "no_disponible");
  assert.equal(normalizarEstadoDisponibilidadPublica(undefined), "no_disponible");
});

test("obtenerFichaRitualConectada normaliza disponibilidad pública en productos", async () => {
  const originalFetch = global.fetch;
  const respuestas = [
    {
      ok: true,
      status: 200,
      json: async () => ({
        ritual: {
          slug: "limpieza-lunar",
          nombre: "Limpieza lunar",
          contexto_breve: "Contexto ritual",
          intenciones: [],
          ids_plantas_relacionadas: [],
          ids_productos_relacionados: ["rosa-blanca-granel"],
        },
      }),
    },
    {
      ok: true,
      status: 200,
      json: async () => ({
        ritual_slug: "limpieza-lunar",
        plantas: [],
      }),
    },
    {
      ok: true,
      status: 200,
      json: async () => ({
        ritual_slug: "limpieza-lunar",
        productos: [
          {
            sku: "SKU-1",
            slug: "rosa-blanca-granel",
            nombre: "Rosa blanca",
            tipo_producto: "hierba_granel",
            categoria_comercial: "hierbas",
            seccion_publica: "botica-natural",
            descripcion_corta: "Descripción",
            precio_visible: "12,00 €",
            imagen_url: "/imagenes/rosa.webp",
            disponible: true,
            estado_disponibilidad: "inventario_desconocido",
          },
        ],
      }),
    },
  ];

  let indiceRespuesta = 0;
  global.fetch = (async () => {
    const respuesta = respuestas[indiceRespuesta];
    indiceRespuesta += 1;
    return respuesta as Response;
  }) as typeof fetch;

  const resultado = await obtenerFichaRitualConectada("limpieza-lunar");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.ficha.productos.length, 1);
    assert.equal(resultado.ficha.productos[0]?.disponible, true);
    assert.equal(resultado.ficha.productos[0]?.estado_disponibilidad, "no_disponible");
  }

  global.fetch = originalFetch;
});
