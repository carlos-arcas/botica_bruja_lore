import Link from "next/link";

import { ItemListaLineasSeleccion, ListaLineasSeleccion } from "@/componentes/catalogo/seleccion/ListaLineasSeleccion";
import { resolverResumenEconomicoSeleccion } from "@/contenido/catalogo/seleccionEncargo";

import estilos from "./flujoCheckoutReal.module.css";

type Props = {
  lineasConvertiblesVisuales: ItemListaLineasSeleccion[];
  lineasBloqueadasVisuales: ItemListaLineasSeleccion[];
  resumenEconomico: ReturnType<typeof resolverResumenEconomicoSeleccion>;
  resumenEconomicoBloqueado: ReturnType<typeof resolverResumenEconomicoSeleccion> | null;
  resumenSeleccionVisible: ReturnType<typeof resolverResumenEconomicoSeleccion> | null;
  rutaConsultaManual: string;
  rutaRevisionSeleccion: string;
};

export function BloquePedidoSeleccionMultiple({
  lineasConvertiblesVisuales,
  lineasBloqueadasVisuales,
  resumenEconomico,
  resumenEconomicoBloqueado,
  resumenSeleccionVisible,
  rutaConsultaManual,
  rutaRevisionSeleccion,
}: Props): JSX.Element {
  const hayLineasBloqueadas = lineasBloqueadasVisuales.length > 0;

  return (
    <div className={estilos.bloqueSeleccionMultiple}>
      <div className={estilos.cabeceraSeleccion}>
        <p><strong>Selección real que entra en el pedido</strong></p>
        <p>El pedido se construye desde las líneas preseleccionadas convertibles; este modo no usa un selector único heredado.</p>
      </div>
      <ListaLineasSeleccion items={lineasConvertiblesVisuales} />
      <div className={estilos.resumenEconomico}>
        <p><strong>{resumenEconomico.etiqueta}:</strong> {resumenEconomico.totalVisible ?? "A revisar"}</p>
        <p>{resumenEconomico.detalle}</p>
      </div>
      {hayLineasBloqueadas && (
        <div className={estilos.bloqueBloqueado} role="alert">
          <p><strong>Selección visible bloqueada fuera del pedido real</strong></p>
          <p>El pedido real queda bloqueado porque tu selección visible incluye líneas no comprables.</p>
          {resumenEconomicoBloqueado && (
            <div className={estilos.resumenEconomico}>
              <p><strong>{resumenEconomicoBloqueado.etiqueta}:</strong> {resumenEconomicoBloqueado.totalVisible ?? "A revisar"}</p>
              <p>{resumenEconomicoBloqueado.detalle}</p>
            </div>
          )}
          {resumenSeleccionVisible && (
            <p>
              <strong>Contexto de toda la selección visible:</strong>{" "}
              {resumenSeleccionVisible.totalVisible ?? "A revisar"} · {resumenSeleccionVisible.etiqueta}.
            </p>
          )}
          <ListaLineasSeleccion items={lineasBloqueadasVisuales} />
          <p>Separa esas piezas como consulta manual antes de continuar con el pago.</p>
          <div className={estilos.accionesBloqueo}>
            <Link href={rutaConsultaManual} className="boton boton--principal">
              Llevar esta selección a consulta artesanal
            </Link>
            <Link href={rutaRevisionSeleccion} className="boton boton--secundario">
              Volver a Mi selección
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
