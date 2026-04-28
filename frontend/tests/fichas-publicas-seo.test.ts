import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { construirMetadataSeo } from "../infraestructura/seo/metadataSeo";
import {
  construirDescriptionFichaPublica,
  construirTitleFichaPublica,
} from "../infraestructura/seo/seoFichasPublicas";

function contarCoincidencias(texto: string, patron: RegExp): number {
  return [...texto.matchAll(patron)].length;
}

test("helpers SEO de fichas generan title y description específicos por tipo", () => {
  const titleHierba = construirTitleFichaPublica({ nombre: "Melisa", tipoFicha: "hierba" });
  const titleRitual = construirTitleFichaPublica({ nombre: "Cierre Sereno", tipoFicha: "ritual" });
  const titleColeccion = construirTitleFichaPublica({
    nombre: "Bruma de Lavanda Serena",
    tipoFicha: "coleccion",
  });

  assert.match(titleHierba, /Melisa \| Ficha herbal \| La Botica de la Bruja Lore/);
  assert.match(titleRitual, /Cierre Sereno \| Ficha ritual \| La Botica de la Bruja Lore/);
  assert.match(
    titleColeccion,
    /Bruma de Lavanda Serena \| Colección editorial \| La Botica de la Bruja Lore/,
  );
  assert.notEqual(titleHierba, titleRitual);

  const description = construirDescriptionFichaPublica({
    nombre: "Melisa",
    tipoFicha: "hierba",
    resumen: "Planta aromática para pausas suaves.",
    intenciones: ["Calma"],
  });

  assert.match(description, /Hierba Melisa/);
  assert.match(description, /Planta aromática para pausas suaves\./);
  assert.match(description, /Intención asociada: Calma\./);
});

test("fichas públicas indexables mantienen canonical y robots index/follow", () => {
  const metadata = construirMetadataSeo({
    title: construirTitleFichaPublica({ nombre: "Melisa", tipoFicha: "hierba" }),
    description: construirDescriptionFichaPublica({
      nombre: "Melisa",
      tipoFicha: "hierba",
      resumen: "Planta aromática para pausas suaves.",
    }),
    rutaCanonical: "/hierbas/melisa",
  });

  assert.equal(metadata.alternates?.canonical, "/hierbas/melisa");
  assert.equal((metadata.robots as { index?: boolean }).index, true);
  assert.equal((metadata.robots as { follow?: boolean }).follow, true);
});

test("fichas públicas mantienen h1 único y enlaces internos base", () => {
  const cabeceraHerbal = readFileSync(
    join(process.cwd(), "componentes/herbal/detalle/CabeceraFichaHerbal.tsx"),
    "utf8",
  );
  const cabeceraRitual = readFileSync(
    join(process.cwd(), "componentes/rituales/detalle/CabeceraFichaRitual.tsx"),
    "utf8",
  );
  const fichaColeccion = readFileSync(
    join(process.cwd(), "componentes/catalogo/detalle/FichaProductoCatalogo.tsx"),
    "utf8",
  );

  assert.equal(contarCoincidencias(cabeceraHerbal, /<h1[\s>]/g), 1);
  assert.equal(contarCoincidencias(cabeceraRitual, /<h1[\s>]/g), 1);
  assert.equal(contarCoincidencias(fichaColeccion, /<h1[\s>]/g), 1);

  assert.match(cabeceraHerbal, /href="\/hierbas"/);
  assert.match(cabeceraHerbal, /href="\/rituales"/);
  assert.match(cabeceraHerbal, /href="\/colecciones"/);
  assert.match(cabeceraRitual, /href="\/rituales"/);
  assert.match(cabeceraRitual, /href="\/hierbas"/);
  assert.match(fichaColeccion, /href="\/colecciones"/);
  assert.match(fichaColeccion, /href="\/rituales"/);
  assert.match(fichaColeccion, /checkout\?producto=\$\{producto.slug\}.*boton--principal/);
  assert.match(fichaColeccion, /encargo\?producto=\$\{producto.slug\}.*boton--secundario/);
});
