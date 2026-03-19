"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PRODUCTOS_CATALOGO } from "@/contenido/catalogo/catalogo";
import {
  construirEnlaceCanal,
  obtenerConfiguracionContactoPublico,
  resolverEstadoCanalContacto,
  TipoCanalContacto,
} from "@/contenido/catalogo/canalContactoPublico";
import {
  construirResumenConsulta,
  construirEstadoInicialConsulta,
  DatosConsulta,
  resolverContextoPreseleccionado,
  validarSolicitudConsulta,
} from "@/contenido/catalogo/encargoConsulta";
import {
  CanalCheckoutDemo,
  construirLineasPedidoDemo,
  construirPayloadPedidoDemo,
  resolverEstadoIdentificacionCheckoutDemo,
  validarCheckoutDemo,
} from "@/contenido/catalogo/checkoutDemo";
import {
  construirRutaCuentaDemoConRetornoSeguro,
  guardarBorradorCheckoutDemo,
  leerBorradorCheckoutDemo,
  limpiarBorradorCheckoutDemo,
} from "@/contenido/catalogo/estadoCheckoutDemo";
import { leerSesionCuentaDemo } from "@/contenido/cuenta_demo/estadoCuentaDemo";
import { construirRutaReciboPedidoDemo } from "@/contenido/catalogo/postCheckoutDemo";
import { crearPedidoDemoPublico, PedidoDemoCreado } from "@/infraestructura/api/pedidosDemo";

import { BloqueIdentificacionCheckoutDemo } from "./BloqueIdentificacionCheckoutDemo";
import { ResumenEnvioEncargoDemo } from "./ResumenEnvioEncargoDemo";
import estilos from "./flujoEncargoConsulta.module.css";

type Props = {
  slugPreseleccionado?: string;
  cestaPreseleccionada?: string;
};

const RUTA_CUENTA_DEMO_RETORNO = "/encargo";

