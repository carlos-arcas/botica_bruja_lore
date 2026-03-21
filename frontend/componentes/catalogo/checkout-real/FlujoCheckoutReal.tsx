"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ItemListaLineasSeleccion,
  ListaLineasSeleccion,
} from "@/componentes/catalogo/seleccion/ListaLineasSeleccion";
import { PRODUCTOS_CATALOGO } from "@/contenido/catalogo/catalogo";
import { resolverContextoPreseleccionado } from "@/contenido/catalogo/encargoConsulta";
import {
  construirEstadoInicialCheckoutReal,
  construirPayloadPedidoReal,
  construirResultadoLineasPedidoReal,
  DatosCheckoutReal,
  resolverModoCheckoutReal,
  validarCheckoutReal,
} from "@/contenido/catalogo/checkoutReal";
import {
  resolverLineasSeleccionEncargo,
  resolverResumenEconomicoSeleccion,
} from "@/contenido/catalogo/seleccionEncargo";
import { crearPedidoPublico } from "@/infraestructura/api/pedidos";

import estilos from "./flujoCheckoutReal.module.css";

type Props = {
  slugPreseleccionado?: string;
  cestaPreseleccionada?: string;
};

export function FlujoCheckoutReal({
  slugPreseleccionado,
  cestaPreseleccionada,
}: Props): JSX.Element {
  const contexto = resolverContextoPreseleccionado(
    slugPreseleccionado ?? null,
    cestaPreseleccionada ?? null,
  );
  const [datos, setDatos] = useState(() =>
    construirEstadoInicialCheckoutReal(contexto.productoPreseleccionado?.slug),
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();
  const modoCheckout = useMemo(
    () => resolverModoCheckoutReal(contexto.itemsPreseleccionados),
    [contexto.itemsPreseleccionados],
  );
  const resultadoLineas = useMemo(
    () =>
      construirResultadoLineasPedidoReal(
        contexto.itemsPreseleccionados,
        datos.producto_slug,
        datos.cantidad,
      ),
    [contexto.itemsPreseleccionados, datos.cantidad, datos.producto_slug],
  );
  const lineasSeleccion = useMemo(
    () =>
      resolverLineasSeleccionEncargo(
        contexto.itemsPreseleccionados.map((item) => ({
          ...item,
          actualizadoEn: new Date().toISOString(),
        })),
      ),
    [contexto.itemsPreseleccionados],
  );
  const resumenEconomico = useMemo(
    () => resolverResumenEconomicoSeleccion(lineasSeleccion),
    [lineasSeleccion],
  );
  const producto = useMemo(
    () =>
      modoCheckout === "producto_unico"
        ? PRODUCTOS_CATALOGO.find((item) => item.slug === datos.producto_slug) ??
          null
        : null,
    [datos.producto_slug, modoCheckout],
  );
  const idsConvertibles = useMemo(
    () => new Set(resultadoLineas.lineasConvertibles.map((linea) => linea.id_producto)),
    [resultadoLineas.lineasConvertibles],
  );
  const idsBloqueadas = useMemo(
    () => new Set(resultadoLineas.lineasNoConvertibles.map((linea) => linea.id_linea)),
    [resultadoLineas.lineasNoConvertibles],
  );
  const lineasConvertiblesVisuales = useMemo(
    () =>
      lineasSeleccion
        .filter((linea) => linea.id_producto && idsConvertibles.has(linea.id_producto))
        .map((linea) => ({
          linea,
          estado: {
            etiqueta: "Línea convertible al pedido real",
            descripcion:
              "Se mantiene como línea revisable del checkout con su contexto visual y económico.",
            tono: "convertible" as const,
          },
        })),
    [idsConvertibles, lineasSeleccion],
  );
  const lineasBloqueadasVisuales = useMemo(
    () =>
      lineasSeleccion
        .filter((linea) => idsBloqueadas.has(linea.id_linea))
        .map((linea) => {
          const bloqueo = resultadoLineas.lineasNoConvertibles.find(
            (item) => item.id_linea === linea.id_linea,
          );
          return {
            linea,
            estado: {
              etiqueta: "Línea bloqueada fuera del pedido real",
              descripcion: bloqueo?.motivo,
              tono: "bloqueada" as const,
            },
          };
        }),
    [idsBloqueadas, lineasSeleccion, resultadoLineas.lineasNoConvertibles],
  );

  const enviar = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nuevosErrores = validarCheckoutReal(datos, resultadoLineas, modoCheckout);
    setErrores(nuevosErrores);
    setMensaje("");
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }
    setEnviando(true);
    const resultado = await crearPedidoPublico(
      construirPayloadPedidoReal(datos, resultadoLineas.lineasConvertibles),
    );
    setEnviando(false);
    if (resultado.estado === "error") {
      setMensaje(resultado.mensaje);
      return;
    }
    router.push(`/pedido/${encodeURIComponent(resultado.pedido.id_pedido)}`);
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-checkout-real">
      <p className={estilos.eyebrow}>Checkout real v1 · coexistencia controlada</p>
      <h1 id="titulo-checkout-real">Finalizar pedido real sin tocar el flujo demo legado</h1>
      <p>
        Este flujo crea un <strong>Pedido</strong> real en estado
        <strong> pendiente_pago</strong>. No activa PSP ni reutiliza la sesión demo
        legacy.
      </p>
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Contacto</legend>
          <Campo nombre="nombre_contacto" etiqueta="Nombre de contacto" valor={datos.nombre_contacto} error={errores.nombre_contacto} onChange={setDatos} />
          <Campo nombre="email_contacto" etiqueta="Email" tipo="email" valor={datos.email_contacto} error={errores.email_contacto} onChange={setDatos} />
          <Campo nombre="telefono_contacto" etiqueta="Teléfono" tipo="tel" valor={datos.telefono_contacto} error={errores.telefono_contacto} onChange={setDatos} />
        </fieldset>
        <fieldset>
          <legend>Canal</legend>
          <label><input type="radio" checked={datos.canal_checkout === "web_invitado"} onChange={() => setDatos((previo) => ({ ...previo, canal_checkout: "web_invitado" }))} /> Invitado</label>
          <label><input type="radio" checked={datos.canal_checkout === "web_autenticado"} onChange={() => setDatos((previo) => ({ ...previo, canal_checkout: "web_autenticado" }))} /> Cuenta futura</label>
          {datos.canal_checkout === "web_autenticado" && <Campo nombre="id_usuario" etiqueta="ID de usuario real futuro" valor={datos.id_usuario} error={errores.id_usuario} onChange={setDatos} />}
        </fieldset>
        <fieldset>
          <legend>Pedido</legend>
          {modoCheckout === "producto_unico" ? (
            <BloquePedidoProductoUnico
              datos={datos}
              errores={errores}
              producto={producto}
              setDatos={setDatos}
            />
          ) : (
            <BloquePedidoSeleccionMultiple
              lineasConvertiblesVisuales={lineasConvertiblesVisuales}
              lineasBloqueadasVisuales={lineasBloqueadasVisuales}
              resumenEconomico={resumenEconomico}
            />
          )}
          <label>
            Intención y observaciones del pedido
            <textarea value={datos.notas_cliente} onChange={(event) => setDatos((previo) => ({ ...previo, notas_cliente: event.target.value }))} rows={3} />
          </label>
          {errores.lineas && <p className={estilos.error}>{errores.lineas}</p>}
        </fieldset>
        <fieldset>
          <legend>Dirección de entrega</legend>
          <Campo nombre="nombre_destinatario" etiqueta="Destinatario" valor={datos.nombre_destinatario} error={errores.nombre_destinatario} onChange={setDatos} />
          <Campo nombre="linea_1" etiqueta="Calle y número" valor={datos.linea_1} error={errores.linea_1} onChange={setDatos} />
          <Campo nombre="linea_2" etiqueta="Complemento" valor={datos.linea_2} onChange={setDatos} />
          <Campo nombre="codigo_postal" etiqueta="Código postal" valor={datos.codigo_postal} error={errores.codigo_postal} onChange={setDatos} />
          <Campo nombre="ciudad" etiqueta="Localidad" valor={datos.ciudad} error={errores.ciudad} onChange={setDatos} />
          <Campo nombre="provincia" etiqueta="Provincia" valor={datos.provincia} error={errores.provincia} onChange={setDatos} />
          <Campo nombre="pais_iso" etiqueta="País" valor={datos.pais_iso} onChange={setDatos} />
          <label>
            Observaciones de entrega
            <textarea value={datos.observaciones} onChange={(event) => setDatos((previo) => ({ ...previo, observaciones: event.target.value }))} rows={3} />
          </label>
        </fieldset>
        <button className="boton boton--principal" type="submit" disabled={enviando}>{enviando ? "Creando pedido real..." : "Crear pedido real"}</button>
        {mensaje && <p className={estilos.error}>{mensaje}</p>}
      </form>
    </section>
  );
}

