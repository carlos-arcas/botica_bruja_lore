import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("/botica-natural usa fetch real al endpoint de secciones y renderiza cards", () => {
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");
  const api = readFileSync(join(process.cwd(), "infraestructura/api/herbal.ts"), "utf8");

  assert.equal(pagina.includes('obtenerProductosPublicosPorSeccion("botica-natural")'), true);
  assert.equal(pagina.includes("<ListadoProductosBoticaNatural"), true);
  assert.equal(api.includes('/api/v1/herbal/secciones/${slugSeccion}/productos/'), true);
  assert.equal(api.includes("NEXT_PUBLIC_API_BASE_URL"), true);
});

test("la sección Botica Natural contempla vacío real separado de estados de error", () => {
  const componente = readFileSync(
    join(process.cwd(), "componentes/botica-natural/ListadoProductosBoticaNatural.tsx"),
    "utf8",
  );
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");

  assert.equal(componente.includes("if (productos.length === 0)"), true);
  assert.equal(componente.includes("TarjetaProductoBoticaNatural"), true);
  assert.equal(componente.includes("sin productos publicados"), true);
  assert.equal(pagina.includes("No pudimos cargar Botica Natural"), true);
  assert.equal(pagina.includes("resolverMensajeError"), true);
});

test("el cliente API registra diagnóstico de endpoint y tipo de error", () => {
  const api = readFileSync(join(process.cwd(), "infraestructura/api/herbal.ts"), "utf8");

  assert.equal(api.includes("diagnostico"), true);
  assert.equal(api.includes('tipoError: "http_error"'), true);
  assert.equal(api.includes("[botica-natural]"), true);
  assert.equal(api.includes("respuesta_invalida"), true);
});

test("las cards de Botica Natural reservan media fija y fallback sin romper layout", () => {
  const tarjeta = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const estilos = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

  assert.equal(tarjeta.includes("botica-natural__media-enlace"), true);
  assert.equal(tarjeta.includes("botica-natural__imagen--fallback"), true);
  assert.equal(estilos.includes(".botica-natural__media-enlace"), true);
  assert.equal(estilos.includes("aspect-ratio: 4 / 3"), true);
  assert.equal(estilos.includes(".botica-natural__card"), true);
  assert.equal(estilos.includes("grid-template-rows: auto 1fr"), true);
});

test("cada card incorpora control de unidades y CTA conectado al flujo de carrito", () => {
  const tarjeta = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const control = readFileSync(join(process.cwd(), "componentes/botica-natural/ControlUnidadesBoticaNatural.tsx"), "utf8");
  const hook = readFileSync(join(process.cwd(), "componentes/catalogo/cesta/useCarrito.ts"), "utf8");

  assert.equal(tarjeta.includes("ControlUnidadesBoticaNatural"), true);
  assert.equal(control.includes("Disminuir unidades"), true);
  assert.equal(control.includes("Aumentar unidades"), true);
  assert.equal(control.includes("min={1}"), true);
  assert.equal(tarjeta.includes("Agregar al carrito"), true);
  assert.equal(tarjeta.includes("agregarAlCarrito(producto.slug, cantidad)"), true);
  assert.equal(hook.includes("agregarProducto(cesta, slug, cantidad)"), true);
});

test("la card mantiene jerarquía estable de contenido y acciones", () => {
  const tarjeta = readFileSync(join(process.cwd(), "componentes/botica-natural/TarjetaProductoBoticaNatural.tsx"), "utf8");
  const estilos = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

  assert.equal(tarjeta.includes("botica-natural__descripcion"), true);
  assert.equal(tarjeta.includes("botica-natural__precio"), true);
  assert.equal(tarjeta.includes("botica-natural__acciones"), true);
  assert.equal(estilos.includes(".botica-natural__contenido"), true);
  assert.equal(estilos.includes("grid-template-rows: auto 1fr auto auto"), true);
  assert.equal(estilos.includes("@media (max-width: 640px)"), true);
});
