function detectarEntornoEstricto(env) {
  return (
    env.NODE_ENV === "production" ||
    env.CI === "true" ||
    Boolean(env.RAILWAY_PUBLIC_DOMAIN) ||
    Boolean(env.RAILWAY_ENVIRONMENT_ID)
  );
}

function esHostLocal(hostname) {
  const normalizado = hostname.toLowerCase();
  return normalizado === "localhost" || normalizado === "127.0.0.1" || normalizado === "0.0.0.0";
}

function resolverApiBaseUrl(env) {
  const esEntornoEstricto = detectarEntornoEstricto(env);
  const valorConfigurado = env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!valorConfigurado) {
    if (!esEntornoEstricto) {
      return "http://127.0.0.1:8000";
    }
    throw new Error(
      "[config] NEXT_PUBLIC_API_BASE_URL es obligatoria en producción/CI/Railway. No se permite fallback local.",
    );
  }

  let url;
  try {
    url = new URL(valorConfigurado);
  } catch {
    throw new Error(
      "[config] NEXT_PUBLIC_API_BASE_URL inválida: debe ser una URL absoluta (ej: https://api.midominio.com).",
    );
  }

  if (esEntornoEstricto && url.protocol !== "https:") {
    throw new Error("[config] NEXT_PUBLIC_API_BASE_URL debe usar https en producción/CI/Railway.");
  }

  if (esEntornoEstricto && esHostLocal(url.hostname)) {
    throw new Error(
      "[config] NEXT_PUBLIC_API_BASE_URL no puede apuntar a localhost/127.0.0.1/0.0.0.0 en producción/CI/Railway.",
    );
  }

  return url.toString().replace(/\/$/, "");
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. esperado=${expected}, actual=${actual}`);
  }
}

function assertThrows(callback, expectedText, message) {
  try {
    callback();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    if (detail.includes(expectedText)) {
      return;
    }
    throw new Error(`${message}. error inesperado=${detail}`);
  }
  throw new Error(`${message}. se esperaba excepción.`);
}

assertEqual(resolverApiBaseUrl({ NODE_ENV: "development" }), "http://127.0.0.1:8000", "fallback local inválido");
assertThrows(
  () => resolverApiBaseUrl({ NODE_ENV: "production", CI: "true" }),
  "NEXT_PUBLIC_API_BASE_URL es obligatoria",
  "faltó error por variable ausente",
);
assertThrows(
  () =>
    resolverApiBaseUrl({
      NODE_ENV: "production",
      CI: "true",
      NEXT_PUBLIC_API_BASE_URL: "https://localhost:8000",
    }),
  "localhost/127.0.0.1/0.0.0.0",
  "faltó error por host local",
);
assertEqual(
  resolverApiBaseUrl({
    NODE_ENV: "production",
    CI: "true",
    NEXT_PUBLIC_API_BASE_URL: "https://api.botica.test/",
  }),
  "https://api.botica.test",
  "url https válida no aceptada",
);

console.log("OK contrato NEXT_PUBLIC_API_BASE_URL: casos dev/prod cubiertos.");
