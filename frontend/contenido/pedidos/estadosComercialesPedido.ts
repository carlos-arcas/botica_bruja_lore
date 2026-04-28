type ErrorPedidoPublico = {
  codigo?: string;
  detalle?: unknown;
  mensaje?: unknown;
};

type LineaStockPublica = {
  codigo?: string;
  nombre_producto?: string;
  cantidad_disponible?: number;
};

type EstadoPedidoNoCargado = {
  titulo: string;
  descripcion: string;
  ctaPrincipal: { href: string; texto: string };
  ctaSecundaria: { href: string; texto: string };
};

const MENSAJE_GENERICO = "No pudimos completar la operacion. Intentalo de nuevo o revisa tu cesta.";

const MENSAJES_PEDIDO_POR_CODIGO: Record<string, string> = {
  stock_no_disponible: "No hay stock suficiente para continuar con este pedido.",
  pedido_no_encontrado: "No encontramos este pedido. Revisa el enlace o vuelve a tu cuenta.",
  pago_simulado_no_disponible: "No pudimos preparar el pago de prueba en este momento.",
  pago_simulado_invalido: "No pudimos confirmar el pago de prueba en este momento.",
};

const MENSAJES_LINEA_STOCK: Record<string, string> = {
  stock_insuficiente: "La cantidad solicitada supera la disponibilidad actual.",
  producto_sin_inventario: "Este producto no tiene disponibilidad configurada ahora mismo.",
  unidad_incompatible: "La unidad de venta no coincide con el inventario disponible.",
  sin_stock: "Este producto no tiene unidades disponibles ahora mismo.",
};

export function traducirMensajeErrorPedido(error: ErrorPedidoPublico): string {
  const codigo = limpiarTexto(error.codigo);
  if (codigo && MENSAJES_PEDIDO_POR_CODIGO[codigo]) return MENSAJES_PEDIDO_POR_CODIGO[codigo];

  const detalle = limpiarTexto(error.detalle) || limpiarTexto(error.mensaje);
  if (esErrorPagoSimulado(detalle)) return MENSAJES_PEDIDO_POR_CODIGO.pago_simulado_invalido;
  if (esErrorPedidoNoEncontrado(detalle)) return MENSAJES_PEDIDO_POR_CODIGO.pedido_no_encontrado;
  if (esErrorStock(detalle)) return MENSAJES_PEDIDO_POR_CODIGO.stock_no_disponible;
  if (detalle && !pareceTecnico(detalle)) return detalle;
  return MENSAJE_GENERICO;
}

export function traducirLineaStock(linea: LineaStockPublica): string {
  const codigo = limpiarTexto(linea.codigo);
  const base = codigo && MENSAJES_LINEA_STOCK[codigo]
    ? MENSAJES_LINEA_STOCK[codigo]
    : "No podemos confirmar disponibilidad de esta linea.";
  const disponibilidad = typeof linea.cantidad_disponible === "number"
    ? ` Disponible ahora: ${linea.cantidad_disponible}.`
    : "";
  return `${base}${disponibilidad}`;
}

export function resolverEstadoPedidoNoCargado(mensaje: string): EstadoPedidoNoCargado {
  const descripcion = traducirMensajeErrorPedido({ mensaje });
  return {
    titulo: descripcion === MENSAJES_PEDIDO_POR_CODIGO.pedido_no_encontrado
      ? "Pedido no encontrado"
      : "No pudimos mostrar el pedido",
    descripcion,
    ctaPrincipal: { href: "/mi-cuenta", texto: "Ver mi cuenta" },
    ctaSecundaria: { href: "/botica-natural", texto: "Seguir explorando" },
  };
}

function limpiarTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function esErrorPagoSimulado(texto: string): boolean {
  return /intenci[oó]n.*pago.*simulad|simulado_local|confirmar.*pago.*simulad/i.test(texto);
}

function esErrorPedidoNoEncontrado(texto: string): boolean {
  return /no encontr|not found|404/i.test(texto);
}

function esErrorStock(texto: string): boolean {
  return /stock|inventario|disponible/i.test(texto);
}

function pareceTecnico(texto: string): boolean {
  return /[a-z]+_[a-z]+|payload|traceback|endpoint|api|pedidodemo|cuentademo/i.test(texto);
}
