import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("la imagen de tarjetas de producto navega a la ficha correspondiente", () => {
  const tarjetaBotica = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const tarjetaColecciones = readFileSync(join(process.cwd(), "componentes/catalogo/TarjetaCatalogo.tsx"), "utf8");
  const rutas = readFileSync(join(process.cwd(), "componentes/catalogo/rutasProductoPublico.ts"), "utf8");

  assert.equal(tarjetaBotica.includes("const hrefFicha = construirHrefFichaProductoPublico(producto);"), true);
  assert.equal(tarjetaBotica.includes('Link href={hrefFicha} className="botica-natural__media-enlace"'), true);
  assert.equal(tarjetaColecciones.includes("href={`/colecciones/${producto.slug}`}"), true);
  assert.equal(tarjetaColecciones.includes("className={estilos.mediaEnlace}"), true);
  assert.equal(rutas.includes("/botica-natural/${producto.slug}"), true);
});

test("la imagen de tarjeta ritual navega a su ficha ritual", () => {
  const tarjeta = readFileSync(join(process.cwd(), "componentes/rituales/TarjetaRitual.tsx"), "utf8");

  assert.equal(tarjeta.includes("Link href={ritual.urlDetalle} className=\"tarjeta-media-enlace\""), true);
  assert.equal(tarjeta.includes("Abrir ficha ritual de"), true);
});

test("la imagen de productos relacionados navega a su ficha", () => {
  const bloque = readFileSync(join(process.cwd(), "componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx"), "utf8");

  assert.equal(bloque.includes("const hrefFicha = construirHrefFichaProductoPublico(producto);"), true);
  assert.equal(bloque.includes('Link href={hrefFicha} className="botica-natural__media-enlace"'), true);
});

test("el fallback visual de imagen se mantiene dentro de zona clickable", () => {
  const tarjetaProducto = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const imagenProducto = readFileSync(join(process.cwd(), "componentes/botica-natural/ImagenProductoBoticaNatural.tsx"), "utf8");
  const bloqueRelacionados = readFileSync(join(process.cwd(), "componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx"), "utf8");
  const tarjetaRitual = readFileSync(join(process.cwd(), "componentes/rituales/TarjetaRitual.tsx"), "utf8");

  assert.match(tarjetaProducto, /<Link href=\{hrefFicha\}[\s\S]*ImagenProductoBoticaNatural/);
  assert.equal(imagenProducto.includes("botica-natural__imagen--fallback"), true);
  assert.match(bloqueRelacionados, /<Link href=\{hrefFicha\}[\s\S]*ImagenProductoBoticaNatural/);
  assert.match(tarjetaRitual, /<Link href=\{ritual\.urlDetalle\}[\s\S]*tarjeta-media-fallback/);
});

test("no hay regresión del CTA Agregar al carrito en cards comerciales", () => {
  const tarjetaProducto = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const accionesTarjetaProducto = readFileSync(join(process.cwd(), "componentes/botica-natural/AccionesTarjetaProductoBoticaNatural.tsx"), "utf8");
  const bloqueRelacionados = readFileSync(join(process.cwd(), "componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx"), "utf8");

  assert.equal(tarjetaProducto.includes("AccionesTarjetaProductoBoticaNatural"), true);
  assert.equal(accionesTarjetaProducto.includes("Agregar al carrito"), true);
  assert.equal(accionesTarjetaProducto.includes("manejarAgregarCarrito"), true);
  assert.equal(bloqueRelacionados.includes("BotonAgregarCarrito"), true);
});

test("evita enlaces anidados en tarjetas comerciales y rituales", () => {
  const tarjetaProducto = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const bloqueRelacionados = readFileSync(join(process.cwd(), "componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx"), "utf8");
  const tarjetaRitual = readFileSync(join(process.cwd(), "componentes/rituales/TarjetaRitual.tsx"), "utf8");

  assert.equal(/<Link[^>]*>\s*<Link/.test(tarjetaProducto), false);
  assert.equal(/<Link[^>]*>\s*<Link/.test(bloqueRelacionados), false);
  assert.equal(/<Link[^>]*>\s*<Link/.test(tarjetaRitual), false);
});
