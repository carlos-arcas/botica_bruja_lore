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
  { clave: "precio_visible", etiqueta: "Precio visible", tipo: "precio" as const },
  { clave: "imagen_url", etiqueta: "Imagen" },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

const OPCIONES_TIPO_VELAS = [
  { etiqueta: "Vela", valor: "vela" },
  { etiqueta: "Incienso", valor: "incienso" },
  { etiqueta: "Sahumerio", valor: "sahumerio" },
  { etiqueta: "Cono aromático", valor: "cono-aromatico" },
];

const CAMPOS_POR_SECCION: Record<string, { clave: string; etiqueta: string; tipo?: "select"; opciones?: { etiqueta: string; valor: string }[] }[]> = {
  "botica-natural": [
    { clave: "tipo_producto", etiqueta: "Formato / peso" },
    { clave: "categoria_comercial", etiqueta: "Uso" },
  ],
  "velas-e-incienso": [
    { clave: "tipo_producto", etiqueta: "Tipo", tipo: "select", opciones: OPCIONES_TIPO_VELAS },
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

const COLUMNAS_OBLIGATORIAS = ["nombre", "seccion_publica", "tipo_producto", "categoria_comercial"];
const COLUMNAS_OPCIONALES = ["descripcion_corta", "precio_visible", "imagen_url", "publicado"];

export function ModuloProductosAdmin({ token, itemsIniciales }: { token?: string; itemsIniciales: Record<string, unknown>[] }): JSX.Element {
  const [seccion, setSeccion] = useState<string>(SECCIONES[0].slug);
  const filtrados = useMemo(() => itemsIniciales.filter((item) => item.seccion_publica === seccion), [itemsIniciales, seccion]);

  return (
    <>
      <section className="admin-bloque">
        <h2>Productos · Colección principal</h2>
        <div className="admin-filtros admin-filtros--segmentado" role="tablist" aria-label="Colección comercial">
          {SECCIONES.map((opcion) => (
            <button
              key={opcion.slug}
              type="button"
              role="tab"
              aria-selected={seccion === opcion.slug}
              className={seccion === opcion.slug ? "admin-boton admin-boton--primario" : "admin-boton admin-boton--secundario"}
              onClick={() => setSeccion(opcion.slug)}
            >
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
        columnasObligatoriasImportacion={COLUMNAS_OBLIGATORIAS}
        columnasOpcionalesImportacion={COLUMNAS_OPCIONALES}
        contextoFormulario={{
          clave: "seccion_publica",
          etiqueta: "Colección",
          ayuda: "Selecciona la colección comercial antes de completar los demás campos.",
          opciones: SECCIONES.map((it) => ({ etiqueta: it.etiqueta, valor: it.slug })),
        }}
        onCambioContexto={setSeccion}
        validarFormulario={(form) => {
          const seccionFormulario = String(form.seccion_publica ?? "");
          const camposObligatorios = CAMPOS_POR_SECCION[seccionFormulario] ?? [];
          const vacios = ["nombre", ...camposObligatorios.map((campo) => campo.clave)].filter((clave) => !String(form[clave] ?? "").trim());
          const precio = String(form.precio_visible ?? "").trim();
          if (precio && !/^[0-9]+([.,][0-9]{1,2})?$/.test(precio)) {
            return "Precio visible solo acepta números con decimal opcional.";
          }
          return vacios.length > 0 ? `Completa los campos obligatorios para ${seccionFormulario}: ${vacios.join(", ")}.` : null;
        }}
        tipoPayload="productos"
      />
    </>
  );
}
