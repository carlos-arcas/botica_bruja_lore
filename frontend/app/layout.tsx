import type { Metadata } from "next";

import { CabeceraComercial } from "@/componentes/shell/CabeceraComercial";
import { FooterComercial } from "@/componentes/shell/FooterComercial";

import "./globals.css";
import estilosShell from "@/componentes/shell/shellComercial.module.css";

export const metadata: Metadata = {
  title: "La Botica de la Bruja Lore | Botica artesanal y ritual",
  description:
    "Home editorial-comercial de La Botica de la Bruja Lore: alquimia del deseo, colecciones por intención y guía ritual accesible.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="es">
      <body>
        <div className={estilosShell.shell}>
          <a href="#contenido-principal" className="skip-link">
            Saltar al contenido principal
          </a>
          <CabeceraComercial />
          <div id="contenido-principal" className={estilosShell.contenido}>
            {children}
          </div>
          <FooterComercial />
        </div>
      </body>
    </html>
  );
}
