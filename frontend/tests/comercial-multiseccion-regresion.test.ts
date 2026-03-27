import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { obtenerSeccionesPrincipalesOrdenadas } from "../contenido/home/seccionesPrincipales";
import { actualizarItemsSecciones, resolverSeccionesAfectadasImportacion } from "../componentes/admin/sincronizacionProductosAdmin";
import { obtenerProductosPublicosPorSeccion } from "../infraestructura/api/herbal";

const leer = (ruta: string): string => readFileSync(join(process.cwd(), ruta), "utf8");

const SECCIONES_COMERCIALES = [
  {
    slug: "botica-natural",
    ruta: "/botica-natural",
    archivo: "app/botica-natural/page.tsx",
    contrato: "BOTICA_NATURAL_PUBLICA",
    llamadaCatalogo: "obtenerProductosPublicosPorSeccion(BOTICA_NATURAL_PUBLICA.slug, filtros)",
    marcadorEntrada: "<PanelFiltrosBoticaNatural",
  },
  {
    slug: "velas-e-incienso",
    ruta: "/velas-e-incienso",
    archivo: "app/velas-e-incienso/page.tsx",
    contrato: "VELAS_E_INCIENSO_PUBLICA",
    llamadaCatalogo: "obtenerProductosPublicosPorSeccion(VELAS_E_INCIENSO_PUBLICA.slug)",
    marcadorEntrada: 'HeroSeccionPrincipal idSeccion="velas-e-incienso"',
  },
  {
    slug: "minerales-y-energia",
    ruta: "/minerales-y-energia",
    archivo: "app/minerales-y-energia/page.tsx",
    contrato: "MINERALES_Y_ENERGIA_PUBLICA",
    llamadaCatalogo: "obtenerProductosPublicosPorSeccion(MINERALES_Y_ENERGIA_PUBLICA.slug)",
    marcadorEntrada: 'HeroSeccionPrincipal idSeccion="minerales-y-energia"',
  },
  {
    slug: "herramientas-esotericas",
    ruta: "/herramientas-esotericas",
    archivo: "app/herramientas-esotericas/page.tsx",
    contrato: "HERRAMIENTAS_ESOTERICAS_PUBLICA",
    llamadaCatalogo: "obtenerProductosPublicosPorSeccion(HERRAMIENTAS_ESOTERICAS_PUBLICA.slug)",
    marcadorEntrada: 'HeroSeccionPrincipal idSeccion="herramientas-esotericas"',
  },
] as const;

test("la home comercial mantiene las cuatro secciones canonicas en el orden publico activo", () => {
  const secciones = obtenerSeccionesPrincipalesOrdenadas()
    .filter((seccion) =>
      SECCIONES_COMERCIALES.some((seccionComercial) => seccionComercial.slug === seccion.id),
    )
    .map((seccion) => ({ id: seccion.id, ruta: seccion.ruta }));

  assert.deepEqual(
    secciones,
    SECCIONES_COMERCIALES.map((seccion) => ({ id: seccion.slug, ruta: seccion.ruta })),
  );
});

test("cada seccion comercial reutiliza el mismo slug desde la home hasta su listado publico", () => {
  const contratoSeccionPublica = leer("componentes/botica-natural/contratoSeccionPublica.ts");
  const rutasPublicas = leer("componentes/catalogo/rutasProductoPublico.ts");

  for (const seccion of SECCIONES_COMERCIALES) {
    const pagina = leer(seccion.archivo);

    assert.equal(pagina.includes(seccion.contrato), true);
    assert.equal(pagina.includes(seccion.llamadaCatalogo), true);
    assert.equal(pagina.includes(seccion.marcadorEntrada), true);
    assert.equal(pagina.includes(`configuracionSeccion={${seccion.contrato}}`), true);
    assert.equal(pagina.includes("resolverMensajeErrorCatalogoSeccionPublica("), true);
    assert.equal(pagina.includes(seccion.contrato), true);
    assert.equal(contratoSeccionPublica.includes(`export const ${seccion.contrato}`), true);
    assert.equal(rutasPublicas.includes(`"${seccion.slug}"`), true);
  }
});

test("helper publico e importacion/backoffice comparten el mismo mapa canonico multiseccion", async () => {
  const fetchOriginal = global.fetch;
  const llamadas: string[] = [];

  try {
    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      llamadas.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          productos: [],
        }),
      } as Response;
    }) as typeof fetch;

    for (const seccion of SECCIONES_COMERCIALES) {
      const resultado = await obtenerProductosPublicosPorSeccion(seccion.slug);

      assert.equal(resultado.estado, "ok");
      if (resultado.estado === "ok") {
        assert.deepEqual(resultado.productos, []);
        assert.equal(resultado.diagnostico.totalProductos, 0);
        assert.match(
          resultado.diagnostico.endpoint,
          new RegExp(`/api/v1/herbal/secciones/${seccion.slug}/productos/$`),
        );
      }
    }
  } finally {
    global.fetch = fetchOriginal;
  }

  const detalle = {
    lote: { id: 901 },
    resumen: { total: 5, validas: 0, warnings: 0, invalidas: 0, descartadas: 0, confirmadas: 5, con_imagen: 0, sin_imagen: 5, seleccionadas: 5 },
    filas: [
      { id: 1, numero: 1, datos: { seccion_publica: "botica-natural" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-1", titulo: "Botica", tipo: "producto", resumen_datos: "ok" },
      { id: 2, numero: 2, datos: { seccion_publica: "velas-e-incienso" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-2", titulo: "Velas", tipo: "producto", resumen_datos: "ok" },
      { id: 3, numero: 3, datos: { seccion_publica: "minerales-y-energia" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-3", titulo: "Minerales", tipo: "producto", resumen_datos: "ok" },
      { id: 4, numero: 4, datos: { seccion_publica: "herramientas-esotericas" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-4", titulo: "Herramientas", tipo: "producto", resumen_datos: "ok" },
      { id: 5, numero: 5, datos: { seccion_publica: "amuletos-y-talismenes" }, errores: [], warnings: [], estado: "confirmada", seleccionado: true, imagen: "", estado_imagen: "ausente" as const, resultado_confirmacion: "ok", identificador: "SKU-5", titulo: "Amuleto", tipo: "producto", resumen_datos: "ok" },
    ],
  };

  const seccionesSincronizadas = resolverSeccionesAfectadasImportacion(detalle, "botica-natural");

  assert.deepEqual(
    seccionesSincronizadas,
    SECCIONES_COMERCIALES.map((seccion) => seccion.slug),
  );

  const storeSincronizado = actualizarItemsSecciones([], {
    "botica-natural": [{ id: "bn-1", seccion_publica: "botica-natural", publicado: true }],
    "velas-e-incienso": [{ id: "ve-1", seccion_publica: "velas-e-incienso", publicado: true }],
    "minerales-y-energia": [{ id: "mi-1", seccion_publica: "minerales-y-energia", publicado: true }],
    "herramientas-esotericas": [{ id: "he-1", seccion_publica: "herramientas-esotericas", publicado: true }],
    "amuletos-y-talismenes": [{ id: "am-1", seccion_publica: "amuletos-y-talismenes", publicado: true }],
  });

  assert.deepEqual(
    storeSincronizado.map((item) => item.seccion_publica),
    SECCIONES_COMERCIALES.map((seccion) => seccion.slug),
  );
  assert.equal(llamadas.length, SECCIONES_COMERCIALES.length);
});
