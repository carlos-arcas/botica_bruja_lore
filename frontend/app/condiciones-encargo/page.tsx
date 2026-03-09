import type { Metadata } from "next";

import { PaginaLegalComercialBase } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/contenidoLegalComercial";

const PAGINA = obtenerPaginaLegalComercial("/condiciones-encargo");

export const metadata: Metadata = PAGINA.metadata;

export default function PaginaCondicionesEncargo(): JSX.Element {
  return <PaginaLegalComercialBase pagina={PAGINA} />;
}
