import { PlantaPublica } from "@/infraestructura/api/herbal";

import { TarjetaPlantaHerbal } from "./TarjetaPlantaHerbal";

type Props = {
  plantas: PlantaPublica[];
};

export function ListadoHerbal({ plantas }: Props): JSX.Element {
  return (
    <ul className="rejilla-plantas rejilla-plantas--listado">
      {plantas.map((planta) => (
        <TarjetaPlantaHerbal key={planta.slug} planta={planta} />
      ))}
    </ul>
  );
}
