import type { Metadata } from "next";

import { PaginaMarcaBotica } from "@/componentes/marca/PaginaMarcaBotica";

export const metadata: Metadata = {
  title: "La Botica | Filosofía artesanal y selección editorial",
  description:
    "Conoce cómo trabaja La Botica de la Bruja Lore: manifiesto, criterios de curaduría, principios de la casa y camino directo a colecciones o encargo.",
};

export default function PaginaLaBotica(): JSX.Element {
  return <PaginaMarcaBotica />;
}
