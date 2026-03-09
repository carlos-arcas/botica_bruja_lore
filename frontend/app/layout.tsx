import type { Metadata } from "next";

import { ShellComercialGlobal } from "@/componentes/shell/ShellComercialGlobal";

import "./globals.css";

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
        <ShellComercialGlobal>{children}</ShellComercialGlobal>
      </body>
    </html>
  );
}
