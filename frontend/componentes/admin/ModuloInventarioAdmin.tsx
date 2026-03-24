"use client";

import { FormEvent, useMemo, useState } from "react";

import { EstadoListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { PanelEstadoListadoAdmin } from "@/componentes/admin/PanelEstadoListadoAdmin";
import { ajustarInventarioManual, ItemInventario, MovimientoInventario, obtenerDetalleInventario } from "@/infraestructura/api/backoffice";

type Props = {
  token?: string;
  itemsIniciales: ItemInventario[];
  estadoListadoInicial: EstadoListadoAdmin;
};

function formatFecha(valor: string | null | undefined): string {
  if (!valor) return "Sin fecha";
  return new Date(valor).toLocaleString("es-ES", { timeZone: "UTC" });
}

function normalizarCantidad(valor: string): number | null {
  if (!/^-?\d+$/.test(valor.trim())) return null;
  return Number(valor);
}

export function ModuloInventarioAdmin({ token, itemsIniciales, estadoListadoInicial }: Props): JSX.Element {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [delta, setDelta] = useState("0");
  const [items, setItems] = useState<ItemInventario[]>(itemsIniciales);
  const [ledger, setLedger] = useState<MovimientoInventario[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");

  const filtrados = useMemo(
    () => items.filter((item) => item.producto_nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [items, busqueda],
  );

  async function abrirDetalle(idProducto: string): Promise<void> {
    setSeleccionado(idProducto);
    setFeedback("");
    setError("");
    try {
      const respuesta = await obtenerDetalleInventario(idProducto, token);
      setLedger(respuesta.movimientos);
      setItems((actuales) => actuales.map((item) => (item.id_producto === idProducto ? respuesta.item : item)));
    } catch (detalle) {
      setLedger([]);
      setError(detalle instanceof Error ? detalle.message : "No se pudo abrir el detalle de inventario.");
    }
  }

  async function onSubmitAjuste(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!seleccionado) return;
    const deltaNormalizado = normalizarCantidad(delta);
    if (deltaNormalizado === null) {
      setError("El ajuste debe ser un número entero.");
      return;
    }
    setFeedback("");
    setError("");
    try {
      const respuesta = await ajustarInventarioManual(seleccionado, deltaNormalizado, token);
      setItems((actuales) => actuales.map((item) => (item.id_producto === seleccionado ? respuesta.item : item)));
      setLedger(respuesta.movimientos);
      setFeedback("Ajuste manual aplicado y ledger actualizado.");
      setDelta("0");
    } catch (detalle) {
      setError(detalle instanceof Error ? detalle.message : "No se pudo aplicar el ajuste manual.");
    }
  }

  const itemSeleccionado = items.find((item) => item.id_producto === seleccionado) ?? null;

  return (
    <section className="admin-bloque">
      <h2>Inventario operativo</h2>
      <p>Superficie principal para revisar stock real y aplicar ajustes manuales con trazabilidad.</p>
      <label className="admin-field">
        Buscar producto
        <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Ej: Melisa" />
      </label>

      <PanelEstadoListadoAdmin estado={estadoListadoInicial} />

      <div className="admin-tabla-wrap">
        <table className="admin-tabla" aria-label="Listado de inventario">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidad base</th>
              <th>Stock actual</th>
              <th>Umbral</th>
              <th>Estado</th>
              <th>Actualización</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item) => (
              <tr key={item.id_producto}>
                <td>{item.producto_nombre}</td>
                <td>{item.unidad_base}</td>
                <td>{item.cantidad_disponible}</td>
                <td>{item.umbral_bajo_stock ?? "—"}</td>
                <td>{item.bajo_stock ? "Bajo stock" : "Disponible"}</td>
                <td>{formatFecha(item.fecha_actualizacion)}</td>
                <td>
                  <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void abrirDetalle(item.id_producto)}>
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {itemSeleccionado ? (
        <section className="admin-bloque" aria-label="Detalle inventario">
          <h3>Detalle · {itemSeleccionado.producto_nombre}</h3>
          <p>
            Unidad base: <strong>{itemSeleccionado.unidad_base}</strong> · Stock actual: <strong>{itemSeleccionado.cantidad_disponible}</strong>
          </p>
          <form className="admin-form" onSubmit={(event) => void onSubmitAjuste(event)}>
            <label className="admin-field">
              Ajuste manual (entero)
              <input value={delta} onChange={(event) => setDelta(event.target.value)} inputMode="numeric" />
            </label>
            <button type="submit" className="admin-boton admin-boton--primario">
              Aplicar ajuste
            </button>
          </form>
          {feedback ? <p className="admin-estado">{feedback}</p> : null}
          {error ? (
            <p className="admin-estado admin-estado--error" role="alert">
              {error}
            </p>
          ) : null}

          <h4>Últimos movimientos (ledger mínimo)</h4>
          <ul>
            {ledger.map((movimiento, indice) => (
              <li key={`${movimiento.tipo_movimiento}-${movimiento.fecha_creacion ?? indice}`}>
                {movimiento.tipo_movimiento} · {movimiento.cantidad} {movimiento.unidad_base} · {formatFecha(movimiento.fecha_creacion)}
              </li>
            ))}
            {ledger.length === 0 ? <li>Sin movimientos todavía.</li> : null}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
