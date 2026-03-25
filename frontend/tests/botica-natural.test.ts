import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  construirQueryFiltrosBotica,
  contarFiltroActivo,
  resolverFiltrosBoticaDesdeSearchParams,
} from "../contenido/catalogo/filtrosBoticaNatural";
import {
  mapearRangoAPreciosBotica,
  OPCIONES_RANGO_PRECIO_BOTICA,
  resolverRangoPrecioBotica,
} from "../contenido/catalogo/precioRangosBoticaNatural";
import { debeMostrarControlMostrarMas, obtenerOpcionesVisibles, restaurarVisibilidadReducida } from "../componentes/botica-natural/filtros/estadoVisualFiltros";

const leer = (ruta: string): string => readFileSync(join(process.cwd(), ruta), "utf8");

test("grupos con <=6 opciones muestran todo y no requieren Mostrar más", () => {
  const opcionesBreves = OPCIONES_RANGO_PRECIO_BOTICA.slice(0, 6);
  assert.equal(debeMostrarControlMostrarMas(opcionesBreves), false);
  assert.equal(obtenerOpcionesVisibles(opcionesBreves, false).length, 6);
});

test("grupos con >6 opciones arrancan en 6 visibles y soportan Mostrar más/menos", () => {
  assert.equal(OPCIONES_RANGO_PRECIO_BOTICA.length > 6, true);
  assert.equal(obtenerOpcionesVisibles(OPCIONES_RANGO_PRECIO_BOTICA, false).length, 6);
  assert.equal(obtenerOpcionesVisibles(OPCIONES_RANGO_PRECIO_BOTICA, true).length, OPCIONES_RANGO_PRECIO_BOTICA.length);
  assert.equal(restaurarVisibilidadReducida(), false);
});

test("Todos no incrementa contador y valor real sí incrementa", () => {
  assert.equal(contarFiltroActivo("todos"), 0);
  assert.equal(contarFiltroActivo(""), 0);
  assert.equal(contarFiltroActivo("digestivo"), 1);
});

test("Limpiar deja contador a cero para filtros y precio", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    beneficio: "todos",
    formato: "todos",
    modo_uso: "todos",
    precio_rango: "todos",
  });

  assert.equal(contarFiltroActivo(filtros.beneficio), 0);
  assert.equal(contarFiltroActivo(filtros.formato), 0);
  assert.equal(contarFiltroActivo(filtros.modo_uso), 0);
  assert.equal(contarFiltroActivo(filtros.precio_rango), 0);
});

test("no se generan query params basura cuando filtro efectivo es Todos", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    beneficio: "todos",
    formato: "todos",
    modo_uso: "todos",
    precio_rango: "todos",
  });

  const query = construirQueryFiltrosBotica(filtros);
  assert.equal(query.has("beneficio"), false);
  assert.equal(query.has("formato"), false);
  assert.equal(query.has("modo_uso"), false);
  assert.equal(query.has("precio_rango"), false);
  assert.equal(query.has("precio_min"), false);
  assert.equal(query.has("precio_max"), false);
});

test("precio_rango mapea a precio_min/precio_max", () => {
  assert.deepEqual(mapearRangoAPreciosBotica("todos"), { precio_min: "", precio_max: "" });
  assert.deepEqual(mapearRangoAPreciosBotica("10-20"), { precio_min: "10", precio_max: "20" });
  assert.deepEqual(mapearRangoAPreciosBotica("120+"), { precio_min: "120", precio_max: "" });
  assert.equal(resolverRangoPrecioBotica("30", "50"), "30-50");
  assert.equal(resolverRangoPrecioBotica("999", ""), "todos");
});

test("compatibilidad con enlaces antiguos precio_min/precio_max", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({ precio_min: "20", precio_max: "30" });

  assert.equal(filtros.precio_rango, "todos");
  assert.equal(filtros.precio_min, "20");
  assert.equal(filtros.precio_max, "30");
});

test("si llegan rango y min/max simultáneamente, precio_rango tiene precedencia", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    precio_rango: "50-80",
    precio_min: "10",
    precio_max: "20",
  });

  assert.equal(filtros.precio_rango, "50-80");
  assert.equal(filtros.precio_min, "50");
  assert.equal(filtros.precio_max, "80");
});

