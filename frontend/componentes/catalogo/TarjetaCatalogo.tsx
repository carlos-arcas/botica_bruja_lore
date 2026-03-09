import Link from "next/link";

import { ProductoCatalogo } from "@/contenido/catalogo/catalogo";

import estilos from "./catalogo.module.css";

type Props = {
  producto: ProductoCatalogo;
};

export function TarjetaCatalogo({ producto }: Props): JSX.Element {
  return (
    <li className={estilos.tarjeta}>
      <p className={estilos.tarjetaMeta}>{producto.categoria.replace("-", " · ")}</p>
      <h2>{producto.nombre}</h2>
      <p className={estilos.subtitulo}>{producto.subtitulo}</p>
      <p>{producto.descripcion}</p>
      <p className={estilos.notas}>Notas: {producto.notasSensoriales}</p>
      <div className={estilos.pieTarjeta}>
        <strong>{producto.precioVisible}</strong>
        {producto.disponible ? <span>Disponible</span> : <span className={estilos.agotado}>Edición agotada</span>}
      </div>
      <ul className={estilos.etiquetas}>
        {producto.etiquetas.map((etiqueta) => (
          <li key={`${producto.id}-${etiqueta}`}>{etiqueta}</li>
        ))}
      </ul>
      <Link href={`/colecciones/${producto.slug}`} className="boton boton--secundario" aria-label={`Ver ficha de ${producto.nombre}`}>
        Ver ficha
      </Link>
    </li>
  );
}
