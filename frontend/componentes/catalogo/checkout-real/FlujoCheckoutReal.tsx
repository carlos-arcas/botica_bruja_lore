"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PRODUCTOS_CATALOGO } from "@/contenido/catalogo/catalogo";
import {
  construirEstadoInicialCheckoutReal,
  construirPayloadPedidoReal,
  construirResultadoLineasPedidoReal,
  DatosCheckoutReal,
  resolverModoCheckoutReal,
  validarCheckoutReal,
} from "@/contenido/catalogo/checkoutReal";
import {
  aplicarDireccionGuardadaADatosCheckoutReal,
  resolverDireccionPredeterminadaCheckoutReal,
  resolverModoDireccionInicialCheckoutReal,
} from "@/contenido/catalogo/checkoutRealDirecciones";
import {
  construirRutaConsultaManualCheckoutReal,
  construirRutaRevisionSeleccionCheckoutReal,
} from "@/contenido/catalogo/checkoutRealNavegacion";
import { resolverContextoPreseleccionado } from "@/contenido/catalogo/encargoConsulta";
import { resolverLineasSeleccionEncargo, resolverResumenEconomicoSeleccion } from "@/contenido/catalogo/seleccionEncargo";
import { BloquePedidoSeleccionMultiple } from "@/componentes/catalogo/checkout-real/BloquePedidoSeleccionMultiple";
import { SelectorDireccionCheckoutReal } from "@/componentes/catalogo/checkout-real/SelectorDireccionCheckoutReal";
import { construirLineasVisualesCheckoutReal } from "@/componentes/catalogo/checkout-real/adaptadoresLineasCheckoutReal";
import { obtenerDireccionesCuentaCliente, obtenerSesionCuentaCliente } from "@/infraestructura/api/cuentasCliente";
import { crearPedidoPublico } from "@/infraestructura/api/pedidos";
import type { LineaErrorStockPedido } from "@/infraestructura/api/pedidos";
import { guardarPreseleccionEncargoLocal } from "@/infraestructura/catalogo/almacenPreseleccionEncargo";

import estilos from "./flujoCheckoutReal.module.css";

type Props = { slugPreseleccionado?: string; cestaPreseleccionada?: string };

