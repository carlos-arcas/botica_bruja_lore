const CAMPOS_RITUAL_TEXTO = ["nombre", "contexto_breve", "contenido", "imagen_url"] as const;

type RitualCampoTexto = (typeof CAMPOS_RITUAL_TEXTO)[number];

function aTextoSeguro(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

function normalizarIntenciones(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }
  if (typeof valor === "string") {
    return valor.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export function normalizarItemRitual(item: Record<string, unknown>): Record<string, unknown> {
  const base: Record<string, unknown> = { ...item };

  CAMPOS_RITUAL_TEXTO.forEach((campo: RitualCampoTexto) => {
    base[campo] = aTextoSeguro(item[campo]);
  });

  base.publicado = Boolean(item.publicado);
  base.intenciones_relacionadas = normalizarIntenciones(item.intenciones_relacionadas);

  return base;
}

export function normalizarItemsRituales(items: Record<string, unknown>[]): Record<string, unknown>[] {
  return items.map(normalizarItemRitual);
}

export function construirPayloadRitual(formulario: Record<string, unknown>): Record<string, unknown> {
  const payload = normalizarItemRitual(formulario);
  payload.intenciones_relacionadas = normalizarIntenciones(formulario.intenciones_relacionadas);
  return payload;
}
