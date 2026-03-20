import { EstadoListadoAdmin } from "./estadoListadoAdmin";

export function PanelEstadoListadoAdmin({ estado }: { estado: EstadoListadoAdmin }): JSX.Element | null {
  if (estado.tipo === "datos") return null;

  const esError = estado.tipo === "denegado" || estado.tipo === "error";
  const clase = esError ? "admin-estado admin-estado--error" : "admin-estado";
  const rol = esError ? "alert" : "status";

  return (
    <div className={clase} role={rol}>
      <p>{estado.mensaje}</p>
      {"detalle" in estado ? <p>{estado.detalle}</p> : null}
    </div>
  );
}
