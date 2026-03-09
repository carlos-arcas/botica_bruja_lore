import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";

const CONTENIDO = obtenerPaginaLegalComercial("/envios-y-preparacion");

export const metadata: Metadata = CONTENIDO.metadata;

export default function PaginaEnviosPreparacion(): JSX.Element {
  return <PaginaLegalComercialVista contenido={CONTENIDO} />;
}
