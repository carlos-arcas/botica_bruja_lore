import Link from "next/link";

import { RitualPublico } from "@/infraestructura/api/rituales";

type Props = {
  ritual: RitualPublico;
};

function resumenIntencion(ritual: RitualPublico): string {
  if (ritual.intenciones.length === 0) {
    return "Sin intención pública asociada todavía.";
  }

  if (ritual.intenciones.length === 1) {
    return ritual.intenciones[0].nombre;
  }

  return ritual.intenciones.map((item) => item.nombre).join(", ");
}

export function TarjetaRitual({ ritual }: Props): JSX.Element {
  return (
    <li className="tarjeta-ritual">
      <h3>{ritual.nombre}</h3>
      <p>{ritual.contexto_breve}</p>
      <p className="meta-intencion">
        Intención: <strong>{resumenIntencion(ritual)}</strong>
      </p>
      <Link href={ritual.urlDetalle}>Abrir ficha ritual conectada</Link>
    </li>
  );
}
