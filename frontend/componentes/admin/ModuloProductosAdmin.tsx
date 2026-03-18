"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";
import { BENEFICIOS_BOTICA, CATEGORIAS_VISIBLES_BOTICA, FORMATOS_BOTICA, MODOS_USO_BOTICA } from "@/contenido/catalogo/taxonomiasBoticaNatural";
import { PlantaAsociable, obtenerPlantasAsociables } from "@/infraestructura/api/backoffice";
import { validarFormularioProducto } from "@/infraestructura/configuracion/validacionProductosBackoffice";

const SECCIONES = [
  { etiqueta: "Botica Natural", slug: "botica-natural" },
  { etiqueta: "Velas e Incienso", slug: "velas-e-incienso" },
  { etiqueta: "Minerales y Energía", slug: "minerales-y-energia" },
  { etiqueta: "Herramientas Esotéricas", slug: "herramientas-esotericas" },
] as const;

const CAMPOS_COMUNES = [
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "descripcion_corta", etiqueta: "Descripción corta", tipo: "textarea" as const },
  { clave: "precio_numerico", etiqueta: "Precio base", tipo: "precio" as const },
  { clave: "imagen_url", etiqueta: "Imagen", tipo: "imagen" as const },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

const COLUMNAS_OBLIGATORIAS = ["nombre", "seccion_publica", "tipo_producto", "categoria_comercial"];
const COLUMNAS_OPCIONALES = [
  "descripcion_corta",
  "precio_numerico",
  "imagen_url",
  "publicado",
  "beneficio_principal",
  "beneficios_secundarios",
  "formato_comercial",
  "modo_uso",
];

function construirOpcionesPlantas(plantas: PlantaAsociable[]): { etiqueta: string; valor: string }[] {
  return plantas.map((planta) => ({ etiqueta: planta.nombre, valor: planta.id }));
}

export function ModuloProductosAdmin({ token, itemsIniciales }: { token?: string; itemsIniciales: Record<string, unknown>[] }): JSX.Element {
  const [seccion, setSeccion] = useState<string>(SECCIONES[0].slug);
  const [plantas, setPlantas] = useState<PlantaAsociable[]>([]);
  const filtrados = useMemo(() => itemsIniciales.filter((item) => item.seccion_publica === seccion), [itemsIniciales, seccion]);

  useEffect(() => {
    let activo = true;
    void obtenerPlantasAsociables(token)
      .then((items) => {
        if (activo) setPlantas(items);
      })
      .catch(() => {
        if (activo) setPlantas([]);
      });
    return () => {
      activo = false;
    };
  }, [token]);

  const camposPorSeccion = useMemo<Record<string, { clave: string; etiqueta: string; tipo?: "select" | "multi_select"; opciones?: { etiqueta: string; valor: string }[] }[]>>(
    () => ({
      "botica-natural": [
        { clave: "beneficio_principal", etiqueta: "Beneficio", tipo: "select" as const, opciones: BENEFICIOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "beneficios_secundarios", etiqueta: "Beneficios secundarios", tipo: "multi_select" as const, opciones: BENEFICIOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "formato_comercial", etiqueta: "Formato comercial", tipo: "select" as const, opciones: FORMATOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "modo_uso", etiqueta: "Modo de uso", tipo: "select" as const, opciones: MODOS_USO_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "tipo_producto", etiqueta: "Tipo de producto", tipo: "select" as const, opciones: [{ etiqueta: "Hierbas a granel", valor: "hierbas-a-granel" }, { etiqueta: "Inciensos y sahumerios", valor: "inciensos-y-sahumerios" }, { etiqueta: "Herramientas rituales", valor: "herramientas-rituales" }] },
        { clave: "categoria_comercial", etiqueta: "Categoría comercial", tipo: "select" as const, opciones: CATEGORIAS_VISIBLES_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "planta_id", etiqueta: "Planta asociada", tipo: "select" as const, opciones: construirOpcionesPlantas(plantas) },
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
    }),
    [plantas],
  );

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