export function FlujoEncargoConsulta({ slugPreseleccionado, cestaPreseleccionada }: Props): JSX.Element {
  const contextoPreseleccionado = resolverContextoPreseleccionado(slugPreseleccionado ?? null, cestaPreseleccionada ?? null);
  const [datos, setDatos] = useState<DatosConsulta>(() => construirEstadoInicialConsulta(contextoPreseleccionado));
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [resumen, setResumen] = useState("");
  const [mensajeCopia, setMensajeCopia] = useState("");
  const [mensajeCanal, setMensajeCanal] = useState("");
  const [cuentaDemoActiva, setCuentaDemoActiva] = useState(() => leerSesionCuentaDemo());
  const [continuarComoInvitado, setContinuarComoInvitado] = useState(() => !leerSesionCuentaDemo());
  const [estadoEnvio, setEstadoEnvio] = useState<"idle" | "enviando" | "error" | "ok">("idle");
  const [mensajeEnvio, setMensajeEnvio] = useState("");
  const [pedidoCreado, setPedidoCreado] = useState<PedidoDemoCreado | null>(null);
  const router = useRouter();
  const configuracionCanal = useMemo(() => obtenerConfiguracionContactoPublico(), []);
  const estadoCanal = useMemo(() => resolverEstadoCanalContacto(configuracionCanal), [configuracionCanal]);
  const estadoIdentificacion = useMemo(
    () => resolverEstadoIdentificacionCheckoutDemo(cuentaDemoActiva, continuarComoInvitado),
    [continuarComoInvitado, cuentaDemoActiva],
  );
  const productoSeleccionado = useMemo(
    () => PRODUCTOS_CATALOGO.find((producto) => producto.slug === datos.productoSlug) ?? null,
    [datos.productoSlug],
  );
  const canalCheckout: CanalCheckoutDemo = estadoIdentificacion.canalActivo;

  useEffect(() => {
    const cuenta = leerSesionCuentaDemo();
    const borrador = leerBorradorCheckoutDemo();
    setCuentaDemoActiva(cuenta);
    setContinuarComoInvitado(resolverModoInvitadoInicial(cuenta, borrador?.continuarComoInvitado));
    setDatos((previo) => combinarDatosIniciales(previo, cuenta, borrador?.datos));
  }, []);

  const actualizarCampo = (campo: keyof DatosConsulta, valor: string | boolean): void => {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
  };

  const enviarConsulta = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const lineas = construirLineasPedidoDemo(contextoPreseleccionado.itemsPreseleccionados, datos.productoSlug, datos.cantidad);
    const nuevosErrores = { ...validarSolicitudConsulta(datos), ...validarCheckoutDemo(canalCheckout, estadoIdentificacion.cuentaActiva, lineas) };
    limpiarMensajesPrevios();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
      return;
    }

    setResumen(construirResumenConsulta(datos, productoSeleccionado));
    setEstadoEnvio("enviando");
    const payload = construirPayloadPedidoDemo(datos.email, canalCheckout, lineas, estadoIdentificacion.cuentaActiva);
    const resultado = await crearPedidoDemoPublico(payload);

    if (resultado.estado === "error") {
      setEstadoEnvio("error");
      setMensajeEnvio(resultado.mensaje);
      guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
      return;
    }

    limpiarBorradorCheckoutDemo();
    setEstadoEnvio("ok");
    setPedidoCreado(resultado.pedido);
    router.push(construirRutaReciboPedidoDemo(resultado.pedido.id_pedido));
  };

  const copiarResumen = async (): Promise<void> => {
    if (!resumen) {
      return;
    }
    if (!navigator.clipboard) {
      setMensajeCopia("Tu navegador no permite copiar automáticamente. Puedes copiar el texto manualmente.");
      return;
    }
    await navigator.clipboard.writeText(resumen);
    setMensajeCopia("Solicitud copiada. Ya puedes compartirla por tu canal habitual.");
  };

  const obtenerEnlaceCanal = (tipo: TipoCanalContacto): string | null => {
    const canal = estadoCanal.canales.find((item) => item.tipo === tipo);
    return canal ? construirEnlaceCanal(canal, configuracionCanal, resumen) : null;
  };

  const registrarIntentoCanal = (tipo: TipoCanalContacto): void => {
    if (!obtenerEnlaceCanal(tipo)) {
      setMensajeCanal("No se pudo abrir el canal porque faltan datos válidos de configuración o resumen.");
    }
  };

  const guardarYEntrarCuentaDemo = (): void => {
    guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
    router.push(construirRutaCuentaDemoConRetornoSeguro(RUTA_CUENTA_DEMO_RETORNO));
  };

  const limpiarMensajesPrevios = (): void => {
    setMensajeCopia("");
    setMensajeCanal("");
    setMensajeEnvio("");
    setPedidoCreado(null);
    setEstadoEnvio("idle");
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-encargo">
      <p className={estilos.eyebrow}>Encargo ligero · consulta comercial</p>
      <h1 id="titulo-encargo">Preparar una solicitud artesanal</h1>
      <p>Cuéntanos qué pieza te interesa y en qué contexto deseas usarla. Al final tendrás un texto listo para copiar o enviar por un canal real, si está configurado.</p>

      <article className={estilos.resumenProducto} aria-live="polite">
        <h2>Producto seleccionado</h2>
        {contextoPreseleccionado.itemsPreseleccionados.length > 0 ? (
          <p>Has llegado con una selección múltiple desde la cesta ritual. Puedes ajustar producto base, cantidad y mensaje antes de enviar.</p>
        ) : productoSeleccionado ? (
          <>
            <p><strong>{productoSeleccionado.nombre}</strong> · {productoSeleccionado.precioVisible}</p>
            <p>{productoSeleccionado.subtitulo}</p>
          </>
        ) : (
          <p>No hay producto preseleccionado. Elige una pieza desde el formulario para continuar.</p>
        )}
      </article>

      <BloqueIdentificacionCheckoutDemo
        canalActivo={canalCheckout}
        cuentaDemo={cuentaDemoActiva}
        onContinuarComoInvitado={() => setContinuarComoInvitado(true)}
        onIrCuentaDemo={guardarYEntrarCuentaDemo}
        onUsarCuentaDemo={() => activarCuentaDemo(cuentaDemoActiva, setContinuarComoInvitado, setDatos)}
      />

      <form className={estilos.formulario} onSubmit={enviarConsulta} noValidate>
        <CampoFormulario etiqueta="Nombre" name="nombre" value={datos.nombre} onChange={(valor) => actualizarCampo("nombre", valor)} error={errores.nombre} />
        <CampoFormulario etiqueta="Email" name="email" type="email" value={datos.email} onChange={(valor) => actualizarCampo("email", valor)} error={errores.email} errorId="error-contacto" />
        <CampoFormulario etiqueta="Teléfono (opcional si dejas email)" name="telefono" type="tel" value={datos.telefono} onChange={(valor) => actualizarCampo("telefono", valor)} error={errores.email} errorId="error-contacto" />

        <input type="hidden" name="canalCheckout" value={canalCheckout} readOnly />
        {errores.idUsuario && <p id="error-id-usuario" className={estilos.error}>{errores.idUsuario}</p>}

        <label>
          Producto de interés
          <select name="productoSlug" value={datos.productoSlug} onChange={(event) => actualizarCampo("productoSlug", event.target.value)} aria-invalid={Boolean(errores.productoSlug)} aria-describedby={errores.productoSlug ? "error-producto" : undefined}>
            <option value="">Selecciona una pieza de la colección</option>
            {PRODUCTOS_CATALOGO.map((producto) => <option key={producto.id} value={producto.slug}>{producto.nombre}</option>)}
          </select>
        </label>
        {errores.productoSlug && <p id="error-producto" className={estilos.error}>{errores.productoSlug}</p>}
        {errores.lineas && <p className={estilos.error}>{errores.lineas}</p>}

        <CampoFormulario etiqueta="Cantidad o formato deseado" name="cantidad" value={datos.cantidad} onChange={(valor) => actualizarCampo("cantidad", valor)} />
        <label>
          Intención y observaciones
          <textarea name="mensaje" rows={4} value={datos.mensaje} onChange={(event) => actualizarCampo("mensaje", event.target.value)} aria-invalid={Boolean(errores.mensaje)} aria-describedby={errores.mensaje ? "error-mensaje" : undefined} />
        </label>
        {errores.mensaje && <p id="error-mensaje" className={estilos.error}>{errores.mensaje}</p>}

        <label className={estilos.consentimiento}>
          <input type="checkbox" checked={datos.consentimiento} onChange={(event) => actualizarCampo("consentimiento", event.target.checked)} />
          Acepto compartir estos datos para crear un pedido demo en esta experiencia sin cobro real.
        </label>
        {errores.consentimiento && <p className={estilos.error}>{errores.consentimiento}</p>}

        <button className="boton boton--principal" type="submit" disabled={estadoEnvio === "enviando"}>
          {estadoEnvio === "enviando" ? "Enviando pedido demo..." : "Enviar pedido demo"}
        </button>
      </form>

      {estadoEnvio === "error" && <p className={estilos.error}>{mensajeEnvio}</p>}
      <ResumenEnvioEncargoDemo estadoCanalDescripcion={estadoCanal.descripcion} estadoCanalDisponible={estadoCanal.disponible} canales={estadoCanal.canales} construirHrefCanal={obtenerEnlaceCanal} onIntentoCanal={registrarIntentoCanal} onCopiarResumen={copiarResumen} ctaSecundaria={estadoCanal.ctaSecundaria} mensajeCanal={mensajeCanal} mensajeCopia={mensajeCopia} resumen={resumen} estadoEnvio={estadoEnvio} pedidoCreado={pedidoCreado} productoSlug={productoSeleccionado?.slug} />
    </section>
  );
}

