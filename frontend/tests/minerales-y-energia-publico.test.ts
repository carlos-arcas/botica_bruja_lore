import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { obtenerProductosPublicosPorSeccion } from "../infraestructura/api/herbal";

const leer = (ruta: string): string => readFileSync(join(process.cwd(), ruta), "utf8");

test("obtenerProductosPublicosPorSeccion mantiene visibles los 6 productos publicos de minerales", async () => {
  const fetchOriginal = global.fetch;
  const productos = Array.from({ length: 6 }, (_, idx) => ({
    sku: `MIN-${idx}`,
    slug: `mineral-publico-${idx}`,
    nombre: `Mineral ${idx}`,
    tipo_producto: "minerales-y-piedras",
    categoria_comercial: "minerales-y-energia",
    seccion_publica: "minerales-y-energia",
    descripcion_corta: "demo",
    precio_visible: "12,00 EUR",
    imagen_url: "",
    disponible: true,
    estado_disponibilidad: "disponible",
  }));

  try {
    global.fetch = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          seccion_slug: "minerales-y-energia",
          productos,
        }),
      }) as Response) as typeof fetch;

    const resultado = await obtenerProductosPublicosPorSeccion("minerales-y-energia");

    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
      assert.equal(resultado.productos.length, 6);
      assert.deepEqual(
        resultado.productos.map((producto) => producto.slug),
        productos.map((producto) => producto.slug),
      );
      assert.equal(resultado.diagnostico.totalProductos, 6);
    }
  } finally {
    global.fetch = fetchOriginal;
  }
});

test("minerales usa el contrato reusable de seccion publica para cargar el listado real", () => {
  const pagina = leer("app/minerales-y-energia/page.tsx");
  const contrato = leer("componentes/botica-natural/contratoSeccionPublica.ts");

  assert.equal(pagina.includes("MINERALES_Y_ENERGIA_PUBLICA"), true);
  assert.equal(
    pagina.includes("obtenerProductosPublicosPorSeccion(MINERALES_Y_ENERGIA_PUBLICA.slug)"),
    true,
  );
  assert.equal(pagina.includes("configuracionSeccion={MINERALES_Y_ENERGIA_PUBLICA}"), true);
  assert.equal(contrato.includes('nombre: "Minerales y Energia"'), true);
});

test("minerales expone detalle publico propio y rechaza slugs de otra seccion", () => {
  const detalle = leer("app/minerales-y-energia/[slug]/page.tsx");
  const noEncontrado = leer("app/minerales-y-energia/[slug]/not-found.tsx");
  const rutas = leer("componentes/catalogo/rutasProductoPublico.ts");

  assert.equal(
    detalle.includes("resultado.producto.seccion_publica !== MINERALES_Y_ENERGIA_PUBLICA.slug"),
    true,
  );
  assert.equal(detalle.includes("notFound();"), true);
  assert.equal(noEncontrado.includes("MINERALES_Y_ENERGIA_PUBLICA.nombre"), true);
  assert.equal(rutas.includes('"minerales-y-energia"'), true);
});

test("minerales mantiene hero comercial y copy propio para vacio honesto", () => {
  const pagina = leer("app/minerales-y-energia/page.tsx");
  const listado = leer("componentes/botica-natural/ListadoProductosBoticaNatural.tsx");
  const contrato = leer("componentes/botica-natural/contratoSeccionPublica.ts");

  assert.equal(pagina.includes('HeroSeccionPrincipal idSeccion="minerales-y-energia"'), true);
  assert.equal(pagina.includes("MINERALES_Y_ENERGIA_PUBLICA.descripcionCatalogo"), true);
  assert.equal(listado.includes("configuracionSeccion.tituloVacio"), true);
  assert.equal(listado.includes("configuracionSeccion.descripcionVacio"), true);
  assert.equal(contrato.includes('tituloVacio: "Minerales y Energia sin productos publicados"'), true);
  assert.equal(
    contrato.includes("No hay productos publicos de minerales y energia en esta seccion ahora mismo."),
    true,
  );
});

test("obtenerProductosPublicosPorSeccion conserva vacio honesto para minerales sin inventar fallback", async () => {
  const fetchOriginal = global.fetch;

  try {
    global.fetch = (async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          seccion_slug: "minerales-y-energia",
          productos: [],
        }),
      }) as Response) as typeof fetch;

    const resultado = await obtenerProductosPublicosPorSeccion("minerales-y-energia");

    assert.equal(resultado.estado, "ok");
    if (resultado.estado === "ok") {
      assert.deepEqual(resultado.productos, []);
      assert.equal(resultado.diagnostico.totalProductos, 0);
      assert.match(resultado.diagnostico.endpoint, /\/api\/v1\/herbal\/secciones\/minerales-y-energia\/productos\/$/);
    }
  } finally {
    global.fetch = fetchOriginal;
  }
});
