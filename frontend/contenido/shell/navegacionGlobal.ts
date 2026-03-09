export type EnlaceNavegacionGlobal = {
  etiqueta: string;
  href: string;
};

export const NAVEGACION_GLOBAL: EnlaceNavegacionGlobal[] = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Colecciones', href: '/colecciones' },
  { etiqueta: 'Cesta ritual', href: '/cesta' },
  { etiqueta: 'Encargo', href: '/encargo' },
];

export const ENLACES_FOOTER: EnlaceNavegacionGlobal[] = [
  { etiqueta: 'Inicio editorial', href: '/' },
  { etiqueta: 'Colecciones vivas', href: '/colecciones' },
  { etiqueta: 'Rituales conectados', href: '/rituales' },
  { etiqueta: 'Preparar encargo', href: '/encargo' },
];

export function esRutaActiva(rutaActual: string, href: string): boolean {
  if (href === '/') {
    return rutaActual === '/';
  }

  return rutaActual === href || rutaActual.startsWith(`${href}/`);
}
