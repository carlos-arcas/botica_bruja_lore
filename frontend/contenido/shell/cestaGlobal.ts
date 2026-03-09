export type EstadoContadorCesta = {
  total: number;
  etiquetaVisual: string;
  ariaLabel: string;
};

export function construirEstadoContadorCesta(totalUnidades: number): EstadoContadorCesta {
  if (totalUnidades <= 0) {
    return {
      total: 0,
      etiquetaVisual: 'vacía',
      ariaLabel: 'Cesta ritual vacía',
    };
  }

  const sufijo = totalUnidades === 1 ? 'unidad' : 'unidades';

  return {
    total: totalUnidades,
    etiquetaVisual: String(totalUnidades),
    ariaLabel: `${totalUnidades} ${sufijo} en cesta ritual`,
  };
}
