import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  PAGINAS_LEGALES_COMERCIALES,
  obtenerPaginaLegalComercial,
} from "../contenido/legal/contenidoLegalComercial";

test("dataset legal/comercial define tres páginas mínimas con metadata", () => {
  assert.equal(PAGINAS_LEGALES_COMERCIALES.length, 3);
  assert.equal(PAGINAS_LEGALES_COMERCIALES.every((pagina) => pagina.secciones.length >= 3), true);
  assert.equal(PAGINAS_LEGALES_COMERCIALES.every((pagina) => typeof pagina.metadata.title === "string"), true);
  assert.equal(PAGINAS_LEGALES_COMERCIALES.every((pagina) => pagina.cta.primaria.href.startsWith("/")), true);
});

test("contenido legal/comercial mantiene aviso honesto sobre flujo sin checkout", () => {
  const condiciones = obtenerPaginaLegalComercial("/condiciones-encargo");

  assert.match(condiciones.aviso, /No hay compra ni pago automático integrado/i);
});

test("privacidad usa una redacción prudente y orientada al formulario", () => {
  const privacidad = obtenerPaginaLegalComercial("/privacidad");

  assert.equal(privacidad.secciones.some((seccion) => seccion.titulo.includes("Qué datos")), true);
  assert.match(privacidad.metadata.description ?? "", /formulario de encargo/i);
});
