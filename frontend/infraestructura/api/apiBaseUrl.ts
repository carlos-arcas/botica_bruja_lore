const FALLBACK_LOCAL_API_BASE_URL = "http://127.0.0.1:8000";

function detectarEntornoEstricto(env: NodeJS.ProcessEnv): boolean {
  return (
    env.NODE_ENV === "production" ||
    env.CI === "true" ||
    Boolean(env.RAILWAY_PUBLIC_DOMAIN) ||
    Boolean(env.RAILWAY_ENVIRONMENT_ID)
  );
}

function esHostLocal(hostname: string): boolean {
  const normalizado = hostname.toLowerCase();
  return normalizado === "localhost" || normalizado === "127.0.0.1" || normalizado === "0.0.0.0";
}

function parsearApiBaseUrl(valor: string): URL {
  try {
    return new URL(valor);
  } catch {
    throw new Error(
      "[config] NEXT_PUBLIC_API_BASE_URL inválida: debe ser una URL absoluta (ej: https://api.midominio.com).",
    );
  }
}

function validarApiBaseUrl(url: URL, esEntornoEstricto: boolean): void {
  if (esEntornoEstricto && url.protocol !== "https:") {
    throw new Error("[config] NEXT_PUBLIC_API_BASE_URL debe usar https en producción/CI/Railway.");
  }

  if (esEntornoEstricto && esHostLocal(url.hostname)) {
    throw new Error(
      "[config] NEXT_PUBLIC_API_BASE_URL no puede apuntar a localhost/127.0.0.1/0.0.0.0 en producción/CI/Railway.",
    );
  }
}

export function resolverApiBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const esEntornoEstricto = detectarEntornoEstricto(env);
  const valorConfigurado = env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!valorConfigurado) {
    if (!esEntornoEstricto) {
      return FALLBACK_LOCAL_API_BASE_URL;
    }

    throw new Error(
      "[config] NEXT_PUBLIC_API_BASE_URL es obligatoria en producción/CI/Railway. No se permite fallback local.",
    );
  }

  const url = parsearApiBaseUrl(valorConfigurado);
  validarApiBaseUrl(url, esEntornoEstricto);

  return url.toString().replace(/\/$/, "");
}
