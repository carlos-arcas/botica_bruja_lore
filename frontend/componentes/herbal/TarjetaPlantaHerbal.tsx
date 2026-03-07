import Link from "next/link";

import { PlantaPublica } from "@/infraestructura/api/herbal";

type Props = {
  planta: PlantaPublica;
};

export function TarjetaPlantaHerbal({ planta }: Props): JSX.Element {
  const intencionPrincipal = planta.intenciones[0]?.nombre;

  return (
    <li className="tarjeta-planta-herbal">
      <h2>{planta.nombre}</h2>
      <p>{planta.descripcion_breve}</p>
      <p className="meta-intencion">
        {intencionPrincipal
          ? `Intención principal: ${intencionPrincipal}`
          : "Sin intención pública asociada todavía."}
      </p>
      <Link href={planta.urlDetalle}>Entrar a la ficha herbal</Link>
    </li>
  );
}
