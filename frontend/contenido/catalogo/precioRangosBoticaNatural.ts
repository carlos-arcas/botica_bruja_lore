export type RangoPrecioBotica =
  | "todos"
  | "0-10"
  | "10-20"
  | "20-30"
  | "30-50"
  | "50-80"
  | "80-120"
  | "120+";

export type OpcionRangoPrecioBotica = {
  valor: RangoPrecioBotica;
  etiqueta: string;
  min: string;
  max: string;
};

export const OPCIONES_RANGO_PRECIO_BOTICA: OpcionRangoPrecioBotica[] = [
  { valor: "todos", etiqueta: "Todos", min: "", max: "" },
  { valor: "0-10", etiqueta: "0–10 €", min: "0", max: "10" },
  { valor: "10-20", etiqueta: "10–20 €", min: "10", max: "20" },
  { valor: "20-30", etiqueta: "20–30 €", min: "20", max: "30" },
  { valor: "30-50", etiqueta: "30–50 €", min: "30", max: "50" },
  { valor: "50-80", etiqueta: "50–80 €", min: "50", max: "80" },
  { valor: "80-120", etiqueta: "80–120 €", min: "80", max: "120" },
  { valor: "120+", etiqueta: "120 €+", min: "120", max: "" },
];

export function resolverRangoPrecioBotica(precioMin: string, precioMax: string): RangoPrecioBotica {
  const opcion = OPCIONES_RANGO_PRECIO_BOTICA.find((it) => it.min === precioMin && it.max === precioMax);
  return opcion?.valor ?? "todos";
}

export function mapearRangoAPreciosBotica(rango: RangoPrecioBotica): { precio_min: string; precio_max: string } {
  const opcion = OPCIONES_RANGO_PRECIO_BOTICA.find((it) => it.valor === rango) ?? OPCIONES_RANGO_PRECIO_BOTICA[0];
  return { precio_min: opcion.min, precio_max: opcion.max };
}
