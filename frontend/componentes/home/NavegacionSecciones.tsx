import { ENLACES_SECCIONES } from "@/contenido/home/contenidoHome";

export function NavegacionSecciones(): JSX.Element {
  return (
    <nav className="bloque-home navegacion-secciones" aria-label="Accesos rápidos de la home">
      <ul>
        {ENLACES_SECCIONES.map((enlace) => (
          <li key={enlace.id}>
            <a href={`#${enlace.id}`}>{enlace.etiqueta}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
