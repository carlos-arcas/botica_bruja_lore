import * as assert from "node:assert/strict";
import { test } from "node:test";

import { PRODUCTOS_CATALOGO } from "../contenido/catalogo/catalogo";
import {
  construirEstadoInicialConsulta,
  construirResumenConsulta,
  resolverContextoPreseleccionado,
  resolverProductoPreseleccionado,
  validarSolicitudConsulta,
} from "../contenido/catalogo/encargoConsulta";

test("resolverProductoPreseleccionado devuelve producto válido por slug", () => {
  const producto = resolverProductoPreseleccionado("infusion-bruma-lavanda", PRODUCTOS_CATALOGO);
  assert.equal(producto?.nombre, "Bruma de Lavanda Serena");
});

test("resolverProductoPreseleccionado usa fallback seguro con slug inválido", () => {
  const producto = resolverProductoPreseleccionado("no-existe", PRODUCTOS_CATALOGO);
  assert.equal(producto, null);
});

test("construirEstadoInicialConsulta permite entrada directa sin slug", () => {
  const estado = construirEstadoInicialConsulta({ productoPreseleccionado: null, itemsPreseleccionados: [] });
  assert.equal(estado.productoSlug, "");
  assert.equal(estado.cantidad, "1 unidad");
});

test("validarSolicitudConsulta reporta errores cuando faltan campos", () => {
  const errores = validarSolicitudConsulta({
    nombre: "A",
    email: "",
    telefono: "123",
    productoSlug: "",
    cantidad: "",
    mensaje: "Muy corto",
    consentimiento: false,
  });

  assert.ok(errores.nombre);
  assert.ok(errores.email);
  assert.ok(errores.productoSlug);
  assert.ok(errores.mensaje);
  assert.ok(errores.consentimiento);
});

test("construirResumenConsulta compone texto final reutilizable", () => {
  const producto = PRODUCTOS_CATALOGO[0];
  const resumen = construirResumenConsulta(
    {
      nombre: "Lore",
      email: "lore@botica.es",
      telefono: "",
      productoSlug: producto.slug,
      cantidad: "2 unidades",
      mensaje: "Busco una preparación para cerrar el día con calma.",
      consentimiento: true,
    },
    producto,
  );

  assert.match(resumen, /Lore/);
  assert.match(resumen, /Bruma de Lavanda Serena/);
  assert.match(resumen, /2 unidades/);
});


test("resolverContextoPreseleccionado mantiene compatibilidad entre producto individual y cesta", () => {
  const desdeFicha = resolverContextoPreseleccionado("infusion-bruma-lavanda", null);
  assert.equal(desdeFicha.productoPreseleccionado?.slug, "infusion-bruma-lavanda");
  assert.equal(desdeFicha.itemsPreseleccionados.length, 0);

  const desdeCesta = resolverContextoPreseleccionado(
    null,
    encodeURIComponent(JSON.stringify([{ slug: "pack-bosque-dorado", cantidad: 2 }])),
  );
  assert.equal(desdeCesta.productoPreseleccionado, null);
  assert.equal(desdeCesta.itemsPreseleccionados[0]?.slug, "pack-bosque-dorado");
});
