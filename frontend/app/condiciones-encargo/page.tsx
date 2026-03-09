import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";

const CONTENIDO = obtenerPaginaLegalComercial("/condiciones-encargo");

export const metadata: Metadata = CONTENIDO.metadata;

export default function PaginaCondicionesEncargo(): JSX.Element {
  return <PaginaLegalComercialVista contenido={CONTENIDO} />;
}
