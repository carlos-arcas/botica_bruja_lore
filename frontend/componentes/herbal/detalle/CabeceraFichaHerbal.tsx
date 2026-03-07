import Link from "next/link";

import { PlantaPublica } from "@/infraestructura/api/herbal";

type Props = {
  planta: PlantaPublica;
};

export function CabeceraFichaHerbal({ planta }: Props): JSX.Element {
  return (
    <section className="bloque-home ficha-herbal__cabecera">
      <p className="hero-portada__eyebrow">Ficha herbal conectada</p>
      <h1>{planta.nombre}</h1>
      <p>{planta.descripcion_breve}</p>
      <Link href="/hierbas" className="boton boton--secundario">
        Volver al listado herbal
      </Link>
    </section>
  );
}
