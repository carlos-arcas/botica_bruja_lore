import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  obtenerSeccionesPrincipalesOrdenadas,
  SECCIONES_PRINCIPALES,
} from "../contenido/home/seccionesPrincipales";

const RUTAS_ESPERADAS = [
  "/botica-natural",
  "/velas-e-incienso",
  "/minerales-y-energia",
  "/herramientas-esotericas",
  "/tarot",
  "/rituales",
  "/agenda-mistica",
];

test("la home define exactamente 7 cards en orden obligatorio", () => {
  const secciones = obtenerSeccionesPrincipalesOrdenadas();

  assert.equal(secciones.length, 7);
  assert.deepEqual(
    secciones.map((seccion) => seccion.id),
    [
      "botica-natural",
      "velas-e-incienso",
      "minerales-y-energia",
      "herramientas-esotericas",
      "tarot",
      "rituales",
      "agenda-mistica",
    ],
  );
});

test("cada card navega a su ruta principal correcta", () => {
  const secciones = obtenerSeccionesPrincipalesOrdenadas();

  assert.deepEqual(
    secciones.map((seccion) => seccion.ruta),
    RUTAS_ESPERADAS,
  );
});

test("el contrato card -> hero está centralizado y consistente", () => {
  assert.equal(SECCIONES_PRINCIPALES.length, 7);

  for (const seccion of SECCIONES_PRINCIPALES) {
    assert.equal(seccion.imagenCard.endsWith("_card.webp"), true);
    assert.equal(seccion.imagenHero.endsWith("_hero.webp"), true);
    assert.equal(seccion.imagenCard.includes(seccion.id.replace(/-/g, "_")), true);
    assert.equal(seccion.imagenHero.includes(seccion.id.replace(/-/g, "_")), true);
  }
});

test("la tarjeta principal usa media uniforme, sin recorte y con microinteracciones accesibles", () => {
  const tarjeta = readFileSync(
    join(process.cwd(), "componentes/home/TarjetaSeccionPrincipal.tsx"),
    "utf8",
  );
  const configuracionCard = readFileSync(
    join(process.cwd(), "componentes/home/configuracionImagenCardHome.ts"),
    "utf8",
  );
  const estilos = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
  const bloqueTarjeta = estilos.split(".tarjeta-seccion-principal {")[1]?.split("@media (min-width: 768px)")[0] ?? "";

  assert.equal(tarjeta.includes('className="tarjeta-seccion-principal__item"'), true);
  assert.equal(tarjeta.includes('className="tarjeta-seccion-principal"'), true);
  assert.equal(tarjeta.includes('className="tarjeta-seccion-principal__media"'), true);
  assert.equal(tarjeta.includes('className="tarjeta-seccion-principal__titulo"'), true);
  assert.equal(tarjeta.includes("aria-label={titulo}"), true);
  assert.equal(tarjeta.includes("fill"), false);
  assert.equal(tarjeta.includes("width={CONFIGURACION_IMAGEN_CARD_HOME.width}"), true);
  assert.equal(tarjeta.includes("height={CONFIGURACION_IMAGEN_CARD_HOME.height}"), true);
  assert.equal(tarjeta.includes("sizes={CONFIGURACION_IMAGEN_CARD_HOME.sizes}"), true);
  assert.equal(estilos.includes(".tarjeta-seccion-principal__media"), true);
  assert.equal(estilos.includes("--ancho-base-card-home"), true);
  assert.equal(bloqueTarjeta.includes("aspect-ratio"), false);
  assert.equal(bloqueTarjeta.includes("background: rgba("), false);
  const bloqueImagen = estilos.split(".tarjeta-seccion-principal__imagen")[1] ?? "";
  assert.equal(bloqueImagen.includes("width: 100%;"), true);
  assert.equal(bloqueImagen.includes("height: auto;"), true);
  assert.equal(bloqueImagen.includes("object-fit: cover;"), false);
  assert.equal(configuracionCard.includes("CONFIGURACION_IMAGEN_CARD_HOME"), true);
  const bloqueHover = estilos.split(".tarjeta-seccion-principal:hover {")[1]?.split(".tarjeta-seccion-principal:focus-visible {")[0] ?? "";
  const bloqueFocusVisible = estilos.split(".tarjeta-seccion-principal:focus-visible {")[1]?.split(".tarjeta-seccion-principal__media {")[0] ?? "";
  assert.match(estilos, /\.tarjeta-seccion-principal:hover\s*\{/);
  assert.match(estilos, /\.tarjeta-seccion-principal:focus-visible\s*\{/);
  assert.equal(bloqueHover.includes("outline:"), false);
  assert.equal(bloqueHover.includes("outline-offset:"), false);
  assert.equal(bloqueFocusVisible.includes("outline: 2px solid"), true);
  assert.equal(bloqueFocusVisible.includes("outline-offset: 3px;"), true);
  assert.match(estilos, /\.tarjeta-seccion-principal:hover \.tarjeta-seccion-principal__imagen,/);
  assert.match(estilos, /\.tarjeta-seccion-principal:hover \.tarjeta-seccion-principal__titulo,/);
  assert.match(estilos, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(estilos, /grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, var\(--ancho-base-card-home\)\), var\(--ancho-base-card-home\)\)\);/);
});

