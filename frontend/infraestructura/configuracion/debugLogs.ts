const VALORES_VERDADEROS = new Set(["1", "true", "yes", "on", "si"]);

function normalizarBandera(valor: string | undefined): boolean {
  if (!valor) {
    return false;
  }
  return VALORES_VERDADEROS.has(valor.trim().toLowerCase());
}

function resolverValorBandera(): string | undefined {
  const valorServidor = process.env.DEBUG_LOG_VIEWER_ENABLED?.trim();
  if (valorServidor) {
    return valorServidor;
  }

  const valorPublico = process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED?.trim();
  return valorPublico || undefined;
}

export function debugLogViewerHabilitado(): boolean {
  return normalizarBandera(resolverValorBandera());
}
