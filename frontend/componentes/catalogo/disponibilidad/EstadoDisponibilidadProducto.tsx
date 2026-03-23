import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  producto: Pick<ProductoSeccionPublica, "disponible" | "estado_disponibilidad">;
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

  return (
    <div className={`botica-natural__estado-disponibilidad botica-natural__estado-disponibilidad--${claseTono}`}>
      <p><strong>Disponibilidad:</strong> {copy.etiqueta}</p>
      {!compacta && <p>{copy.detalle}</p>}
    </div>
  );
}
