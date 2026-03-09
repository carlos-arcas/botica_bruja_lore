import type { Metadata } from "next";

import { PaginaLegalComercialBase } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/contenidoLegalComercial";

const PAGINA = obtenerPaginaLegalComercial("/privacidad");

export const metadata: Metadata = PAGINA.metadata;

export default function PaginaPrivacidad(): JSX.Element {
  return <PaginaLegalComercialBase pagina={PAGINA} />;
}
