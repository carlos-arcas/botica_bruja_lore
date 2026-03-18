const CAMPOS_BOTICA_OBLIGATORIOS: Array<{ clave: string; etiqueta: string }> = [
  { clave: "tipo_producto", etiqueta: "tipo de producto" },
  { clave: "categoria_comercial", etiqueta: "categoría comercial" },
  { clave: "beneficio_principal", etiqueta: "beneficio principal" },
  { clave: "formato_comercial", etiqueta: "formato comercial" },
  { clave: "modo_uso", etiqueta: "modo de uso" },
];

function texto(valor: unknown): string {
  return String(valor ?? "").trim();
}

function precioValido(valor: unknown): boolean {
  const numero = Number.parseFloat(texto(valor).replace(",", "."));
  return Number.isFinite(numero) && numero >= 0;
}

export function validarFormularioProducto(formulario: Record<string, unknown>): string | null {
  if (!texto(formulario.nombre)) return "El producto requiere nombre.";
  if (!texto(formulario.seccion_publica)) return "Debes seleccionar la sección pública del producto.";
  if (!texto(formulario.precio_numerico) || !precioValido(formulario.precio_numerico)) {
    return "El precio debe ser numérico y válido.";
  }

  if (texto(formulario.seccion_publica) !== "botica-natural") return null;

  const faltante = CAMPOS_BOTICA_OBLIGATORIOS.find((campo) => !texto(formulario[campo.clave]));
  if (faltante) return `Falta completar ${faltante.etiqueta} para Botica Natural.`;

  if (texto(formulario.tipo_producto) === "hierbas-a-granel" && !texto(formulario.planta_id)) {
    return "Las hierbas a granel requieren planta asociada.";
  }
  return null;
}
