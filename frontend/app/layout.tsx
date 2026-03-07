import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Botica de la Bruja Lore",
  description:
    "Portada narrativa de entrada a la línea herbal con descubrimiento guiado por intención.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
