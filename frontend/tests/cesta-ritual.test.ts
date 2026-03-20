import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  actualizarCantidad,
  agregarProducto,
  construirResumenItemsEncargo,
  convertirCestaAItemsEncargo,
  convertirCestaALineasSeleccion,
  crearCestaVacia,
  deserializarCesta,
  deserializarItemsEncargo,
  quitarProducto,
  resolverSubtotalVisible,
  serializarCesta,
  serializarItemsEncargo,
  vaciarCesta,
} from "../contenido/catalogo/cestaRitual";
import {
  resolverReferenciaEconomicaVisualLinea,
  resolverResumenEconomicoSeleccion,
} from "../contenido/catalogo/seleccionEncargo";

function crearLineaLibrePersistida() {
  return {
    id_linea: "libre-001",
    tipo_linea: "fuera_catalogo" as const,
    slug: null,
    id_producto: null,
    nombre: "Atado herbal a medida",
    cantidad: 2,
    formato: "ramillete artesanal",
    imagen_url: null,
    referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
    notas_origen: "Petición manual guardada desde la selección.",
    actualizadoEn: "2026-03-20T00:00:00.000Z",
  };
}

test("agregarProducto suma unidades cuando la línea de catálogo ya existe", () => {
  const inicial = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda");
  const actualizada = agregarProducto(inicial, "infusion-bruma-lavanda", 2);

  assert.equal(actualizada.lineas[0]?.cantidad, 3);
  assert.equal(actualizada.lineas[0]?.id_linea, "rit-001");
});

test("actualizarCantidad normaliza estados inválidos", () => {
  const inicial = agregarProducto(
    crearCestaVacia(),
    "infusion-bruma-lavanda",
    2,
  );
  const actualizada = actualizarCantidad(inicial, "rit-001", 0);

  assert.equal(actualizada.lineas[0]?.cantidad, 1);
});

test("quitarProducto elimina la línea indicada por id_linea", () => {
  const inicial = agregarProducto(
    crearCestaVacia(),
    "infusion-bruma-lavanda",
    2,
  );
  const actualizada = quitarProducto(inicial, "rit-001");

  assert.equal(actualizada.lineas.length, 0);
});

test("vaciarCesta devuelve una estructura limpia", () => {
  const inicial = agregarProducto(
    crearCestaVacia(),
    "infusion-bruma-lavanda",
    2,
  );
  const actualizada = vaciarCesta();

  assert.equal(inicial.lineas.length, 1);
  assert.equal(actualizada.lineas.length, 0);
});

test("una línea de catálogo rica se persiste y se rehidrata sin perder contexto clave", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const rehidratada = deserializarCesta(serializarCesta(cesta));

  assert.equal(rehidratada.lineas[0]?.id_linea, "rit-001");
  assert.equal(rehidratada.lineas[0]?.nombre, "Bruma de Lavanda Serena");
  assert.equal(
    rehidratada.lineas[0]?.imagen_url?.startsWith("data:image/svg+xml"),
    true,
  );
  assert.equal(rehidratada.lineas[0]?.referencia_economica.valor, 14.9);
});

test("una línea libre se persiste y se rehidrata sin hacks de slug", () => {
  const cesta = { lineas: [crearLineaLibrePersistida()] };
  const rehidratada = deserializarCesta(serializarCesta(cesta));
  const lineas = convertirCestaALineasSeleccion(rehidratada);

  assert.equal(rehidratada.lineas[0]?.slug, null);
  assert.equal(lineas[0]?.id_linea, "libre-001");
  assert.equal(lineas[0]?.nombre, "Atado herbal a medida");
  assert.equal(lineas[0]?.tipo_linea, "fuera_catalogo");
  assert.equal(
    lineas[0]?.notas_origen,
    "Petición manual guardada desde la selección.",
  );
});

test("serialización y deserialización mantiene compatibilidad con datos legacy mínimos", () => {
  const legacy = JSON.stringify({
    lineas: [{ slug: "infusion-bruma-lavanda", cantidad: 2 }],
  });
  const cesta = deserializarCesta(legacy);

  assert.equal(cesta.lineas[0]?.id_linea, "rit-001");
  assert.equal(cesta.lineas[0]?.nombre, "Bruma de Lavanda Serena");
  assert.equal(cesta.lineas[0]?.cantidad, 2);
  assert.equal(deserializarCesta("{json-invalido").lineas.length, 0);
});

