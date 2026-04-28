import { PedidoDemoHistorial } from "@/infraestructura/api/cuentasDemo";

import estilos from "./areaCuentaDemo.module.css";

type PedidoRecienteUI = {
  idPedido: string;
  disponibleEnHistorial: boolean;
};

type Props = {
  historial: PedidoDemoHistorial[];
  pedidoReciente: PedidoRecienteUI | null;
};

export function HistorialPedidosDemo({ historial, pedidoReciente }: Props): JSX.Element {
  return (
    <>
      {pedidoReciente && <MensajePedidoReciente pedidoReciente={pedidoReciente} />}
      {historial.length === 0 ? (
        <p className={estilos.estado}>Aún no hay pedidos asociados a tu cuenta.</p>
      ) : (
        <ul className={estilos.historial}>
          {historial.map((pedido) => (
            <ItemHistorialPedido
              key={pedido.id_pedido}
              pedido={pedido}
              esPedidoReciente={pedido.id_pedido === pedidoReciente?.idPedido}
            />
          ))}
        </ul>
      )}
    </>
  );
}

type MensajePedidoRecienteProps = {
  pedidoReciente: PedidoRecienteUI;
};

function MensajePedidoReciente({ pedidoReciente }: MensajePedidoRecienteProps): JSX.Element {
  const texto = pedidoReciente.disponibleEnHistorial
    ? `Tu último pedido ${pedidoReciente.idPedido} ya aparece resaltado en el historial.`
    : `Tu último pedido ${pedidoReciente.idPedido} aún no aparece en este historial, pero tu cuenta sigue conectada.`;

  return <p className={estilos.exito}>{texto}</p>;
}

type ItemHistorialPedidoProps = {
  pedido: PedidoDemoHistorial;
  esPedidoReciente: boolean;
};

function ItemHistorialPedido({ pedido, esPedidoReciente }: ItemHistorialPedidoProps): JSX.Element {
  const clase = esPedidoReciente ? `${estilos.itemHistorial} ${estilos.itemHistorialReciente}` : estilos.itemHistorial;

  return (
    <li className={clase}>
      <strong>{pedido.id_pedido}</strong>
      {esPedidoReciente && <span className={estilos.insigniaReciente}>Último pedido creado</span>}
      <span>{pedido.estado} · {pedido.resumen.cantidad_total_items} items · subtotal orientativo {pedido.resumen.subtotal_demo}</span>
    </li>
  );
}
