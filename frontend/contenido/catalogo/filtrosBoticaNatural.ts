import { mapearRangoAPreciosBotica, type RangoPrecioBotica } from "./precioRangosBoticaNatural";

type ParametroEntrada = string | string[] | undefined;

type FiltroPlano = {
  beneficio: string;
  formato: string;
  modo_uso: string;
};

export type FiltrosBotica = FiltroPlano & {
  precio_rango: RangoPrecioBotica;
  precio_min: string;
  precio_max: string;
};

const VALOR_TODOS = "todos";

export function resolverFiltrosBoticaDesdeSearchParams(params: Record<string, ParametroEntrada>): FiltrosBotica {
  const precioRango = normalizarRangoPrecioBotica(obtenerTextoParametro(params.precio_rango));
  const precios = resolverPreciosBotica(precioRango, params);

  return {
    beneficio: normalizarValorFiltro(obtenerTextoParametro(params.beneficio)),
    formato: normalizarValorFiltro(obtenerTextoParametro(params.formato)),
    modo_uso: normalizarValorFiltro(obtenerTextoParametro(params.modo_uso)),
    precio_rango: precioRango,
    ...precios,
  };
}

export function construirQueryFiltrosBotica(filtros: FiltrosBotica): URLSearchParams {
  const query = new URLSearchParams();
  asignarSiTieneValor(query, "beneficio", filtros.beneficio);
  asignarSiTieneValor(query, "formato", filtros.formato);
  asignarSiTieneValor(query, "modo_uso", filtros.modo_uso);

  if (filtros.precio_rango !== VALOR_TODOS) {
    asignarSiTieneValor(query, "precio_rango", filtros.precio_rango);
    asignarSiTieneValor(query, "precio_min", filtros.precio_min);
    asignarSiTieneValor(query, "precio_max", filtros.precio_max);
  }

  return query;
}

export function contarFiltroActivo(valor: string): number {
  return normalizarValorFiltro(valor) ? 1 : 0;
}

function resolverPreciosBotica(
  precioRango: RangoPrecioBotica,
  params: Record<string, ParametroEntrada>,
): { precio_min: string; precio_max: string } {
  if (precioRango !== VALOR_TODOS) {
    return mapearRangoAPreciosBotica(precioRango);
  }

  return {
    precio_min: normalizarValorFiltro(obtenerTextoParametro(params.precio_min)),
    precio_max: normalizarValorFiltro(obtenerTextoParametro(params.precio_max)),
  };
}

function asignarSiTieneValor(query: URLSearchParams, clave: string, valor: string): void {
  if (!valor) return;
  query.set(clave, valor);
}

function obtenerTextoParametro(valor: ParametroEntrada): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return String(valor ?? "");
}

function normalizarRangoPrecioBotica(valor: string): RangoPrecioBotica {
  return valor && valor !== VALOR_TODOS ? (valor as RangoPrecioBotica) : VALOR_TODOS;
}

function normalizarValorFiltro(valor: string): string {
  return valor === VALOR_TODOS ? "" : valor;
}
