export function actualizarItemsSeccion(
  itemsActuales: Record<string, unknown>[],
  seccionObjetivo: string,
  itemsSeccion: Record<string, unknown>[],
): Record<string, unknown>[] {
  return [...itemsActuales.filter((item) => item.seccion_publica !== seccionObjetivo), ...itemsSeccion];
}

export function sincronizarProductoMutado(
  itemsActuales: Record<string, unknown>[],
  itemMutado: Record<string, unknown>,
): Record<string, unknown>[] {
  const resto = itemsActuales.filter((item) => String(item.id) !== String(itemMutado.id));
  return [...resto, itemMutado];
}
