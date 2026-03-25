import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  producto: Pick<
    ProductoSeccionPublica,
    | "disponible"
    | "estado_disponibilidad"
    | "unidad_comercial"
    | "incremento_minimo_venta"
    | "cantidad_minima_compra"
  >;
  compacta?: boolean;
};

const COPYS = {
  disponible: { etiqueta: "Disponible", detalle: "Disponible para compra en este momento." },
  bajo_stock: { etiqueta: "Bajo stock", detalle: "Disponibilidad limitada. El backend confirmará el stock al crear el pedido." },
  no_disponible: { etiqueta: "No disponible", detalle: "Ahora mismo no está disponible para compra." },
} as const;

export function EstadoDisponibilidadProducto({ producto, compacta = false }: Props): JSX.Element {
  const copy = COPYS[producto.estado_disponibilidad] ?? COPYS.no_disponible;
  const claseTono = producto.estado_disponibilidad === "no_disponible" ? "agotado" : producto.estado_disponibilidad === "bajo_stock" ? "aviso" : "ok";
  const unidad = producto.unidad_comercial ?? "ud";
  const incremento = producto.incremento_minimo_venta ?? 1;
  const minimo = producto.cantidad_minima_compra ?? 1;
  const esGranel = unidad !== "ud";

  return (
    <div className={`botica-natural__estado-disponibilidad botica-natural__estado-disponibilidad--${claseTono}`}>
      <p><strong>Disponibilidad:</strong> {copy.etiqueta}</p>
      {!compacta && <p>{copy.detalle}</p>}
      {esGranel && <p><strong>Unidad de venta:</strong> {unidad}</p>}
      {incremento > 1 && <p><strong>Incremento mínimo:</strong> {incremento} {unidad}</p>}
      {!compacta && minimo > 1 && <p><strong>Cantidad mínima:</strong> {minimo} {unidad}</p>}
    </div>
  );
}