test("el hero de sección renderiza imagen en flujo sin fill ni cover", () => {
  const heroSeccion = readFileSync(
    join(process.cwd(), "componentes/secciones/HeroSeccionPrincipal.tsx"),
    "utf8",
  );
  const configuracionHeroSeccion = readFileSync(
    join(process.cwd(), "componentes/secciones/configuracionHeroSeccion.ts"),
    "utf8",
  );
  const estilos = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
  const bloqueHero = estilos.split(".hero-portada__imagen {")[1]?.split(".hero-portada--con-fondo .hero-portada__contenido")[0] ?? "";

  assert.equal(heroSeccion.includes("fill"), false);
  assert.equal(heroSeccion.includes("objectFit"), false);
  assert.equal(heroSeccion.includes("width={CONFIGURACION_HERO_SECCION.width}"), true);
  assert.equal(heroSeccion.includes("height={CONFIGURACION_HERO_SECCION.height}"), true);
  assert.equal(estilos.includes("--ancho-base-hero-seccion"), true);
  assert.equal(estilos.includes("max-width: var(--ancho-base-hero-seccion);"), true);
  assert.equal(estilos.includes(".hero-portada__imagen"), true);
  assert.equal(bloqueHero.includes("height: auto;"), true);
  assert.equal(bloqueHero.includes("object-fit: cover;"), false);
  assert.equal(bloqueHero.includes("aspect-ratio"), false);
  assert.equal(configuracionHeroSeccion.includes("CONFIGURACION_HERO_SECCION"), true);
});

test("la home raíz solo compone hero principal + rejilla de secciones", () => {
  const pagina = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");

  assert.equal(pagina.includes("<HeroPortada />"), true);
  assert.equal(pagina.includes("<RejillaSeccionesPrincipales />"), true);
  assert.equal(pagina.includes("<ContextoEditorialHome />"), false);
  assert.equal(pagina.includes("<FaqHome />"), false);
  assert.equal(pagina.includes("<CtaFinalHome />"), false);
});

test("las páginas de sección mantienen su entrada principal sin romper la jerarquía actual", () => {
  const paginasConHero: Array<{ ruta: string; id: string }> = [
    { ruta: "app/velas-e-incienso/page.tsx", id: "velas-e-incienso" },
    { ruta: "app/minerales-y-energia/page.tsx", id: "minerales-y-energia" },
    { ruta: "app/herramientas-esotericas/page.tsx", id: "herramientas-esotericas" },
    { ruta: "app/tarot/page.tsx", id: "tarot" },
    { ruta: "app/rituales/page.tsx", id: "rituales" },
    { ruta: "app/agenda-mistica/page.tsx", id: "agenda-mistica" },
  ];

  for (const paginaSeccion of paginasConHero) {
    const pagina = readFileSync(join(process.cwd(), paginaSeccion.ruta), "utf8");
    assert.equal(pagina.includes(`idSeccion="${paginaSeccion.id}"`), true);
  }

  const paginaBoticaNatural = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");
  assert.equal(paginaBoticaNatural.includes("<ListadoProductosBoticaNatural"), true);
  assert.equal(paginaBoticaNatural.includes("<PanelFiltrosBoticaNatural"), true);
  assert.equal(paginaBoticaNatural.includes("BOTICA_NATURAL_PUBLICA.nombre"), true);
});
