const CAMPOS_UI_CANONICOS_PRODUCTO = [
  "id",
  "sku",
  "slug",
  "nombre",
  "tipo_producto",
  "categoria_comercial",
  "publicado",
  "planta_id",
  "descripcion_corta",
  "imagen_url",
  "precio_numerico",
  "seccion_publica",
  "orden_publicacion",
  "beneficio_principal",
  "beneficios_secundarios",
  "formato_comercial",
  "modo_uso",
  "__forzar_error_respuesta__",
] as const;

const CAMPOS_CANONICOS_SET = new Set<string>(CAMPOS_UI_CANONICOS_PRODUCTO);

function limpiarValorFormulario(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.filter(Boolean);
  return valor;
}

export function construirPayloadCanonicoProducto(formulario: Record<string, unknown>, seccionSeleccionada: string): Record<string, unknown> {
  const payload = Object.fromEntries(
    Object.entries(formulario)
      .filter(([clave]) => CAMPOS_CANONICOS_SET.has(clave))
      .map(([clave, valor]) => [clave, limpiarValorFormulario(valor)]),
  );

  return {
    ...payload,
    seccion_publica: seccionSeleccionada,
    categoria_comercial: String(payload.categoria_comercial ?? "").trim(),
    orden_publicacion: Number(payload.orden_publicacion ?? 100) || 100,
  };
}

export { CAMPOS_UI_CANONICOS_PRODUCTO };
