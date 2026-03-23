import Link from "next/link";

import { DireccionCuentaCliente } from "@/infraestructura/api/cuentasCliente";
import { DatosCheckoutReal } from "@/contenido/catalogo/checkoutReal";

import estilos from "./flujoCheckoutReal.module.css";

type Props = {
  direcciones: DireccionCuentaCliente[];
  datos: DatosCheckoutReal;
  errores: Record<string, string>;
  onCambiarModo: (modo: DatosCheckoutReal["modo_direccion"]) => void;
  onSeleccionarDireccion: (idDireccion: string) => void;
};

export function SelectorDireccionCheckoutReal({
  direcciones,
  datos,
  errores,
  onCambiarModo,
  onSeleccionarDireccion,
}: Props): JSX.Element {
  if (direcciones.length === 0) {
    return (
      <div className={estilos.bloqueDireccionesGuardadas}>
        <p className={estilos.resumenProducto}>
          Tu cuenta no tiene direcciones guardadas todavía. Puedes seguir con dirección manual o completar tu libreta antes de pagar.
        </p>
        <Link className="boton boton--secundario" href="/mi-cuenta/direcciones">
          Gestionar libreta de direcciones
        </Link>
      </div>
    );
  }

  return (
    <div className={estilos.bloqueDireccionesGuardadas}>
      <p className={estilos.resumenProducto}>
        Usa una dirección de tu libreta para acelerar el checkout o cambia a modo manual si necesitas otra entrega puntual.
      </p>
      <div className={estilos.modosDireccion}>
        <label>
          <input
            type="radio"
            checked={datos.modo_direccion === "guardada"}
            onChange={() => onCambiarModo("guardada")}
          />
          Usar dirección guardada
        </label>
        <label>
          <input
            type="radio"
            checked={datos.modo_direccion === "manual"}
            onChange={() => onCambiarModo("manual")}
          />
          Introducir dirección manual
        </label>
      </div>
      {datos.modo_direccion === "guardada" && (
        <div className={estilos.listaDireccionesGuardadas}>
          {direcciones.map((direccion) => (
            <label key={direccion.id_direccion} className={estilos.tarjetaDireccionGuardada}>
              <input
                type="radio"
                name="id_direccion_guardada"
                checked={datos.id_direccion_guardada === direccion.id_direccion}
                onChange={() => onSeleccionarDireccion(direccion.id_direccion)}
              />
              <span>
                <strong>{direccion.alias || direccion.nombre_destinatario}</strong>
                {direccion.predeterminada && <em> · Predeterminada</em>}
              </span>
              <span>{direccion.nombre_destinatario}</span>
              <span>{direccion.linea_1}</span>
              {direccion.linea_2 && <span>{direccion.linea_2}</span>}
              <span>
                {direccion.codigo_postal} {direccion.ciudad} · {direccion.provincia}
              </span>
              <span>{direccion.pais_iso}</span>
            </label>
          ))}
          {errores.id_direccion_guardada && <p className={estilos.error}>{errores.id_direccion_guardada}</p>}
        </div>
      )}
    </div>
  );
}
