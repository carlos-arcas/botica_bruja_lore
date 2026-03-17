const VALORES_VERDADEROS = new Set(["1", "true", "yes", "on", "si"]);

function normalizarBandera(valor: string | undefined): boolean {
  if (!valor) {
    return false;
  }
  return VALORES_VERDADEROS.has(valor.trim().toLowerCase());
}

export function debugLogViewerHabilitado(): boolean {
  return normalizarBandera(
    process.env.DEBUG_LOG_VIEWER_ENABLED ?? process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED,
  );
}

