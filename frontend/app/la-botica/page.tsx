import type { Metadata } from "next";

import { PaginaEditorialBotica } from "@/componentes/marca/PaginaEditorialBotica";

export const metadata: Metadata = {
  title: "La Botica | Filosofía artesanal y criterio editorial",
  description:
    "Conoce cómo La Botica de la Bruja Lore selecciona colecciones y rituales: manifiesto, principios de la casa y ruta directa a catálogo y encargo.",
};

export default function PaginaLaBotica(): JSX.Element {
  return <PaginaEditorialBotica />;
}
