import { ProductoCatalogo } from "./catalogo";

export function normalizarTextoBusqueda(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizarBusqueda(termino: string): string[] {
  const normalizado = normalizarTextoBusqueda(termino);
  if (!normalizado) return [];
  return normalizado.split(" ").filter(Boolean);
}

export function buscarProductosPorTexto(productos: ProductoCatalogo[], termino: string): ProductoCatalogo[] {
  const tokens = tokenizarBusqueda(termino);
  if (tokens.length === 0) return productos;

  return productos.filter((producto) => {
    const indice = construirIndiceBusqueda(producto);
    return tokens.every((token) => indice.includes(token));
  });
}

function construirIndiceBusqueda(producto: ProductoCatalogo): string {
  return normalizarTextoBusqueda([
    producto.nombre,
    producto.subtitulo,
    producto.descripcion,
    producto.intencion,
    producto.categoria,
    producto.etiquetas.join(" "),
    producto.notasSensoriales,
  ].join(" "));
}