type CampoProps = {
  nombre: string;
  etiqueta: string;
  valor: string;
  onChange: React.Dispatch<React.SetStateAction<DatosCheckoutReal>>;
  error?: string;
  tipo?: "text" | "email" | "tel";
};

type BloquePedidoProductoUnicoProps = {
  datos: { producto_slug: string; cantidad: string };
  errores: Record<string, string>;
  producto: (typeof PRODUCTOS_CATALOGO)[number] | null;
  setDatos: React.Dispatch<React.SetStateAction<DatosCheckoutReal>>;
};

type BloquePedidoSeleccionMultipleProps = {
  lineasConvertiblesVisuales: ItemListaLineasSeleccion[];
  lineasBloqueadasVisuales: ItemListaLineasSeleccion[];
  resumenEconomico: ReturnType<typeof resolverResumenEconomicoSeleccion>;
};

function Campo({ nombre, etiqueta, valor, onChange, error, tipo = "text" }: CampoProps): JSX.Element {
  return (
    <>
      <label>
        {etiqueta}
        <input type={tipo} value={valor} onChange={(event) => onChange((previo: DatosCheckoutReal) => ({ ...previo, [nombre]: event.target.value }))} />
      </label>
      {error && <p className={estilos.error}>{error}</p>}
    </>
  );
}

