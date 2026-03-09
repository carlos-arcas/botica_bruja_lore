import type { Metadata } from "next";

import { PaginaLegalComercialBase } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/contenidoLegalComercial";

const PAGINA = obtenerPaginaLegalComercial("/envios-y-preparacion");

export const metadata: Metadata = PAGINA.metadata;

export default function PaginaEnviosYPreparacion(): JSX.Element {
  return <PaginaLegalComercialBase pagina={PAGINA} />;
}
