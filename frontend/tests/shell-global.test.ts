import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  ENLACES_FOOTER,
  ETIQUETA_ENLACE_ADMIN_CABECERA,
  NAVEGACION_PRINCIPAL,
  construirNavegacionPrincipal,
  construirTextoContadorCesta,
  debeMostrarContadorCesta,
  esRutaActiva,
} from "../contenido/shell/navegacionGlobal";

test("navegacion principal expone arquitectura comercial con iconos de apoyo", () => {
  const rutas = NAVEGACION_PRINCIPAL.map((enlace) => enlace.href);

  assert.equal(rutas.includes("/"), true);
  assert.equal(rutas.includes("/botica-natural"), true);
  assert.equal(rutas.includes("/guias"), true);
  assert.equal(rutas.includes("/tarot"), true);
  assert.equal(rutas.includes("/checkout"), true);
  assert.equal(rutas.includes("/encargo"), false);
  assert.equal(rutas.includes("/cuenta-demo"), false);
  assert.equal(NAVEGACION_PRINCIPAL.some((enlace) => enlace.etiqueta === "Mi seleccion"), true);
  assert.equal(NAVEGACION_PRINCIPAL.every((enlace) => enlace.icono?.startsWith("/iconos/navegacion/")), true);
});

test("tienda y guias exponen submenu con destinos reales e iconos", () => {
  const tienda = NAVEGACION_PRINCIPAL.find((enlace) => enlace.etiqueta === "Tienda");
  const guias = NAVEGACION_PRINCIPAL.find((enlace) => enlace.etiqueta === "Guias");

  assert.deepEqual(tienda?.submenu?.map((item) => item.href), [
    "/botica-natural",
    "/velas-e-incienso",
    "/minerales-y-energia",
    "/herramientas-esotericas",
  ]);
  assert.equal(guias?.submenu?.some((item) => item.href.startsWith("/guias")), true);
  assert.equal(guias?.submenu?.some((item) => item.href === "/hierbas"), true);
  assert.equal(guias?.submenu?.some((item) => item.href === "/rituales"), true);
  assert.equal(tienda?.submenu?.every((item) => item.icono?.startsWith("/iconos/navegacion/")), true);
  assert.equal(guias?.submenu?.every((item) => item.icono?.startsWith("/iconos/navegacion/")), true);
});

test("esRutaActiva resuelve coincidencia exacta, prefijo y submenus", () => {
  const inicio = NAVEGACION_PRINCIPAL[0]!;
  const tienda = NAVEGACION_PRINCIPAL[1]!;
  const guias = NAVEGACION_PRINCIPAL[2]!;
  const tarot = NAVEGACION_PRINCIPAL[3]!;

  assert.equal(esRutaActiva("/", inicio), true);
  assert.equal(esRutaActiva("/velas-e-incienso", tienda), true);
  assert.equal(esRutaActiva("/herramientas-esotericas/cuenco-laton-ritual", tienda), true);
  assert.equal(esRutaActiva("/hierbas/romero", guias), true);
  assert.equal(esRutaActiva("/rituales", guias), true);
  assert.equal(esRutaActiva("/tarot", tarot), true);
  assert.equal(esRutaActiva("/calendario-ritual", tarot), false);
});

test("contador de carrito usa wording visible coherente", () => {
  assert.equal(debeMostrarContadorCesta(0), false);
  assert.equal(debeMostrarContadorCesta(3), true);
  assert.equal(construirTextoContadorCesta(1), "1 unidad en el carrito");
  assert.equal(construirTextoContadorCesta(2), "2 unidades en el carrito");
});

test("footer mantiene continuidad editorial-comercial y confianza", () => {
  assert.equal(ENLACES_FOOTER.length >= 9, true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/botica-natural"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/velas-e-incienso"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/minerales-y-energia"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/herramientas-esotericas"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/guias"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/calendario-ritual"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.etiqueta === "Consulta personalizada"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/condiciones-encargo"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/envios-y-preparacion"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/devoluciones"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/privacidad"), true);
  assert.equal(ENLACES_FOOTER.some((enlace) => enlace.href === "/contacto"), true);
});