test("convertir cesta a resumen de encargo soporta serialización rica y lectura legacy", () => {
  const cesta = {
    lineas: [
      agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2)
        .lineas[0]!,
      crearLineaLibrePersistida(),
    ],
  };
  const items = convertirCestaAItemsEncargo(cesta);
  const serializado = serializarItemsEncargo(items);
  const recuperado = deserializarItemsEncargo(serializado);
  const legado = deserializarItemsEncargo(
    encodeURIComponent(
      JSON.stringify([{ slug: "pack-bosque-dorado", cantidad: 2 }]),
    ),
  );
  const resumen = construirResumenItemsEncargo(recuperado);

  assert.match(resumen, /2 x Bruma de Lavanda Serena/);
  assert.match(resumen, /2 x Atado herbal a medida/);
  assert.equal(legado[0]?.id_linea, "rit-005");
});

test("una selección con una línea se resuelve como línea real de catálogo", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);

  assert.equal(lineas.length, 1);
  assert.equal(lineas[0]?.nombre, "Bruma de Lavanda Serena");
  assert.equal(lineas[0]?.tipo_linea, "catalogo");
});

test("la referencia económica no comunica 0,00 € cuando ninguna línea tiene referencia", () => {
  const cesta = agregarProducto(crearCestaVacia(), "lavanda-flores-40g", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);
  const resumen = resolverResumenEconomicoSeleccion(lineas);

  assert.equal(resumen.etiqueta, "Sin referencia económica");
  assert.equal(resumen.totalVisible, null);
  assert.equal(resolverSubtotalVisible(cesta), "0,00 €");
});

test("la referencia parcial se comunica como parcial cuando hay mezcla de catálogo y línea libre", () => {
  const cesta = {
    lineas: [
      agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 1)
        .lineas[0]!,
      crearLineaLibrePersistida(),
    ],
  };
  const resumen = resolverResumenEconomicoSeleccion(
    convertirCestaALineasSeleccion(cesta),
  );

  assert.equal(resumen.estado, "parcial");
  assert.equal(resumen.etiqueta, "Referencia parcial");
  assert.match(resumen.totalVisible ?? "", /14,90/);
});

test("una línea de catálogo rellena imagen_url cuando existe información visual", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);

  assert.match(lineas[0]?.imagen_url ?? "", /^data:image\/svg\+xml/);
});

test("una línea con referencia válida expone referencia unitaria y subtotal orientativo honestos", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const lineas = convertirCestaALineasSeleccion(cesta);
  const referencia = resolverReferenciaEconomicaVisualLinea(lineas[0]!);

  assert.equal(referencia.referenciaUnitaria, "14,90 €");
  assert.equal(referencia.subtotal, "29,80 €");
  assert.equal(referencia.mensaje, "Referencia editorial disponible");
});

test("una línea sin referencia mantiene mensaje honesto y no inventa subtotal", () => {
  const cesta = agregarProducto(crearCestaVacia(), "lavanda-flores-40g", 2);
  const lineas = convertirCestaALineasSeleccion(cesta);
  const referencia = resolverReferenciaEconomicaVisualLinea(lineas[0]!);

  assert.equal(referencia.referenciaUnitaria, null);
  assert.equal(referencia.subtotal, null);
  assert.match(referencia.mensaje, /revisión artesanal/);
});

test("regresión: mezcla catálogo y fuera de catálogo conserva identidad y contexto tras rehidratar", () => {
  const cesta = {
    lineas: [
      agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2)
        .lineas[0]!,
      crearLineaLibrePersistida(),
    ],
  };
  const rehidratada = deserializarCesta(serializarCesta(cesta));
  const lineas = convertirCestaALineasSeleccion(rehidratada);

  assert.equal(lineas.length, 2);
  assert.equal(lineas[0]?.id_linea, "rit-001");
  assert.equal(lineas[1]?.id_linea, "libre-001");
  assert.equal(lineas[1]?.slug, null);
  assert.equal(lineas[1]?.formato, "ramillete artesanal");
  assert.equal(
    resolverReferenciaEconomicaVisualLinea(lineas[0]!).subtotal,
    "29,80 €",
  );
  assert.equal(
    resolverReferenciaEconomicaVisualLinea(lineas[1]!).subtotal,
    null,
  );
});
