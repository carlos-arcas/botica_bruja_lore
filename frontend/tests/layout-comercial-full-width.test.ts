import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function leer(ruta: string): string {
  return readFileSync(ruta, "utf8");
}

test("las páginas comerciales usan el shell ancho compartido", () => {
  const shell = leer("componentes/shell/ContenedorPaginaComercial.tsx");
  const catalogo = leer("app/colecciones/page.tsx");
  const fichaColeccion = leer("app/colecciones/[slug]/page.tsx");
  const botica = leer("app/botica-natural/page.tsx");
  const fichaBotica = leer("app/botica-natural/[slug]/page.tsx");

  assert.match(shell, /contenedor-home contenedor-comercial/);
  assert.match(catalogo, /ContenedorPaginaComercial/);
  assert.match(fichaColeccion, /ContenedorPaginaComercial/);
  assert.match(botica, /ContenedorPaginaComercial/);
  assert.match(fichaBotica, /ContenedorPaginaComercial/);
});

test("el contenedor comercial existe como variante separada del contenedor general", () => {
  const estilos = leer("app/globals.css");

  assert.match(estilos, /--ancho-contenedor-general: 980px/);
  assert.match(estilos, /--ancho-contenedor-comercial: 1440px/);
  assert.match(estilos, /\.contenedor-comercial \{/);
  assert.match(estilos, /width: min\(var\(--ancho-contenedor-comercial\), calc\(100vw - \(var\(--gutter-contenedor\) \* 2\)\)\);/);
});

test("el catálogo y los relacionados aprovechan más ancho en desktop sin estirar en exceso", () => {
  const estilosCatalogo = leer("componentes/catalogo/catalogo.module.css");
  const estilosGlobales = leer("app/globals.css");

  assert.match(estilosCatalogo, /grid-template-columns: repeat\(auto-fit, minmax\(240px, 1fr\)\);/);
  assert.match(estilosGlobales, /grid-template-columns: repeat\(auto-fit, minmax\(220px, 1fr\)\);/);
  assert.match(estilosGlobales, /grid-template-columns: minmax\(240px, 280px\) minmax\(0, 1fr\);/);
});

test("la ficha de producto usa layout ancho y conserva su estructura responsive", () => {
  const estilos = leer("app/globals.css");
  const fichaBotica = leer("componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx");

  assert.match(fichaBotica, /botica-natural__ficha/);
  assert.match(estilos, /grid-template-columns: minmax\(0, 1\.15fr\) minmax\(320px, 0\.85fr\);/);
  assert.match(estilos, /@media \(max-width: 900px\)/);
  assert.match(estilos, /grid-template-columns: 1fr;/);
});

test("las páginas no comerciales no reciben el shell comercial", () => {
  const legal = leer("app/privacidad/page.tsx");
  const editorial = leer("app/guias/page.tsx");

  assert.doesNotMatch(legal, /ContenedorPaginaComercial/);
  assert.doesNotMatch(editorial, /ContenedorPaginaComercial/);
  assert.match(editorial, /contenedor-home/);
});

test("la accesibilidad estructural base se conserva en catálogo y ficha", () => {
  const seccion = leer("componentes/catalogo/secciones/SeccionComercialProductos.tsx");
  const listado = leer("componentes/catalogo/secciones/ListadoProductosSeccionComercial.tsx");
  const ficha = leer("componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx");

  assert.match(seccion, /aria-label=\{configuracion\.tituloCatalogo\}/);
  assert.match(listado, /aria-label="Productos de la seccion"/);
  assert.match(ficha, /aria-label="Breadcrumb"/);
  assert.match(ficha, /<h1>/);
});
