import Link from "next/link";

import { RitualDetallePublico } from "@/infraestructura/api/rituales";

type Props = {
  ritual: RitualDetallePublico;
};

function resumenIntencion(ritual: RitualDetallePublico): string {
  if (ritual.intenciones.length === 0) {
    return "Sin intención pública asociada todavía.";
  }

  return ritual.intenciones.map((item) => item.nombre).join(", ");
}

export function CabeceraFichaRitual({ ritual }: Props): JSX.Element {
  return (
    <section className="bloque-home ficha-ritual__cabecera">
      <p className="hero-portada__eyebrow">Ficha ritual conectada</p>
      <h1>{ritual.nombre}</h1>
      <p>{ritual.contexto_breve}</p>
      <p className="meta-intencion">
        Intención: <strong>{resumenIntencion(ritual)}</strong>
      </p>
      <div className="hero-portada__acciones">
        <Link href="/rituales" className="boton boton--secundario">
          Volver al listado ritual
        </Link>
        <Link href="/hierbas" className="boton boton--secundario">
          Entrar por línea herbal
        </Link>
      </div>
    </section>
  );
}
