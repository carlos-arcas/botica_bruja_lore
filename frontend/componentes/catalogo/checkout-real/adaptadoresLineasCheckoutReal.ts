import { ItemEncargoPreseleccionado } from "../../../contenido/catalogo/cestaRitual";
import { ResultadoLineasPedidoReal } from "../../../contenido/catalogo/checkoutReal";
import {
  LineaSeleccionEncargo,
  resolverLineasSeleccionEncargo,
} from "../../../contenido/catalogo/seleccionEncargo";

export type EstadoVisualLineaCheckoutReal = {
  etiqueta: string;
  descripcion?: string;
  tono: "convertible" | "bloqueada";
};

export type ItemLineaVisualCheckoutReal = {
  linea: LineaSeleccionEncargo;
  estado: EstadoVisualLineaCheckoutReal;
};

export type LineasVisualesCheckoutReal = {
  lineasConvertibles: ItemLineaVisualCheckoutReal[];
  lineasBloqueadas: ItemLineaVisualCheckoutReal[];
};

export function construirLineasVisualesCheckoutReal(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  resultadoLineas: ResultadoLineasPedidoReal,
): LineasVisualesCheckoutReal {
  const bloqueosPorLinea = new Map(
    resultadoLineas.lineasNoConvertibles.map((linea) => [linea.id_linea, linea]),
  );
  const lineasSeleccion = resolverLineasSeleccionEncargo(
    itemsPreseleccionados.map((item) => ({
      ...item,
      actualizadoEn: "1970-01-01T00:00:00.000Z",
    })),
  );

  return lineasSeleccion.reduce<LineasVisualesCheckoutReal>(
    (acumulado, linea) => {
      const bloqueo = bloqueosPorLinea.get(linea.id_linea);
      if (bloqueo) {
        acumulado.lineasBloqueadas.push({
          linea,
          estado: {
            etiqueta: "Línea bloqueada fuera del pedido real",
            descripcion: bloqueo.motivo,
            tono: "bloqueada",
          },
        });
        return acumulado;
      }

      acumulado.lineasConvertibles.push({
        linea,
        estado: {
          etiqueta: "Línea convertible al pedido real",
          descripcion:
            "Se mantiene como línea revisable del checkout con su contexto visual y económico.",
          tono: "convertible",
        },
      });
      return acumulado;
    },
    { lineasConvertibles: [], lineasBloqueadas: [] },
  );
}
