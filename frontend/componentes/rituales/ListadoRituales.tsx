import { RitualPublico } from "@/infraestructura/api/rituales";

import { TarjetaRitual } from "./TarjetaRitual";

type Props = {
  rituales: RitualPublico[];
};

export function ListadoRituales({ rituales }: Props): JSX.Element {
  return (
    <ul className="rejilla-plantas rejilla-plantas--listado">
      {rituales.map((ritual) => (
        <TarjetaRitual key={ritual.slug} ritual={ritual} />
      ))}
    </ul>
  );
}
