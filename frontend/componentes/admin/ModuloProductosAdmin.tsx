"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

type EstadoCargaPlantas =
  | { estado: "cargando"; mensaje: string }
  | { estado: "ok"; mensaje: string }
  | { estado: "error"; mensaje: string };

function construirOpcionesPlantas(plantas: PlantaAsociable[]): { etiqueta: string; valor: string }[] {
  return plantas.map((planta) => ({ etiqueta: planta.nombre, valor: planta.id }));
}

function resolverAyudaPlantas(estado: EstadoCargaPlantas, plantas: PlantaAsociable[]): string {
  if (estado.estado === "cargando") return estado.mensaje;
  if (estado.estado === "error") return estado.mensaje;
  if (plantas.length === 0) return "Carga completada, pero todavía no hay plantas asociables publicadas para vincular.";
  return "Selecciona la planta editorial que se vinculará con este producto herbal.";
}

function construirValidadorProducto(estadoPlantas: EstadoCargaPlantas) {
  return (formulario: Record<string, unknown>) => validarFormularioProducto(formulario, estadoPlantas.estado);
}

export function ModuloProductosAdmin({ token, itemsIniciales }: { token?: string; itemsIniciales: Record<string, unknown>[] }): JSX.Element {
  const [seccion, setSeccion] = useState<string>(SECCIONES[0].slug);
  const [plantas, setPlantas] = useState<PlantaAsociable[]>([]);
  const [estadoPlantas, setEstadoPlantas] = useState<EstadoCargaPlantas>({ estado: "cargando", mensaje: "Cargando plantas asociables..." });
  const filtrados = useMemo(() => itemsIniciales.filter((item) => item.seccion_publica === seccion), [itemsIniciales, seccion]);

  const cargarPlantas = useCallback(() => {
    let cancelado = false;
    setEstadoPlantas({ estado: "cargando", mensaje: "Cargando plantas asociables..." });

    void obtenerPlantasAsociables(token)
      .then((items) => {
        if (cancelado) return;
        setPlantas(items);
        setEstadoPlantas({ estado: "ok", mensaje: "Plantas asociables cargadas." });
      })
      .catch((error) => {
        if (cancelado) return;
        setPlantas([]);
        setEstadoPlantas({ estado: "error", mensaje: error instanceof Error && error.message ? error.message : "No se pudieron cargar las plantas asociables." });
      });

    return () => {
      cancelado = true;
    };
  }, [token]);

  useEffect(() => cargarPlantas(), [cargarPlantas]);

  const validadorProducto = useMemo(() => construirValidadorProducto(estadoPlantas), [estadoPlantas]);

  const camposPorSeccion = useMemo<Record<string, { clave: string; etiqueta: string; tipo?: "select" | "multi_select"; opciones?: { etiqueta: string; valor: string }[]; ayuda?: string }[]>>(
    () => ({
      "botica-natural": [
        { clave: "beneficio_principal", etiqueta: "Beneficio", tipo: "select" as const, opciones: BENEFICIOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "beneficios_secundarios", etiqueta: "Beneficios secundarios", tipo: "multi_select" as const, opciones: BENEFICIOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "formato_comercial", etiqueta: "Formato comercial", tipo: "select" as const, opciones: FORMATOS_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "modo_uso", etiqueta: "Modo de uso", tipo: "select" as const, opciones: MODOS_USO_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "tipo_producto", etiqueta: "Tipo de producto", tipo: "select" as const, opciones: [{ etiqueta: "Hierbas a granel", valor: "hierbas-a-granel" }, { etiqueta: "Inciensos y sahumerios", valor: "inciensos-y-sahumerios" }, { etiqueta: "Herramientas rituales", valor: "herramientas-rituales" }] },
        { clave: "categoria_comercial", etiqueta: "Categoría comercial", tipo: "select" as const, opciones: CATEGORIAS_VISIBLES_BOTICA.map((it) => ({ etiqueta: it.etiqueta, valor: it.valor })) },
        { clave: "planta_id", etiqueta: "Planta asociada", tipo: "select" as const, opciones: construirOpcionesPlantas(plantas), ayuda: resolverAyudaPlantas(estadoPlantas, plantas) },
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
    [estadoPlantas, plantas],
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
        {estadoPlantas.estado === "cargando" ? <p className="admin-estado">Cargando plantas asociables para el selector de hierbas a granel...</p> : null}
        {estadoPlantas.estado === "ok" && plantas.length === 0 ? <p className="admin-estado">No hay plantas asociables disponibles todavía. Puedes seguir editando otros campos mientras se publica el catálogo editorial.</p> : null}
        {estadoPlantas.estado === "error" ? (
          <div className="admin-estado admin-estado--error" role="alert">
            <p>No se pudieron cargar las plantas asociables. Reintenta la carga antes de guardar o publicar una hierba a granel.</p>
            <p>{estadoPlantas.mensaje}</p>
            <button type="button" className="admin-boton admin-boton--secundario" onClick={cargarPlantas}>
              Reintentar carga de plantas
            </button>
          </div>
        ) : null}
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
        validarFormulario={validadorProducto}
      />
    </>
  );
}
