"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { construirEstadoContadorCesta } from '@/contenido/shell/cestaGlobal';
import { NAVEGACION_GLOBAL, esRutaActiva } from '@/contenido/shell/navegacionGlobal';

import estilos from './shellComercial.module.css';
import { useCestaRitual } from '../catalogo/cesta/useCestaRitual';

function resolverClaseActiva(activo: boolean): string {
  return activo ? `${estilos.navLink} ${estilos.navLinkActiva}` : estilos.navLink;
}

export function CabeceraComercialGlobal(): JSX.Element {
  const pathname = usePathname();
  const { totalUnidades } = useCestaRitual();
  const contador = construirEstadoContadorCesta(totalUnidades);

  return (
    <header className={estilos.cabecera}>
      <div className={estilos.cabeceraInner}>
        <Link href="/" className={estilos.marca}>
          <span className={estilos.marcaEtiqueta}>Botica editorial</span>
          <span className={estilos.marcaNombre}>La Botica de la Bruja Lore</span>
        </Link>

        <nav className={estilos.nav} aria-label="Navegación principal">
          {NAVEGACION_GLOBAL.map((enlace) => {
            const activo = esRutaActiva(pathname, enlace.href);

            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={resolverClaseActiva(activo)}
                aria-current={activo ? 'page' : undefined}
              >
                {enlace.etiqueta}
              </Link>
            );
          })}
          <Link href="/cesta" className={estilos.indicadorCesta} aria-label={contador.ariaLabel}>
            <span>Tu cesta</span>
            <span
              className={`${estilos.indicadorConteo} ${contador.total === 0 ? estilos.indicadorConteoVacio : ''}`}
            >
              {contador.etiquetaVisual}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
