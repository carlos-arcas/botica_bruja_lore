import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  ENLACES_LEGALES_FOOTER,
  PAGINAS_LEGALES_COMERCIALES,
  describirCanalPublico,
  obtenerPaginaLegalComercial,
} from "../contenido/legal/paginasLegalesComerciales";

test("páginas legales/comerciales mantienen estructura mínima tipada", () => {
  assert.equal(PAGINAS_LEGALES_COMERCIALES.length, 3);

  PAGINAS_LEGALES_COMERCIALES.forEach((pagina) => {
    assert.ok(pagina.titulo.length > 10);
    assert.ok(pagina.introduccion.length > 20);
    assert.ok(pagina.aviso.length > 20);
    assert.ok(pagina.secciones.length >= 3);
    assert.ok(pagina.metadata.title);
    assert.ok(pagina.metadata.description);
    assert.equal(typeof pagina.seo.indexable, "boolean");
    assert.equal(typeof pagina.seo.incluirEnSitemap, "boolean");
    assert.equal(typeof pagina.seo.esEstrategica, "boolean");
  });
});

test("obtenerPaginaLegalComercial resuelve por ruta y falla con ruta inexistente", () => {
  const privacidad = obtenerPaginaLegalComercial("/privacidad");
  assert.equal(privacidad.titulo, "Privacidad y contacto básico");

  assert.throws(
    () => obtenerPaginaLegalComercial("/ruta-inexistente"),
    /Página legal\/comercial no encontrada/,
  );
});

test("enlaces legales de footer se mantienen sincronizados con páginas", () => {
  const rutasPaginas = new Set(PAGINAS_LEGALES_COMERCIALES.map((pagina) => pagina.ruta));

  ENLACES_LEGALES_FOOTER.forEach((enlace) => {
    assert.equal(rutasPaginas.has(enlace.href), true);
  });
});

test("describirCanalPublico comunica fallback honesto cuando no hay configuración", () => {
  const sinCanal = describirCanalPublico({ email: null, whatsapp: null });
  assert.match(sinCanal, /no hay un canal público configurado/);

  const conCanal = describirCanalPublico({ email: "equipo@botica.es", whatsapp: "34600123123" });
  assert.match(conCanal, /email \(equipo@botica.es\)/);
  assert.match(conCanal, /WhatsApp \(34600123123\)/);
});


test("solo envíos y preparación queda como página legal estratégica", () => {
  const indexables = PAGINAS_LEGALES_COMERCIALES.filter((pagina) => pagina.seo.indexable);

  assert.equal(indexables.length, 1);
  assert.equal(indexables[0]?.ruta, "/envios-y-preparacion");
  assert.equal(indexables[0]?.seo.incluirEnSitemap, true);
});