type CampoFormularioProps = {
  etiqueta: string;
  name: string;
  value: string;
  onChange: (valor: string) => void;
  error?: string;
  errorId?: string;
  type?: "text" | "email" | "tel";
};

function CampoFormulario({ etiqueta, name, value, onChange, error, errorId, type = "text" }: CampoFormularioProps): JSX.Element {
  const idError = error ? errorId ?? `error-${name}` : undefined;
  return (
    <>
      <label>
        {etiqueta}
        <input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={idError} />
      </label>
      {error && <p id={idError} className={estilos.error}>{error}</p>}
    </>
  );
}

function activarCuentaDemo(
  cuentaDemo: ReturnType<typeof leerSesionCuentaDemo>,
  setContinuarComoInvitado: (valor: boolean) => void,
  setDatos: (actualizador: (previo: DatosConsulta) => DatosConsulta) => void,
): void {
  setContinuarComoInvitado(false);
  if (cuentaDemo?.email) {
    setDatos((previo) => ({ ...previo, email: previo.email || cuentaDemo.email }));
  }
}

function combinarDatosIniciales(
  actual: DatosConsulta,
  cuentaDemo: ReturnType<typeof leerSesionCuentaDemo>,
  borrador: DatosConsulta | undefined,
): DatosConsulta {
  const base = borrador ?? actual;
  return {
    ...base,
    nombre: base.nombre || cuentaDemo?.nombre_visible || actual.nombre,
    email: base.email || cuentaDemo?.email || actual.email,
    consentimiento: false,
  };
}

function resolverModoInvitadoInicial(cuentaDemo: ReturnType<typeof leerSesionCuentaDemo>, continuarComoInvitado?: boolean): boolean {
  if (!cuentaDemo) {
    return true;
  }
  return continuarComoInvitado ?? false;
}
