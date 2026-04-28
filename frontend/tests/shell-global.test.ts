import * as assert from "node:assert/strict";
import { test } from "node:test";

import { readFileSync } from "node:fs";

import {
  ENLACES_FOOTER,
  ETIQUETA_ENLACE_ADMIN_CABECERA,
  NAVEGACION_PRINCIPAL,
  construirNavegacionPrincipal,
  construirTextoContadorCesta,
  debeMostrarContadorCesta,
  esRutaActiva,
} from "../contenido/shell/navegacionGlobal";

test("navegación principal expone accesos comerciales clave", () => {
  const rutas = NAVEGACION_PRINCIPAL.map((enlace) => enlace.href);

  assert.equal(rutas.includes("/"), true);
  assert.equal(rutas.includes("/colecciones"), true);
  assert.equal(rutas.includes("/la-botica"), true);
  assert.equal(rutas.includes("/guias"), true);
  assert.equal(rutas.includes("/tarot"), true);
  assert.equal(rutas.includes("/checkout"), true);
  assert.equal(rutas.includes("/encargo"), false);
  assert.equal(rutas.includes("/cuenta-demo"), false);
  assert.equal(NAVEGACION_PRINCIPAL.some((enlace) => enlace.etiqueta === "Mi selección"), true);
});

test("esRutaActiva resuelve coincidencia exacta y por prefijo", () => {
  const colecciones = NAVEGACION_PRINCIPAL[1]!;
  const inicio = NAVEGACION_PRINCIPAL[0]!;
  const laBotica = NAVEGACION_PRINCIPAL[2]!;

  assert.equal(esRutaActiva("/colecciones", colecciones), true);
  assert.equal(esRutaActiva("/colecciones/kit-luna", colecciones), true);
  assert.equal(esRutaActiva("/", inicio), true);
  assert.equal(esRutaActiva("/rituales", inicio), false);
  assert.equal(esRutaActiva("/la-botica", laBotica), true);
  assert.equal(esRutaActiva("/la-botica/historia", laBotica), false);
});

test("contador de selección muestra fallback correcto", () => {
  assert.equal(debeMostrarContadorCesta(0), false);
  assert.equal(debeMostrarContadorCesta(3), true);
  assert.equal(construirTextoContadorCesta(1), "1 unidad en mi selección");
  assert.equal(construirTextoContadorCesta(2), "2 unidades en mi selección");
});

test("footer mantiene enlaces de continuidad editorial-comercial", () => {
  assert.equal(ENLACES_FOOTER.length >= 8, true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/la-botica"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/tarot"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/calendario-ritual"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.etiqueta === "Consulta personalizada"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/condiciones-encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/envios-y-preparacion"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/devoluciones"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/privacidad"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/contacto"), true);
});

test("footer enlaza las paginas de confianza minimas", () => {
  const etiquetas = ENLACES_FOOTER.map((enlace) => enlace.etiqueta);

  assert.equal(etiquetas.includes("Condiciones de compra"), true);
  assert.equal(etiquetas.includes("Envios y preparacion"), true);
  assert.equal(etiquetas.includes("Devoluciones"), true);
  assert.equal(etiquetas.includes("Privacidad"), true);
  assert.equal(etiquetas.includes("Contacto"), true);
});

test("footer convierte el CTA comercial principal en checkout", () => {
  const footer = readFileSync("componentes/shell/FooterComercial.tsx", "utf-8");

  assert.match(footer, /href="\/checkout"/);
  assert.doesNotMatch(footer, /className=\{estilos\.ctaFooter\}>\s*Continuar hacia una solicitud de encargo/);
});

test("cabecera comercial apunta al backoffice interno /admin", () => {
  const cabecera = readFileSync("componentes/shell/CabeceraComercial.tsx", "utf-8");

  assert.match(cabecera, /href="\/admin"/);
  assert.equal(ETIQUETA_ENLACE_ADMIN_CABECERA.length > 0, true);
});


test("navbar comercial define estado activo visible y patrón editorial", () => {
  const componente = readFileSync("componentes/shell/NavegacionPrincipal.tsx", "utf-8");
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(componente, /aria-current=\{activa \? "page" : undefined\}/);
  assert.match(estilos, /\.enlaceActiva/);
  assert.match(estilos, /\.navegacion ul/);
  assert.match(estilos, /repeating-linear-gradient/);
  assert.match(estilos, /\.enlaceActiva::after/);
});

test("navbar comercial mantiene estados hover y focus visibles", () => {
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(estilos, /\.enlace:hover/);
  assert.match(estilos, /\.enlace:focus-visible/);
  assert.match(estilos, /outline: 2px solid/);
});

test("navbar comercial conserva estructura responsive para móvil", () => {
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(estilos, /@media \(max-width: 780px\)/);
  assert.match(estilos, /\.navegacion ul \{[\s\S]*width: 100%/);
  assert.match(estilos, /\.enlace \{[\s\S]*font-size: 0\.9rem/);
});


test("enlace Logs solo aparece cuando la flag está activa", () => {
  const sinLogs = construirNavegacionPrincipal(false).map((enlace) => enlace.href);
  const conLogs = construirNavegacionPrincipal(true);
  const rutasConLogs = conLogs.map((enlace) => enlace.href);
  const enlaceLogs = conLogs.find((enlace) => enlace.href === "/debug/logs");

  assert.equal(sinLogs.includes("/debug/logs"), false);
  assert.equal(rutasConLogs.includes("/debug/logs"), true);
  assert.equal(enlaceLogs?.etiqueta, "Logs");
  assert.equal(enlaceLogs?.coincidencia, "exacta");
});
