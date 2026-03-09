import * as assert from "node:assert/strict";
import { test } from "node:test";

import { PRODUCTOS_CATALOGO } from "../contenido/catalogo/catalogo";
import {
  construirEstadoInicialConsulta,
  construirResumenConsulta,
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
  const estado = construirEstadoInicialConsulta(null);
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
