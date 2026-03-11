import {
  type GuiaEditorial,
  type HubEditorialRelacionado,
  type TemaGuiaEditorial,
  obtenerGuiasPublicadasIndexables,
  obtenerHubEditorialDesdeRuta,
} from "./guiasEditoriales";

export type FiltroTemaGuias = TemaGuiaEditorial | "todas";
export type FiltroHubGuias = HubEditorialRelacionado | "todos";

export type OpcionFiltroGuias<T extends string> = {
  valor: T;
  etiqueta: string;
  cantidad: number;
};

export type EstadoIndiceGuias = {
  filtroTemaActivo: FiltroTemaGuias;
  filtroHubActivo: FiltroHubGuias;
  resultados: GuiaEditorial[];
  totalPublicadas: number;
};

const ETIQUETAS_TEMA: Record<FiltroTemaGuias, string> = {
  todas: "Todas las guías",
  hierbas: "Hierbas",
  rituales: "Rituales",
  colecciones: "Colecciones",
};

const ETIQUETAS_HUB: Record<FiltroHubGuias, string> = {
  todos: "Todos los hubs",
  hierbas: "Hub Hierbas",
  rituales: "Hub Rituales",
  colecciones: "Hub Colecciones",
  "la-botica": "La Botica",
};

export function resolverEstadoIndiceGuias(searchParams: Record<string, string | string[] | undefined>): EstadoIndiceGuias {
  const filtroTemaActivo = parsearFiltroTema(searchParams.tema);
  const filtroHubActivo = parsearFiltroHub(searchParams.hub);
  const publicadas = obtenerGuiasPublicadasIndexables();
  const resultados = filtrarGuias(publicadas, { tema: filtroTemaActivo, hub: filtroHubActivo });

  return {
    filtroTemaActivo,
    filtroHubActivo,
    resultados,
    totalPublicadas: publicadas.length,
  };
}

export function obtenerOpcionesFiltroTema(): OpcionFiltroGuias<FiltroTemaGuias>[] {
  const guias = obtenerGuiasPublicadasIndexables();

  return [
    { valor: "todas", etiqueta: ETIQUETAS_TEMA.todas, cantidad: guias.length },
    ...contarPorTema(guias).map(([tema, cantidad]) => ({
      valor: tema,
      etiqueta: ETIQUETAS_TEMA[tema],
      cantidad,
    })),
  ];
}

export function obtenerOpcionesFiltroHub(): OpcionFiltroGuias<FiltroHubGuias>[] {
  const guias = obtenerGuiasPublicadasIndexables();
  const conteo = contarPorHubRelacionado(guias);

  return [
    { valor: "todos", etiqueta: ETIQUETAS_HUB.todos, cantidad: guias.length },
    ...Array.from(conteo.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hub, cantidad]) => ({
        valor: hub,
        etiqueta: ETIQUETAS_HUB[hub],
        cantidad,
      })),
  ];
}

function filtrarGuias(guias: GuiaEditorial[], filtros: { tema: FiltroTemaGuias; hub: FiltroHubGuias }): GuiaEditorial[] {
  return guias.filter((guia) => {
    if (filtros.tema !== "todas" && guia.tema !== filtros.tema) {
      return false;
    }

    if (filtros.hub === "todos") {
      return true;
    }

    return guia.relaciones.hubs_relacionados.some((enlace) => obtenerHubEditorialDesdeRuta(enlace.href) === filtros.hub);
  });
}

function parsearFiltroTema(raw: string | string[] | undefined): FiltroTemaGuias {
  const valor = normalizarValor(raw);
  return valor === "hierbas" || valor === "rituales" || valor === "colecciones" ? valor : "todas";
}

function parsearFiltroHub(raw: string | string[] | undefined): FiltroHubGuias {
  const valor = normalizarValor(raw);
  return valor === "hierbas" || valor === "rituales" || valor === "colecciones" || valor === "la-botica"
    ? valor
    : "todos";
}

function normalizarValor(raw: string | string[] | undefined): string {
  return typeof raw === "string" ? raw.toLowerCase() : "";
}

function contarPorTema(guias: GuiaEditorial[]): Array<[TemaGuiaEditorial, number]> {
  const conteo = new Map<TemaGuiaEditorial, number>();

  for (const guia of guias) {
    conteo.set(guia.tema, (conteo.get(guia.tema) ?? 0) + 1);
  }

  return Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);
}

function contarPorHubRelacionado(guias: GuiaEditorial[]): Map<HubEditorialRelacionado, number> {
  const conteo = new Map<HubEditorialRelacionado, number>();

  for (const guia of guias) {
    const hubs = new Set<HubEditorialRelacionado>();

    for (const enlace of guia.relaciones.hubs_relacionados) {
      const hub = obtenerHubEditorialDesdeRuta(enlace.href);
      if (hub) {
        hubs.add(hub);
      }
    }

    hubs.forEach((hub) => conteo.set(hub, (conteo.get(hub) ?? 0) + 1));
  }

  return conteo;
}