function BloquePedidoProductoUnico({
  datos,
  errores,
  producto,
  setDatos,
}: BloquePedidoProductoUnicoProps): JSX.Element {
  return (
    <>
      <label>
        Producto
        <select value={datos.producto_slug} onChange={(event) => setDatos((previo) => ({ ...previo, producto_slug: event.target.value }))}>
          <option value="">Selecciona una pieza</option>
          {PRODUCTOS_CATALOGO.map((item) => <option key={item.id} value={item.slug}>{item.nombre}</option>)}
        </select>
      </label>
      {errores.producto_slug && <p className={estilos.error}>{errores.producto_slug}</p>}
      <Campo nombre="cantidad" etiqueta="Cantidad" valor={datos.cantidad} onChange={setDatos} />
      {producto && <p className={estilos.resumenProducto}>{producto.nombre} · {producto.precioVisible}</p>}
    </>
  );
}

function BloquePedidoSeleccionMultiple({
  lineasConvertiblesVisuales,
  lineasBloqueadasVisuales,
  resumenEconomico,
}: BloquePedidoSeleccionMultipleProps): JSX.Element {
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
      {lineasBloqueadasVisuales.length > 0 && (
        <div className={estilos.bloqueBloqueado} role="alert">
          <p><strong>Selección visible bloqueada fuera del pedido real</strong></p>
          <p>El pedido real queda bloqueado porque tu selección visible incluye líneas no comprables.</p>
          <ListaLineasSeleccion items={lineasBloqueadasVisuales} />
          <p>Separa esas piezas como consulta manual antes de continuar con el pago.</p>
        </div>
      )}
    </div>
  );
}

