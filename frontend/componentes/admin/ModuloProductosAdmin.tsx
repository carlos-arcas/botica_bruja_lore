"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";
import { obtenerPlantasAsociadasBackoffice } from "@/infraestructura/api/backoffice";
import { validarFormularioProducto } from "@/infraestructura/configuracion/validacionProductosBackoffice";
import { BENEFICIOS_BOTICA, CATEGORIAS_VISIBLES_BOTICA, FORMATOS_BOTICA, MODOS_USO_BOTICA } from "@/contenido/catalogo/taxonomiasBoticaNatural";

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
  { clave: "imagen_url", etiqueta: "Imagen", tipo: "imagen" as const },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

function construirCamposPorSeccion(opcionesPlantas: { etiqueta: string; valor: string }[]): Record<string, { clave: string; etiqueta: string; tipo?: "select" | "multi_select"; opciones?: { etiqueta: string; valor: string }[] }[]> {
  return {
    "botica-natural": [
      { clave: "beneficio_principal", etiqueta: "Beneficio", tipo: "select", opciones: BENEFICIOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
      { clave: "beneficios_secundarios", etiqueta: "Beneficios secundarios", tipo: "multi_select", opciones: BENEFICIOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
      { clave: "formato_comercial", etiqueta: "Formato comercial", tipo: "select", opciones: FORMATOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
      { clave: "modo_uso", etiqueta: "Modo de uso", tipo: "select", opciones: MODOS_USO_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
      { clave: "categoria_visible", etiqueta: "Categoría visible", tipo: "select", opciones: CATEGORIAS_VISIBLES_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
      { clave: "tipo_producto", etiqueta: "Tipo de producto", tipo: "select", opciones: [{ etiqueta: "Hierbas a granel", valor: "hierbas-a-granel" }, { etiqueta: "Inciensos y sahumerios", valor: "inciensos-y-sahumerios" }, { etiqueta: "Herramientas rituales", valor: "herramientas-rituales" }] },
      { clave: "categoria_comercial", etiqueta: "Categoría comercial interna", tipo: "select", opciones: CATEGORIAS_VISIBLES_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
      { clave: "planta_id", etiqueta: "Planta asociada", tipo: "select", opciones: opcionesPlantas },
    ],
    "velas-e-incienso": [
      { clave: "tipo_producto", etiqueta: "Tipo" },
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
}

const COLUMNAS_OBLIGATORIAS = ["nombre", "seccion_publica", "tipo_producto", "categoria_comercial"];
const COLUMNAS_OPCIONALES = [
  "descripcion_corta",
  "precio_visible",
  "imagen_url",
  "publicado",
  "beneficio_principal",
  "beneficios_secundarios",
  "formato_comercial",
  "modo_uso",
  "categoria_visible",
];

export function ModuloProductosAdmin({ token, itemsIniciales }: { token?: string; itemsIniciales: Record<string, unknown>[] }): JSX.Element {
  const [seccion, setSeccion] = useState<string>(SECCIONES[0].slug);
  const [opcionesPlantas, setOpcionesPlantas] = useState<{ etiqueta: string; valor: string }[]>([]);
  const filtrados = useMemo(() => itemsIniciales.filter((item) => item.seccion_publica === seccion), [itemsIniciales, seccion]);
  const camposPorSeccion = useMemo(() => construirCamposPorSeccion(opcionesPlantas), [opcionesPlantas]);

  useEffect(() => {
    let activa = true;
    const cargarPlantas = async () => {
      try {
        const plantas = await obtenerPlantasAsociadasBackoffice(token);
        if (!activa) return;
        setOpcionesPlantas(plantas.map((planta) => ({ etiqueta: planta.nombre, valor: planta.id })));
      } catch {
        if (!activa) return;
        setOpcionesPlantas([]);
      }
    };
    void cargarPlantas();
    return () => {
      activa = false;
    };
  }, [token]);

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
        tipoPayload="productos"
        titulo="Productos"
        token={token}
        itemsIniciales={filtrados}
        campoEstado="publicado"
        entidadImportacion="productos"
        camposComunes={CAMPOS_COMUNES}
        camposEspecificos={camposPorSeccion[seccion] ?? []}
        seccionSeleccionada={seccion}
        columnasObligatoriasImportacion={COLUMNAS_OBLIGATORIAS}
        columnasOpcionalesImportacion={COLUMNAS_OPCIONALES}
        contextoFormulario={{
          clave: "seccion_publica",
          etiqueta: "Dónde se mostrará",
          ayuda: "Selecciona la categoría del catálogo antes de completar los demás campos.",
          opciones: SECCIONES.map((it) => ({ etiqueta: it.etiqueta, valor: it.slug })),
        }}
        onCambioContexto={setSeccion}
        validarFormulario={validarFormularioProducto}
      />
    </>
  );
}
