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
import { LineaSeleccionEncargo } from "../contenido/catalogo/seleccionEncargo";

const LINEAS_SELECCION: LineaSeleccionEncargo[] = [
  {
    id_linea: "rit-001",
    tipo_linea: "catalogo",
    slug: "infusion-bruma-lavanda",
    id_producto: "rit-001",
    nombre: "Bruma de Lavanda Serena",
    cantidad: 1,
    formato: "mezcla-herbal",
    imagen_url: null,
    referencia_economica: {
      etiqueta: "Referencia editorial disponible",
      valor: 14.9,
    },
    notas_origen: "Mezcla floral de cierre del día.",
  },
  {
    id_linea: "libre-001",
    tipo_linea: "fuera_catalogo",
    slug: null,
    id_producto: null,
    nombre: "Atado herbal a medida",
    cantidad: 1,
    formato: "ramillete artesanal",
    imagen_url: null,
    referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
    notas_origen: "Petición manual guardada desde selección local.",
  },
];

test("resolverProductoPreseleccionado devuelve producto válido por slug", () => {
  const producto = resolverProductoPreseleccionado(
    "infusion-bruma-lavanda",
    PRODUCTOS_CATALOGO,
  );
  assert.equal(producto?.nombre, "Bruma de Lavanda Serena");
});

test("resolverProductoPreseleccionado usa fallback seguro con slug inválido", () => {
  const producto = resolverProductoPreseleccionado(
    "no-existe",
    PRODUCTOS_CATALOGO,
  );
  assert.equal(producto, null);
});

test("construirEstadoInicialConsulta permite entrada directa sin slug", () => {
  const estado = construirEstadoInicialConsulta({
    modo: "producto",
    productoPreseleccionado: null,
    itemsPreseleccionados: [],
  });
  assert.equal(estado.productoSlug, "");
  assert.equal(estado.cantidad, "1 unidad");
});

test("construirEstadoInicialConsulta para selección múltiple evita parches en cantidad y mensaje", () => {
  const estado = construirEstadoInicialConsulta(
    {
      modo: "seleccion",
      productoPreseleccionado: null,
      itemsPreseleccionados: [],
    },
    LINEAS_SELECCION,
  );
  assert.equal(estado.productoSlug, "");
  assert.doesNotMatch(estado.cantidad, /Selección múltiple desde cesta/);
  assert.match(estado.mensaje, /Selección enviada desde mi selección/);
});

test("validarSolicitudConsulta reporta errores cuando faltan campos en modo producto", () => {
  const errores = validarSolicitudConsulta(
    {
      nombre: "A",
      email: "",
      telefono: "123",
      productoSlug: "",
      cantidad: "",
      mensaje: "Muy corto",
      consentimiento: false,
    },
    "producto",
  );

  assert.ok(errores.nombre);
  assert.ok(errores.email);
  assert.ok(errores.productoSlug);
  assert.ok(errores.mensaje);
  assert.ok(errores.consentimiento);
});

test("validarSolicitudConsulta no exige selector único en modo selección", () => {
  const errores = validarSolicitudConsulta(
    {
      nombre: "Lore",
      email: "lore@botica.es",
      telefono: "",
      productoSlug: "",
      cantidad: "A convenir",
      mensaje:
        "Quiero revisar esta selección con calma y ajustar el formato final.",
      consentimiento: true,
    },
    "seleccion",
  );

  assert.equal(errores.productoSlug, undefined);
});

test("construirResumenConsulta compone texto final reutilizable en modo producto", () => {
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
    "producto",
  );

  assert.match(resumen, /Lore/);
  assert.match(resumen, /Bruma de Lavanda Serena/);
  assert.match(resumen, /2 unidades/);
});

test("construirResumenConsulta refleja la selección rica real en modo múltiple", () => {
  const resumen = construirResumenConsulta(
    {
      nombre: "Lore",
      email: "lore@botica.es",
      telefono: "",
      productoSlug: "",
      cantidad: "A definir durante la revisión artesanal",
      mensaje:
        "Quiero que revisemos el equilibrio entre la pieza publicada y la pieza fuera de catálogo.",
      consentimiento: true,
    },
    null,
    "seleccion",
    LINEAS_SELECCION,
  );

  assert.match(resumen, /Selección:/);
  assert.match(resumen, /Bruma de Lavanda Serena/);
  assert.match(resumen, /Atado herbal a medida/);
  assert.doesNotMatch(resumen, /Producto pendiente de selección/);
});

test("resolverContextoPreseleccionado mantiene compatibilidad entre producto individual, selección rica y estado legacy", () => {
  const desdeFicha = resolverContextoPreseleccionado(
    "infusion-bruma-lavanda",
    null,
  );
  assert.equal(desdeFicha.modo, "producto");
  assert.equal(
    desdeFicha.productoPreseleccionado?.slug,
    "infusion-bruma-lavanda",
  );
  assert.equal(desdeFicha.itemsPreseleccionados.length, 0);

  const desdeSeleccion = resolverContextoPreseleccionado(
    null,
    null,
    "seleccion",
  );
  assert.equal(desdeSeleccion.modo, "seleccion");

  const desdeSeleccionRica = resolverContextoPreseleccionado(
    null,
    encodeURIComponent(JSON.stringify(LINEAS_SELECCION)),
    "seleccion",
  );
  assert.equal(desdeSeleccionRica.itemsPreseleccionados[1]?.slug, null);
  assert.equal(
    desdeSeleccionRica.itemsPreseleccionados[1]?.nombre,
    "Atado herbal a medida",
  );

  const desdeCestaLegacy = resolverContextoPreseleccionado(
    null,
    encodeURIComponent(
      JSON.stringify([{ slug: "pack-bosque-dorado", cantidad: 2 }]),
    ),
  );
  assert.equal(desdeCestaLegacy.modo, "seleccion");
  assert.equal(
    desdeCestaLegacy.itemsPreseleccionados[0]?.slug,
    "pack-bosque-dorado",
  );
  assert.equal(
    desdeCestaLegacy.itemsPreseleccionados[0]?.nombre,
    "Pack Bosque Dorado",
  );
});

test("la regresión rica mantiene catálogo + fuera de catálogo en el resumen de encargo", () => {
  const estado = construirEstadoInicialConsulta(
    {
      modo: "seleccion",
      productoPreseleccionado: null,
      itemsPreseleccionados: [],
    },
    LINEAS_SELECCION,
  );

  assert.match(estado.mensaje, /Bruma de Lavanda Serena/);
  assert.match(estado.mensaje, /Atado herbal a medida/);
  assert.equal(LINEAS_SELECCION[0]?.imagen_url, null);
  assert.equal(LINEAS_SELECCION[1]?.referencia_economica.valor, null);
});

test("la consulta artesanal conserva un resumen usable cuando mezcla una línea convertible y otra fuera de catálogo", () => {
  const resumen = construirResumenConsulta(
    {
      nombre: "Lore",
      email: "lore@botica.es",
      telefono: "",
      productoSlug: "",
      cantidad: "A definir durante la revisión artesanal",
      mensaje:
        "Necesito mantener la pieza publicada y revisar aparte el encargo fuera de catálogo sin perder contexto.",
      consentimiento: true,
    },
    null,
    "seleccion",
    LINEAS_SELECCION,
  );

  assert.match(resumen, /Consulta de encargo/);
  assert.match(resumen, /Bruma de Lavanda Serena/);
  assert.match(resumen, /Atado herbal a medida/);
  assert.match(resumen, /A definir durante la revisión artesanal/);
});