test("footer convierte el CTA comercial principal en checkout", () => {
  const footer = readFileSync("componentes/shell/FooterComercial.tsx", "utf-8");

  assert.match(footer, /href="\/checkout"/);
  assert.doesNotMatch(footer, /className=\{estilos\.ctaFooter\}>\s*Continuar hacia una solicitud de encargo/);
});

test("cabecera comercial organiza marca superior, nav y accesos externos", () => {
  const cabecera = readFileSync("componentes/shell/CabeceraComercial.tsx", "utf-8");

  assert.match(cabecera, /franjaMarca/);
  assert.match(cabecera, /barraCabecera/);
  assert.match(cabecera, /NavegacionPrincipal/);
  assert.match(cabecera, /AccesosCabecera/);
  assert.match(cabecera, /La Botica de la Bruja Lore/);
});

test("accesos externos resuelven carrito, login dinamico y admin", () => {
  const accesos = readFileSync("componentes/shell/AccesosCabecera.tsx", "utf-8");

  assert.match(accesos, /href="\/cesta"/);
  assert.match(accesos, /Carrito/);
  assert.match(accesos, /Login/);
  assert.match(accesos, /Mi cuenta/);
  assert.match(accesos, /NOMBRE_COOKIE_CUENTA_CLIENTE/);
  assert.match(accesos, /obtenerSesionCuentaCliente/);
  assert.match(accesos, /href="\/admin"/);
  assert.equal(ETIQUETA_ENLACE_ADMIN_CABECERA.length > 0, true);
});

test("navbar comercial define estado activo, patron con submenu e iconos", () => {
  const componente = readFileSync("componentes/shell/NavegacionPrincipal.tsx", "utf-8");
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(componente, /aria-current=\{activa \? "page" : undefined\}/);
  assert.match(componente, /IconoNavegacion/);
  assert.match(componente, /aria-hidden="true"/);
  assert.match(componente, /itemConSubmenu/);
  assert.match(estilos, /\.submenu/);
  assert.match(estilos, /\.enlaceActiva/);
  assert.match(estilos, /\.iconoEnlace/);
  assert.match(estilos, /\.iconoSubmenu/);
  assert.match(estilos, /\.navegacion ul/);
  assert.match(estilos, /repeating-linear-gradient/);
  assert.match(estilos, /\.enlaceActiva::after/);
});

test("navbar comercial mantiene estados hover, focus y responsive", () => {
  const estilos = readFileSync("componentes/shell/shellComercial.module.css", "utf-8");

  assert.match(estilos, /\.enlace:hover/);
  assert.match(estilos, /\.enlace:focus-visible/);
  assert.match(estilos, /outline: 2px solid/);
  assert.match(estilos, /@media \(max-width: 780px\)/);
  assert.match(estilos, /\.barraCabecera \{/);
  assert.match(estilos, /\.accionesExternas \{/);
});

test("carrito visible continua al checkout real y deja fuera encargo como CTA principal", () => {
  const vistaCesta = readFileSync("componentes/catalogo/cesta/VistaCestaRitual.tsx", "utf-8");
  const indicador = readFileSync("componentes/catalogo/cesta/IndicadorCestaRitual.tsx", "utf-8");

  assert.match(vistaCesta, /Finalizar compra/);
  assert.match(vistaCesta, /\/checkout\?cesta=/);
  assert.match(vistaCesta, /Pedir orientacion artesanal/);
  assert.match(indicador, /Carrito/);
  assert.match(indicador, /unidades en el carrito/);
});

test("enlace Logs solo aparece cuando la flag esta activa", () => {
  const sinLogs = construirNavegacionPrincipal(false).map((enlace) => enlace.href);
  const conLogs = construirNavegacionPrincipal(true);
  const rutasConLogs = conLogs.map((enlace) => enlace.href);
  const enlaceLogs = conLogs.find((enlace) => enlace.href === "/debug/logs");

  assert.equal(sinLogs.includes("/debug/logs"), false);
  assert.equal(rutasConLogs.includes("/debug/logs"), true);
  assert.equal(enlaceLogs?.etiqueta, "Logs");
  assert.equal(enlaceLogs?.coincidencia, "exacta");
});