export function FlujoCheckoutReal({ slugPreseleccionado, cestaPreseleccionada }: Props): JSX.Element {
  const contexto = resolverContextoPreseleccionado(slugPreseleccionado ?? null, cestaPreseleccionada ?? null);
  const [datos, setDatos] = useState(() => construirEstadoInicialCheckoutReal(contexto.productoPreseleccionado?.slug));
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [lineasStock, setLineasStock] = useState<LineaErrorStockPedido[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [cargandoCuenta, setCargandoCuenta] = useState(true);
  const [direcciones, setDirecciones] = useState<Awaited<ReturnType<typeof obtenerDireccionesCuentaCliente>>["direcciones"]>([]);
  const router = useRouter();

  const modoCheckout = useMemo(() => resolverModoCheckoutReal(contexto.itemsPreseleccionados), [contexto.itemsPreseleccionados]);
  const resultadoLineas = useMemo(() => construirResultadoLineasPedidoReal(contexto.itemsPreseleccionados, datos.producto_slug, datos.cantidad), [contexto.itemsPreseleccionados, datos.producto_slug, datos.cantidad]);
  const lineasSeleccion = useMemo(() => resolverLineasSeleccionEncargo(contexto.itemsPreseleccionados.map((item) => ({ ...item, actualizadoEn: new Date().toISOString() }))), [contexto.itemsPreseleccionados]);
  const lineasVisualesCheckout = useMemo(() => construirLineasVisualesCheckoutReal(contexto.itemsPreseleccionados, resultadoLineas), [contexto.itemsPreseleccionados, resultadoLineas]);
  const resumenEconomico = useMemo(() => resolverResumenEconomicoSeleccion(lineasVisualesCheckout.lineasConvertibles.map(({ linea }) => linea), "pedido_real"), [lineasVisualesCheckout.lineasConvertibles]);
  const resumenEconomicoBloqueado = useMemo(() => lineasVisualesCheckout.lineasBloqueadas.length > 0 ? resolverResumenEconomicoSeleccion(lineasVisualesCheckout.lineasBloqueadas.map(({ linea }) => linea), "fuera_pedido_real") : null, [lineasVisualesCheckout.lineasBloqueadas]);
  const resumenSeleccionVisible = useMemo(() => lineasVisualesCheckout.lineasBloqueadas.length > 0 ? resolverResumenEconomicoSeleccion(lineasSeleccion) : null, [lineasSeleccion, lineasVisualesCheckout.lineasBloqueadas.length]);
  const producto = useMemo(() => modoCheckout === "producto_unico" ? PRODUCTOS_CATALOGO.find((item) => item.slug === datos.producto_slug) ?? null : null, [datos.producto_slug, modoCheckout]);
  const checkoutBloqueado = resultadoLineas.lineasNoConvertibles.length > 0;
  const rutaConsultaManual = useMemo(() => construirRutaConsultaManualCheckoutReal(contexto.itemsPreseleccionados), [contexto.itemsPreseleccionados]);
  const rutaRevisionSeleccion = useMemo(() => construirRutaRevisionSeleccionCheckoutReal(contexto.itemsPreseleccionados), [contexto.itemsPreseleccionados]);
  const mostrarDireccionesGuardadas = datos.canal_checkout === "web_autenticado";
  const mostrarDireccionManual = !mostrarDireccionesGuardadas || direcciones.length === 0 || datos.modo_direccion === "manual";

  useEffect(() => {
    guardarPreseleccionEncargoLocal(contexto.itemsPreseleccionados);
  }, [contexto.itemsPreseleccionados]);

  useEffect(() => {
    let activa = true;
    const cargarCuenta = async (): Promise<void> => {
      const sesion = await obtenerSesionCuentaCliente();
      if (!activa) return;
      if (!sesion.autenticado || !sesion.cuenta) {
        setDatos((previo) => ({ ...previo, canal_checkout: "web_invitado", id_usuario: "", modo_direccion: "manual", id_direccion_guardada: "" }));
        setDirecciones([]);
        setCargandoCuenta(false);
        return;
      }
      const libreta = await obtenerDireccionesCuentaCliente();
      if (!activa) return;
      const predeterminada = resolverDireccionPredeterminadaCheckoutReal(libreta.direcciones);
      setDirecciones(libreta.direcciones);
      setDatos((previo) => {
        const base: DatosCheckoutReal = {
          ...previo,
          canal_checkout: "web_autenticado",
          id_usuario: sesion.cuenta?.id_usuario ?? "",
          email_contacto: previo.email_contacto || sesion.cuenta?.email || "",
          nombre_contacto: previo.nombre_contacto || sesion.cuenta?.nombre_visible || "",
          modo_direccion: resolverModoDireccionInicialCheckoutReal(libreta.direcciones),
        };
        return aplicarDireccionGuardadaADatosCheckoutReal(base, predeterminada);
      });
      setCargandoCuenta(false);
    };
    void cargarCuenta();
    return () => {
      activa = false;
    };
  }, []);

  const cambiarModoDireccion = (modo: DatosCheckoutReal["modo_direccion"]): void => {
    setDatos((previo) => ({ ...previo, modo_direccion: modo, id_direccion_guardada: modo === "manual" ? "" : previo.id_direccion_guardada }));
  };

  const seleccionarDireccionGuardada = (idDireccion: string): void => {
    const direccion = direcciones.find((item) => item.id_direccion === idDireccion) ?? null;
    setDatos((previo) => aplicarDireccionGuardadaADatosCheckoutReal({ ...previo, id_direccion_guardada: idDireccion }, direccion));
  };

  const enviar = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nuevosErrores = validarCheckoutReal(datos, resultadoLineas, modoCheckout);
    setErrores(nuevosErrores);
    setMensaje("");
    setLineasStock([]);
    if (Object.keys(nuevosErrores).length > 0) return;
    setEnviando(true);
    const resultado = await crearPedidoPublico(construirPayloadPedidoReal(datos, resultadoLineas.lineasConvertibles));
    setEnviando(false);
    if (resultado.estado === "error") {
      setMensaje(resultado.mensaje);
      setLineasStock(resultado.codigo === "stock_no_disponible" ? resultado.lineas ?? [] : []);
      return;
    }
    router.push(`/pedido/${encodeURIComponent(resultado.pedido.id_pedido)}`);
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-checkout-real">
      <p className={estilos.eyebrow}>Checkout real v1 · coexistencia controlada</p>
      <h1 id="titulo-checkout-real">Finalizar pedido real sin tocar el flujo demo legado</h1>
      <p>Este flujo crea un <strong>Pedido</strong> real en estado <strong>pendiente_pago</strong>. Si tu cuenta tiene direcciones guardadas, aquí puedes reutilizarlas sin convertir el pedido en una referencia viva.</p>
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Contacto</legend>
          <Campo nombre="nombre_contacto" etiqueta="Nombre de contacto" valor={datos.nombre_contacto} error={errores.nombre_contacto} onChange={setDatos} />
          <Campo nombre="email_contacto" etiqueta="Email" tipo="email" valor={datos.email_contacto} error={errores.email_contacto} onChange={setDatos} />
          <Campo nombre="telefono_contacto" etiqueta="Teléfono" tipo="tel" valor={datos.telefono_contacto} error={errores.telefono_contacto} onChange={setDatos} />
          <p className={estilos.estadoCuenta}>{cargandoCuenta ? "Comprobando sesión real…" : datos.canal_checkout === "web_autenticado" ? "Checkout autenticado activo. El pedido quedará asociado a tu cuenta real." : "Checkout como invitada. La libreta de direcciones no está disponible en este modo."}</p>
        </fieldset>
        <fieldset>
          <legend>Pedido</legend>
          {modoCheckout === "producto_unico" ? <BloquePedidoProductoUnico datos={datos} errores={errores} producto={producto} setDatos={setDatos} /> : <BloquePedidoSeleccionMultiple lineasConvertiblesVisuales={lineasVisualesCheckout.lineasConvertibles} lineasBloqueadasVisuales={lineasVisualesCheckout.lineasBloqueadas} resumenEconomico={resumenEconomico} resumenEconomicoBloqueado={resumenEconomicoBloqueado} resumenSeleccionVisible={resumenSeleccionVisible} rutaConsultaManual={rutaConsultaManual} rutaRevisionSeleccion={rutaRevisionSeleccion} />}
          <label>Intención y observaciones del pedido<textarea value={datos.notas_cliente} onChange={(event) => setDatos((previo) => ({ ...previo, notas_cliente: event.target.value }))} rows={3} /></label>
          {errores.lineas && <p className={estilos.error}>{errores.lineas}</p>}
        </fieldset>
        <fieldset>
          <legend>Dirección de entrega</legend>
          {mostrarDireccionesGuardadas && <SelectorDireccionCheckoutReal direcciones={direcciones} datos={datos} errores={errores} onCambiarModo={cambiarModoDireccion} onSeleccionarDireccion={seleccionarDireccionGuardada} />}
          {mostrarDireccionManual && <BloqueDireccionManual datos={datos} errores={errores} setDatos={setDatos} />}
        </fieldset>
        <div className={estilos.accionesFinales}>
          <button className="boton boton--principal" type="submit" disabled={enviando || checkoutBloqueado} aria-disabled={checkoutBloqueado} aria-describedby={checkoutBloqueado ? "ayuda-checkout-bloqueado" : undefined}>{enviando ? "Creando pedido real..." : checkoutBloqueado ? "Pedido real bloqueado por líneas no convertibles" : "Crear pedido real"}</button>
          {checkoutBloqueado && <p id="ayuda-checkout-bloqueado" className={estilos.ayudaBloqueoCta}>Usa la salida artesanal para mantener la selección completa sin quedarte atrapada en este checkout.</p>}
        </div>
        {mensaje && (
          <div className={estilos.bloqueErrorStock}>
            <p className={estilos.error}>{mensaje}</p>
            {lineasStock.length > 0 && (
              <ul className={estilos.listaErrorStock}>
                {lineasStock.map((linea) => (
                  <li key={`${linea.id_producto}-${linea.codigo}`}>
                    <strong>{linea.nombre_producto}</strong>: {linea.detalle}
                    {typeof linea.cantidad_disponible === "number" ? ` Stock disponible: ${linea.cantidad_disponible}.` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </section>
  );
}

type CampoProps = { nombre: string; etiqueta: string; valor: string; onChange: React.Dispatch<React.SetStateAction<DatosCheckoutReal>>; error?: string; tipo?: "text" | "email" | "tel" };
type BloquePedidoProductoUnicoProps = { datos: { producto_slug: string; cantidad: string }; errores: Record<string, string>; producto: (typeof PRODUCTOS_CATALOGO)[number] | null; setDatos: React.Dispatch<React.SetStateAction<DatosCheckoutReal>> };
type BloqueDireccionManualProps = { datos: DatosCheckoutReal; errores: Record<string, string>; setDatos: React.Dispatch<React.SetStateAction<DatosCheckoutReal>> };

function Campo({ nombre, etiqueta, valor, onChange, error, tipo = "text" }: CampoProps): JSX.Element {
  return <><label>{etiqueta}<input type={tipo} value={valor} onChange={(event) => onChange((previo: DatosCheckoutReal) => ({ ...previo, [nombre]: event.target.value }))} /></label>{error && <p className={estilos.error}>{error}</p>}</>;
}

function BloquePedidoProductoUnico({ datos, errores, producto, setDatos }: BloquePedidoProductoUnicoProps): JSX.Element {
  return <>{producto ? <p className={estilos.resumenProducto}>Producto seleccionado: <strong>{producto.nombre}</strong> · {producto.precioVisible}</p> : <Campo nombre="producto_slug" etiqueta="Slug del producto" valor={datos.producto_slug} error={errores.producto_slug} onChange={setDatos} /> }<Campo nombre="cantidad" etiqueta="Cantidad" valor={datos.cantidad} onChange={setDatos} /></>;
}

function BloqueDireccionManual({ datos, errores, setDatos }: BloqueDireccionManualProps): JSX.Element {
  return <><Campo nombre="nombre_destinatario" etiqueta="Destinatario" valor={datos.nombre_destinatario} error={errores.nombre_destinatario} onChange={setDatos} /><Campo nombre="linea_1" etiqueta="Calle y número" valor={datos.linea_1} error={errores.linea_1} onChange={setDatos} /><Campo nombre="linea_2" etiqueta="Complemento" valor={datos.linea_2} onChange={setDatos} /><Campo nombre="codigo_postal" etiqueta="Código postal" valor={datos.codigo_postal} error={errores.codigo_postal} onChange={setDatos} /><Campo nombre="ciudad" etiqueta="Localidad" valor={datos.ciudad} error={errores.ciudad} onChange={setDatos} /><Campo nombre="provincia" etiqueta="Provincia" valor={datos.provincia} error={errores.provincia} onChange={setDatos} /><Campo nombre="pais_iso" etiqueta="País" valor={datos.pais_iso} onChange={setDatos} /><label>Observaciones de entrega<textarea value={datos.observaciones} onChange={(event) => setDatos((previo) => ({ ...previo, observaciones: event.target.value }))} rows={3} /></label></>;
}
