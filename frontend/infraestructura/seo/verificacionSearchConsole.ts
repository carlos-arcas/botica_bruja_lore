export const VARIABLE_VERIFICACION_GOOGLE = "GOOGLE_SITE_VERIFICATION_TOKEN";

export function resolverTokenVerificacionGoogle(
  entorno: NodeJS.ProcessEnv = process.env,
): string | null {
  const token = (entorno[VARIABLE_VERIFICACION_GOOGLE] ?? "").trim();
  return token.length > 0 ? token : null;
}
