import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerConfiguracionContactoPublico } from "@/contenido/catalogo/canalContactoPublico";
import { describirCanalPublico, obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";

const CONTENIDO = obtenerPaginaLegalComercial("/privacidad");

export const metadata: Metadata = CONTENIDO.metadata;

export default function PaginaPrivacidad(): JSX.Element {
  const notaCanal = describirCanalPublico(obtenerConfiguracionContactoPublico());

  return <PaginaLegalComercialVista contenido={CONTENIDO} notaCanal={notaCanal} />;
}
