import Link from 'next/link';

import { ENLACES_FOOTER } from '@/contenido/shell/navegacionGlobal';

import estilos from './shellComercial.module.css';

export function PieComercialGlobal(): JSX.Element {
  return (
    <footer className={estilos.footer}>
      <div className={estilos.footerInner}>
        <p>
          Botica editorial de hierbas a granel, rituales y piezas cuidadas para una compra tranquila,
          sensorial y con contexto.
        </p>
        <nav className={estilos.footerNav} aria-label="Navegación de continuidad">
          {ENLACES_FOOTER.map((enlace) => (
            <Link key={enlace.href} href={enlace.href}>
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>
        <p>Proyecto artesanal en demo sólida: guía comercial + narrativa editorial, sin checkout real activo.</p>
        <Link href="/encargo" className={`boton boton--secundario ${estilos.ctaFooter}`}>
          Continuar con un encargo guiado
        </Link>
      </div>
    </footer>
  );
}
