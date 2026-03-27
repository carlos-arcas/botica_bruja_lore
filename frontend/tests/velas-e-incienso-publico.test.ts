import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { obtenerProductosPublicosPorSeccion } from "../infraestructura/api/herbal";

const leer = (ruta: string): string => readFileSync(join(process.cwd(), ruta), "utf8");

test("velas usa el contrato reusable de seccion publica para cargar el listado real con el rail de filtros", () => {
  const pagina = leer("app/velas-e-incienso/page.tsx");
  const contrato = leer("componentes/botica-natural/contratoSeccionPublica.ts");

  assert.equal(pagina.includes("VELAS_E_INCIENSO_PUBLICA"), true);
  assert.equal(pagina.includes("resolverFiltrosBoticaDesdeSearchParams"), true);
  assert.equal(
    pagina.includes("obtenerProductosPublicosPorSeccion(VELAS_E_INCIENSO_PUBLICA.slug, filtros)"),
    true,
  );
  assert.equal(pagina.includes("PanelFiltrosBoticaNatural"), true);
  assert.equal(pagina.includes("botica-natural__rail-filtros"), true);
  assert.equal(pagina.includes("configuracionSeccion={VELAS_E_INCIENSO_PUBLICA}"), true);
  assert.equal(contrato.includes('nombre: "Velas e Incienso"'), true);
});

test("velas expone detalle publico propio y rechaza slugs de otra seccion", () => {
  const detalle = leer("app/velas-e-incienso/[slug]/page.tsx");
  const noEncontrado = leer("app/velas-e-incienso/[slug]/not-found.tsx");
  const rutas = leer("componentes/catalogo/rutasProductoPublico.ts");

  assert.equal(
    detalle.includes("resultado.producto.seccion_publica !== VELAS_E_INCIENSO_PUBLICA.slug"),
    true,
  );
  assert.equal(detalle.includes("notFound();"), true);
  assert.equal(noEncontrado.includes("VELAS_E_INCIENSO_PUBLICA.nombre"), true);
  assert.equal(rutas.includes('"velas-e-incienso"'), true);
});

test("velas mantiene hero comercial y copy propio para vacío honesto", () => {
  const pagina = leer("app/velas-e-incienso/page.tsx");
  const listado = leer("componentes/botica-natural/ListadoProductosBoticaNatural.tsx");
  const contrato = leer("componentes/botica-natural/contratoSeccionPublica.ts");

  assert.equal(pagina.includes('HeroSeccionPrincipal idSeccion="velas-e-incienso"'), true);
  assert.equal(pagina.includes("VELAS_E_INCIENSO_PUBLICA.descripcionCatalogo"), true);
  assert.equal(listado.includes("configuracionSeccion.tituloVacio"), true);
  assert.equal(listado.includes("configuracionSeccion.descripcionVacio"), true);
  assert.equal(contrato.includes('tituloVacio: "Velas e Incienso sin productos publicados"'), true);
  assert.equal(
    contrato.includes("No hay productos publicos de velas e incienso en esta seccion ahora mismo."),
    true,
  );
});

test("obtenerProductosPublicosPorSeccion conserva vacío honesto para velas sin inventar fallback", async () => {
  const fetchOriginal = global.fetch;

  try {
    global.fetch = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          seccion_slug: "velas-e-incienso",
          productos: [],
        }),
      }) as Response) as typeof fetch;

    const resultado = await obtenerProductosPublicosPorSeccion("velas-e-incienso");

    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
      assert.deepEqual(resultado.productos, []);
      assert.equal(resultado.diagnostico.totalProductos, 0);
      assert.match(resultado.diagnostico.endpoint, /\/api\/v1\/herbal\/secciones\/velas-e-incienso\/productos\/$/);
    }
  } finally {
    global.fetch = fetchOriginal;
  }
});
