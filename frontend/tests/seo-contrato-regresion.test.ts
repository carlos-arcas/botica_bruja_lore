import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PAGINAS_LEGALES_COMERCIALES } from "../contenido/legal/paginasLegalesComerciales";
import { BLOQUES_ENLAZADO_CATALOGO } from "../contenido/catalogo/enlazadoInterno";
import { construirMetadataRaiz } from "../infraestructura/seo/metadataRaiz";
import { construirMetadataSeo } from "../infraestructura/seo/metadataSeo";

type ReglaRuta = {
  ruta: string;
  indexable: boolean;
  canonical: boolean;
  structured_data: boolean | string;
};

type ContratoSeo = {
  rutas: {
    indexables_estrategicas: ReglaRuta[];
    publicas_no_estrategicas: ReglaRuta[];
    transaccionales_noindex: ReglaRuta[];
  };
  search_console: { variable_entorno: string };
  enlazado_interno: {
    hubs_indexables_obligatorios: string[];
    prohibidos_como_eje_contextual: string[];
  };
};

function cargarContratoSeo(): ContratoSeo {
  const pathContrato = join(process.cwd(), "../docs/seo_contrato.json");
  return JSON.parse(readFileSync(pathContrato, "utf8")) as ContratoSeo;
}

function leerArchivoRuta(ruta: string): string {
  return readFileSync(join(process.cwd(), ruta), "utf8");
}

test("contrato SEO: metadata estratégica conserva index y canonical", () => {
  const contrato = cargarContratoSeo();

  for (const regla of contrato.rutas.indexables_estrategicas) {
    const metadata = construirMetadataSeo({
      title: `Prueba SEO ${regla.ruta}`,
      description: `Contrato SEO ${regla.ruta}`,
      rutaCanonical: regla.ruta,
      indexable: regla.indexable,
    });

    assert.equal(
      (metadata.robots as { index?: boolean }).index,
      true,
      `Regresión SEO en ${regla.ruta}: se esperaba robots index=true según docs/seo_contrato.json`,
    );

    if (regla.canonical) {
      assert.equal(
        metadata.alternates?.canonical,
        regla.ruta,
        `Regresión SEO en ${regla.ruta}: canonical ausente o distinto.`,
      );
    }
  }
});

test("contrato SEO: páginas no estratégicas/transaccionales siguen noindex sin canonical", () => {
  const contrato = cargarContratoSeo();
  const rutasNoIndex = [...contrato.rutas.publicas_no_estrategicas, ...contrato.rutas.transaccionales_noindex];

  for (const regla of rutasNoIndex) {
    const metadata = construirMetadataSeo({
      title: `Noindex ${regla.ruta}`,
      description: `Contrato noindex ${regla.ruta}`,
      indexable: regla.indexable,
    });

    assert.equal(
      (metadata.robots as { index?: boolean }).index,
      false,
      `Regresión SEO en ${regla.ruta}: se esperaba noindex.`,
    );
    assert.equal(metadata.alternates?.canonical, undefined, `Regresión SEO en ${regla.ruta}: no debe exponer canonical.`);
  }
});

test("contrato SEO: páginas del app router mantienen schema solo donde aplica", () => {
  const contrato = cargarContratoSeo();
  const mapas: Record<string, string> = {
    "/": "app/page.tsx",
    "/hierbas": "app/hierbas/page.tsx",
    "/rituales": "app/rituales/page.tsx",
    "/colecciones": "app/colecciones/page.tsx",
    "/la-botica": "app/la-botica/page.tsx",
    "/envios-y-preparacion": "app/envios-y-preparacion/page.tsx",
    "/privacidad": "app/privacidad/page.tsx",
    "/condiciones-encargo": "app/condiciones-encargo/page.tsx",
    "/encargo": "app/encargo/page.tsx",
    "/cesta": "app/cesta/page.tsx",
    "/pedido-demo": "app/pedido-demo/page.tsx",
    "/pedido-demo/{id_pedido}": "app/pedido-demo/[id_pedido]/page.tsx",
    "/cuenta-demo": "app/cuenta-demo/page.tsx",
  };

  for (const regla of contrato.rutas.indexables_estrategicas) {
    const archivo = mapas[regla.ruta];
    if (!archivo) continue;

    const source = leerArchivoRuta(archivo);
    if (regla.structured_data) {
      assert.match(source, /JsonLd/, `Regresión SEO en ${regla.ruta}: debería seguir emitiendo JsonLd base.`);
    }
  }

  for (const regla of [...contrato.rutas.publicas_no_estrategicas, ...contrato.rutas.transaccionales_noindex]) {
    const archivo = mapas[regla.ruta];
    assert.ok(archivo, `Falta mapear la ruta ${regla.ruta} en tests/seo-contrato-regresion.test.ts`);
    const source = leerArchivoRuta(archivo);
    assert.doesNotMatch(source, /JsonLd/, `Regresión SEO en ${regla.ruta}: no debe añadir JsonLd SEO por accidente.`);
  }
});

test("contrato SEO: Search Console y enlazado interno siguen alineados", () => {
  const contrato = cargarContratoSeo();
  const metadataRaiz = construirMetadataRaiz({
    [contrato.search_console.variable_entorno]: "token-contractual",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(
    metadataRaiz.verification?.google,
    "token-contractual",
    "Regresión SEO raíz: se perdió soporte de verificación Google Search Console.",
  );

  for (const hub of contrato.enlazado_interno.hubs_indexables_obligatorios) {
    const estaEnBloques = Object.values(BLOQUES_ENLAZADO_CATALOGO).some((bloque) =>
      bloque.enlaces.some((enlace) => enlace.href === hub),
    );
    assert.equal(estaEnBloques, true, `Regresión enlazado SEO: hub '${hub}' sin conexión contextual.`);
  }

  for (const prohibido of contrato.enlazado_interno.prohibidos_como_eje_contextual) {
    const aparece = Object.values(BLOQUES_ENLAZADO_CATALOGO).some((bloque) =>
      bloque.enlaces.some((enlace) => enlace.href === prohibido),
    );
    assert.equal(aparece, false, `Regresión enlazado SEO: '${prohibido}' reapareció como eje contextual.`);
  }

  const privacidad = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/privacidad");
  const condiciones = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/condiciones-encargo");
  assert.equal(privacidad?.seo.indexable, false);
  assert.equal(condiciones?.seo.indexable, false);
});
