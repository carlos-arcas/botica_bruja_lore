"use client";

import { useMemo, useState } from "react";

import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";

const SECCIONES = [
  { etiqueta: "Botica Natural", slug: "botica-natural" },
  { etiqueta: "Velas e Incienso", slug: "velas-e-incienso" },
  { etiqueta: "Minerales y Energía", slug: "minerales-y-energia" },
  { etiqueta: "Herramientas Esotéricas", slug: "herramientas-esotericas" },
] as const;

const CAMPOS_COMUNES = [
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "descripcion_corta", etiqueta: "Descripción corta", tipo: "textarea" as const },
  { clave: "precio_visible", etiqueta: "Precio visible" },
  { clave: "imagen_url", etiqueta: "Imagen" },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

const CAMPOS_POR_SECCION: Record<string, { clave: string; etiqueta: string }[]> = {
  "botica-natural": [
    { clave: "tipo_producto", etiqueta: "Formato / peso" },
    { clave: "categoria_comercial", etiqueta: "Uso" },
  ],
  "velas-e-incienso": [
    { clave: "tipo_producto", etiqueta: "Tipo (vela/incienso/sahumerio)" },
    { clave: "categoria_comercial", etiqueta: "Aroma" },
  ],
  "minerales-y-energia": [
    { clave: "tipo_producto", etiqueta: "Mineral" },
    { clave: "categoria_comercial", etiqueta: "Tamaño / acabado" },
  ],
  "herramientas-esotericas": [
    { clave: "tipo_producto", etiqueta: "Tipo de herramienta" },
    { clave: "categoria_comercial", etiqueta: "Material / compatibilidades" },
  ],
};

export function ModuloProductosAdmin({ token, itemsIniciales }: { token?: string; itemsIniciales: Record<string, unknown>[] }): JSX.Element {
  const [seccion, setSeccion] = useState<string>(SECCIONES[0].slug);

  const filtrados = useMemo(() => itemsIniciales.filter((item) => item.seccion_publica === seccion), [itemsIniciales, seccion]);

  return (
    <>
      <section className="admin-bloque">
        <h2>Productos · Selecciona sección</h2>
        <div className="admin-filtros">
          {SECCIONES.map((opcion) => (
            <button key={opcion.slug} type="button" className={seccion === opcion.slug ? "tab-intencion tab-intencion--activa" : "tab-intencion"} onClick={() => setSeccion(opcion.slug)}>
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </section>
      <ModuloCrudContextualAdmin
        modulo="productos"
        titulo="Productos"
        token={token}
        itemsIniciales={filtrados}
        campoEstado="publicado"
        entidadImportacion="productos"
        camposComunes={CAMPOS_COMUNES}
        camposEspecificos={CAMPOS_POR_SECCION[seccion] ?? []}
        seccionSeleccionada={seccion}
        construirPayload={(form) => ({ ...form, seccion_publica: seccion, orden_publicacion: 100 })}
      />
    </>
  );
}
