import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { obtenerProductosPublicosPorSeccion } from "../infraestructura/api/herbal";

const leer = (ruta: string): string => readFileSync(join(process.cwd(), ruta), "utf8");

test("obtenerProductosPublicosPorSeccion mantiene visibles los 3 productos publicos de herramientas", async () => {
  const fetchOriginal = global.fetch;
  const productos = [
    {
      sku: "HER-000",
      slug: "pendulo-laton-dorado",
      nombre: "Pendulo de laton dorado",
      tipo_producto: "herramientas-rituales",
      categoria_comercial: "radiestesia",
      seccion_publica: "herramientas-esotericas",
      descripcion_corta: "demo",
      precio_visible: "14,90 EUR",
      imagen_url: "",
      disponible: true,
      estado_disponibilidad: "disponible",
    },
    {
      sku: "HER-001",
      slug: "cuenco-selenita-pulido",
      nombre: "Cuenco de selenita pulido",
      tipo_producto: "herramientas-rituales",
      categoria_comercial: "altar-y-soportes",
      seccion_publica: "herramientas-esotericas",
      descripcion_corta: "demo",
      precio_visible: "18,50 EUR",
      imagen_url: "",
      disponible: true,
      estado_disponibilidad: "disponible",
    },
    {
      sku: "HER-002",
      slug: "caldero-hierro-mini",
      nombre: "Caldero de hierro mini",
      tipo_producto: "herramientas-rituales",
      categoria_comercial: "altares-y-fuego",
      seccion_publica: "herramientas-esotericas",
      descripcion_corta: "demo",
      precio_visible: "16,80 EUR",
      imagen_url: "",
      disponible: true,
      estado_disponibilidad: "disponible",
    },
  ];

  try {
    global.fetch = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          seccion_slug: "herramientas-esotericas",
          productos,
        }),
      }) as Response) as typeof fetch;

    const resultado = await obtenerProductosPublicosPorSeccion("herramientas-esotericas");

    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
      assert.equal(resultado.productos.length, 3);
      assert.deepEqual(
        resultado.productos.map((producto) => producto.slug),
        productos.map((producto) => producto.slug),
      );
      assert.equal(resultado.diagnostico.totalProductos, 3);
    }
  } finally {
    global.fetch = fetchOriginal;
  }
});

test("herramientas usa el contrato reusable de seccion publica para cargar el listado real con el rail de filtros", () => {
  const pagina = leer("app/herramientas-esotericas/page.tsx");
  const contrato = leer("componentes/botica-natural/contratoSeccionPublica.ts");

  assert.equal(pagina.includes("HERRAMIENTAS_ESOTERICAS_PUBLICA"), true);
  assert.equal(pagina.includes("resolverFiltrosBoticaDesdeSearchParams"), true);
  assert.equal(
    pagina.includes("obtenerProductosPublicosPorSeccion(HERRAMIENTAS_ESOTERICAS_PUBLICA.slug, filtros)"),
    true,
  );
  assert.equal(pagina.includes("PanelFiltrosBoticaNatural"), true);
  assert.equal(pagina.includes("botica-natural__rail-filtros"), true);
  assert.equal(pagina.includes("configuracionSeccion={HERRAMIENTAS_ESOTERICAS_PUBLICA}"), true);
  assert.equal(contrato.includes('nombre: "Herramientas Esotericas"'), true);
});

test("herramientas expone detalle publico propio y rechaza slugs de otra seccion", () => {
  const detalle = leer("app/herramientas-esotericas/[slug]/page.tsx");
  const noEncontrado = leer("app/herramientas-esotericas/[slug]/not-found.tsx");
  const rutas = leer("componentes/catalogo/rutasProductoPublico.ts");

  assert.equal(
    detalle.includes("resultado.producto.seccion_publica !== HERRAMIENTAS_ESOTERICAS_PUBLICA.slug"),
    true,
  );
  assert.equal(detalle.includes("notFound();"), true);
  assert.equal(noEncontrado.includes("HERRAMIENTAS_ESOTERICAS_PUBLICA.nombre"), true);
  assert.equal(rutas.includes('"herramientas-esotericas"'), true);
});

test("herramientas mantiene hero comercial y copy propio para vacio honesto", () => {
  const pagina = leer("app/herramientas-esotericas/page.tsx");
  const listado = leer("componentes/botica-natural/ListadoProductosBoticaNatural.tsx");
  const contrato = leer("componentes/botica-natural/contratoSeccionPublica.ts");

  assert.equal(pagina.includes('HeroSeccionPrincipal idSeccion="herramientas-esotericas"'), true);
  assert.equal(pagina.includes("HERRAMIENTAS_ESOTERICAS_PUBLICA.descripcionCatalogo"), true);
  assert.equal(listado.includes("configuracionSeccion.tituloVacio"), true);
  assert.equal(listado.includes("configuracionSeccion.descripcionVacio"), true);
  assert.equal(
    contrato.includes('tituloVacio: "Herramientas Esotericas sin productos publicados"'),
    true,
  );
  assert.equal(
    contrato.includes(
      "No hay productos publicos de herramientas esotericas en esta seccion ahora mismo.",
    ),
    true,
  );
});

test("obtenerProductosPublicosPorSeccion conserva vacio honesto para herramientas sin inventar fallback", async () => {
  const fetchOriginal = global.fetch;

  try {
    global.fetch = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          seccion_slug: "herramientas-esotericas",
          productos: [],
        }),
      }) as Response) as typeof fetch;

    const resultado = await obtenerProductosPublicosPorSeccion("herramientas-esotericas");

    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
      assert.deepEqual(resultado.productos, []);
      assert.equal(resultado.diagnostico.totalProductos, 0);
      assert.match(
        resultado.diagnostico.endpoint,
        /\/api\/v1\/herbal\/secciones\/herramientas-esotericas\/productos\/$/,
      );
    }
  } finally {
    global.fetch = fetchOriginal;
  }
});