test("accesibilidad del acordeón se mantiene estable tras re-render", () => {
  const acordeon = leer("componentes/botica-natural/filtros/AcordeonFiltro.tsx");

  assert.equal(acordeon.includes("aria-expanded={expandido}"), true);
  assert.equal(acordeon.includes("aria-controls={panelId}"), true);
  assert.equal(acordeon.includes('role="region"'), true);
});

test("desktop renderiza rail de filtros fuera del contenedor principal del listado", () => {
  const pagina = leer("app/botica-natural/page.tsx");

  assert.equal(pagina.includes('className="botica-natural__layout-catalogo"'), true);
  assert.equal(pagina.includes('className="botica-natural__rail-filtros"'), true);
  assert.equal(pagina.includes('className="botica-natural__bloque botica-natural__bloque--catalogo"'), true);
});

test("listado no incluye estructuralmente el rail de filtros", () => {
  const listado = leer("componentes/botica-natural/ListadoProductosBoticaNatural.tsx");

  assert.equal(listado.includes("PanelFiltrosBoticaNatural"), false);
  assert.equal(listado.includes("botica-natural__rail-filtros"), false);
  assert.equal(listado.includes('className="botica-natural__contenedor-listado"'), true);
});

test("grid aplica configuración compacta para mayor densidad", () => {
  const estilos = leer("app/globals.css");

  assert.equal(estilos.includes("grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));"), true);
  assert.equal(estilos.includes(".botica-natural__acciones-cta"), true);
});

test("card mantiene render compacto y orden de acciones con CTA principal a la derecha", () => {
  const tarjeta = leer("componentes/botica-natural/TarjetaProductoBoticaNatural.tsx");
  const ordenDetalle = tarjeta.indexOf("Ver detalle");
  const ordenCarrito = tarjeta.indexOf("Agregar al carrito");

  assert.equal(tarjeta.includes('className="botica-natural__acciones-cta"'), true);
  assert.equal(ordenDetalle >= 0, true);
  assert.equal(ordenCarrito > ordenDetalle, true);
  assert.equal(tarjeta.includes('className="boton boton--principal"'), true);
});

test("en móvil se mantiene flujo de filtros sin rail sticky", () => {
  const estilos = leer("app/globals.css");

  assert.equal(estilos.includes("@media (max-width: 900px)"), true);
  assert.equal(estilos.includes(".botica-natural__layout-catalogo"), true);
  assert.equal(estilos.includes(".botica-natural__rail-filtros"), true);
  assert.equal(estilos.includes("position: static;"), true);
});


test("cards y ficha reutilizan next/image con fallback visual sin romper el layout", () => {
  const tarjeta = leer("componentes/botica-natural/TarjetaProductoBoticaNatural.tsx");
  const ficha = leer("componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx");
  const relacionados = leer("componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx");
  const imagen = leer("componentes/botica-natural/ImagenProductoBoticaNatural.tsx");

  assert.equal(tarjeta.includes("ImagenProductoBoticaNatural"), true);
  assert.equal(ficha.includes('variante="ficha"'), true);
  assert.equal(relacionados.includes("ImagenProductoBoticaNatural"), true);
  assert.equal(imagen.includes('botica-natural__imagen--fallback'), true);
  assert.equal(imagen.includes("loader={({ src: origen }) => origen}"), true);
});


test("botica natural refleja disponibilidad mínima en card y ficha sin sobreprometer reserva", () => {
  const tarjeta = leer("componentes/botica-natural/TarjetaProductoBoticaNatural.tsx");
  const ficha = leer("componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx");
  const estado = leer("componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto.tsx");

  assert.equal(tarjeta.includes("EstadoDisponibilidadProducto"), true);
  assert.equal(tarjeta.includes('disabled={!producto.disponible}'), true);
  assert.equal(ficha.includes("La disponibilidad pública es informativa"), true);
  assert.equal(ficha.includes("No disponible para compra"), true);
  assert.equal(estado.includes('"bajo_stock"'), true);
});


test("estado de disponibilidad cubre disponible, bajo stock y no disponible con copy sobrio", () => {
  const estado = leer("componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto.tsx");

  assert.equal(estado.includes("Disponible para compra en este momento."), true);
  assert.equal(estado.includes("Disponibilidad limitada."), true);
  assert.equal(estado.includes("Ahora mismo no está disponible para compra."), true);
  assert.equal(estado.includes("Unidad de venta"), true);
  assert.equal(estado.includes("Incremento mínimo"), true);
});
