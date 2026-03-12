import { obtenerSeccionesPrincipalesOrdenadas } from "@/contenido/home/seccionesPrincipales";
import { TarjetaSeccionPrincipal } from "@/componentes/home/TarjetaSeccionPrincipal";

export function RejillaSeccionesPrincipales(): JSX.Element {
  const secciones = obtenerSeccionesPrincipalesOrdenadas();
  const primeraFila = secciones.slice(0, 4);
  const segundaFila = secciones.slice(4);

  return (
    <section className="bloque-home" aria-labelledby="titulo-secciones-principales">
      <h2 id="titulo-secciones-principales" className="sr-only">
        Secciones principales
      </h2>
      <ul className="rejilla-secciones-principales" aria-label="Secciones principales">
        {primeraFila.map((seccion) => (
          <TarjetaSeccionPrincipal key={seccion.id} seccion={seccion} />
        ))}
      </ul>
      <ul className="rejilla-secciones-principales rejilla-secciones-principales--segunda-fila" aria-label="Más secciones principales">
        {segundaFila.map((seccion) => (
          <TarjetaSeccionPrincipal key={seccion.id} seccion={seccion} />
        ))}
      </ul>
    </section>
  );
}
