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

export function FlujoEncargoConsulta({ slugPreseleccionado, cestaPreseleccionada }: Props): JSX.Element {
  const contextoPreseleccionado = resolverContextoPreseleccionado(slugPreseleccionado ?? null, cestaPreseleccionada ?? null);
  const [datos, setDatos] = useState<DatosConsulta>(() => construirEstadoInicialConsulta(contextoPreseleccionado));
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [resumen, setResumen] = useState<string>("");
  const [mensajeCopia, setMensajeCopia] = useState<string>("");
  const [mensajeCanal, setMensajeCanal] = useState<string>("");
  const [cuentaDemoActiva, setCuentaDemoActiva] = useState(() => leerSesionCuentaDemo());
  const [continuarComoInvitado, setContinuarComoInvitado] = useState<boolean>(() => !leerSesionCuentaDemo());
  const [estadoEnvio, setEstadoEnvio] = useState<"idle" | "enviando" | "error" | "ok">("idle");
  const [mensajeEnvio, setMensajeEnvio] = useState<string>("");
  const [pedidoCreado, setPedidoCreado] = useState<PedidoDemoCreado | null>(null);

  const router = useRouter();
  const configuracionCanal = useMemo(() => obtenerConfiguracionContactoPublico(), []);
  const estadoCanal = useMemo(() => resolverEstadoCanalContacto(configuracionCanal), [configuracionCanal]);
  const estadoIdentificacion = useMemo(
    () => resolverEstadoIdentificacionCheckoutDemo(cuentaDemoActiva, continuarComoInvitado),
    [continuarComoInvitado, cuentaDemoActiva],
  );
  const canalCheckout: CanalCheckoutDemo = estadoIdentificacion.canalActivo;

  const productoSeleccionado = useMemo(
    () => PRODUCTOS_CATALOGO.find((producto) => producto.slug === datos.productoSlug) ?? null,
    [datos.productoSlug],
  );

  useEffect(() => {
    const cuenta = leerSesionCuentaDemo();
    setCuentaDemoActiva(cuenta);
    if (cuenta?.email && !datos.email.trim()) {
      setDatos((previo) => ({ ...previo, email: cuenta.email, nombre: previo.nombre || cuenta.nombre_visible }));
    }
  }, []);

  const actualizarCampo = (campo: keyof DatosConsulta, valor: string | boolean): void => {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
  };

  const enviarConsulta = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const lineas = construirLineasPedidoDemo(
      contextoPreseleccionado.itemsPreseleccionados,
      datos.productoSlug,
      datos.cantidad,
    );
    const nuevosErrores = {
      ...validarSolicitudConsulta(datos),
      ...validarCheckoutDemo(canalCheckout, estadoIdentificacion.cuentaActiva, lineas),
    };
    setErrores(nuevosErrores);
    setMensajeCopia("");
    setMensajeCanal("");
    setMensajeEnvio("");
    setPedidoCreado(null);
    setEstadoEnvio("idle");

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setResumen(construirResumenConsulta(datos, productoSeleccionado));
    setEstadoEnvio("enviando");

    const payload = construirPayloadPedidoDemo(datos.email, canalCheckout, lineas, estadoIdentificacion.cuentaActiva);
    const resultado = await crearPedidoDemoPublico(payload);

    if (resultado.estado === "error") {
      setEstadoEnvio("error");
      setMensajeEnvio(resultado.mensaje);
      return;
    }

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
    if (!canal) {
      return null;
    }

    return construirEnlaceCanal(canal, configuracionCanal, resumen);
  };

  const registrarIntentoCanal = (tipo: TipoCanalContacto): void => {
    if (!obtenerEnlaceCanal(tipo)) {
      setMensajeCanal("No se pudo abrir el canal porque faltan datos válidos de configuración o resumen.");
    }
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-encargo">
      <p className={estilos.eyebrow}>Encargo ligero · consulta comercial</p>
      <h1 id="titulo-encargo">Preparar una solicitud artesanal</h1>
      <p>
        Cuéntanos qué pieza te interesa y en qué contexto deseas usarla. Al final tendrás un texto listo para copiar
        o enviar por un canal real, si está configurado.
      </p>

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
        onUsarCuentaDemo={() => {
          setContinuarComoInvitado(false);
          if (cuentaDemoActiva?.email) {
            setDatos((previo) => ({ ...previo, email: previo.email || cuentaDemoActiva.email }));
          }
        }}
      />

      <form className={estilos.formulario} onSubmit={enviarConsulta} noValidate>
        <label>
          Nombre
          <input
            name="nombre"
            value={datos.nombre}
            onChange={(event) => actualizarCampo("nombre", event.target.value)}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
          />
        </label>
        {errores.nombre && <p id="error-nombre" className={estilos.error}>{errores.nombre}</p>}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={datos.email}
            onChange={(event) => actualizarCampo("email", event.target.value)}
            aria-invalid={Boolean(errores.email)}
            aria-describedby={errores.email ? "error-contacto" : undefined}
          />
        </label>

        <label>
          Teléfono (opcional si dejas email)
          <input
            type="tel"
            name="telefono"
            value={datos.telefono}
            onChange={(event) => actualizarCampo("telefono", event.target.value)}
            aria-invalid={Boolean(errores.email)}
            aria-describedby={errores.email ? "error-contacto" : undefined}
          />
        </label>
        {errores.email && <p id="error-contacto" className={estilos.error}>{errores.email}</p>}

        <input type="hidden" name="canalCheckout" value={canalCheckout} readOnly />
        {errores.idUsuario && <p id="error-id-usuario" className={estilos.error}>{errores.idUsuario}</p>}

        <label>
          Producto de interés
          <select
            name="productoSlug"
            value={datos.productoSlug}
            onChange={(event) => actualizarCampo("productoSlug", event.target.value)}
            aria-invalid={Boolean(errores.productoSlug)}
            aria-describedby={errores.productoSlug ? "error-producto" : undefined}
          >
            <option value="">Selecciona una pieza de la colección</option>
            {PRODUCTOS_CATALOGO.map((producto) => (
              <option key={producto.id} value={producto.slug}>{producto.nombre}</option>
            ))}
          </select>
        </label>
        {errores.productoSlug && <p id="error-producto" className={estilos.error}>{errores.productoSlug}</p>}
        {errores.lineas && <p className={estilos.error}>{errores.lineas}</p>}

        <label>
          Cantidad o formato deseado
          <input
            name="cantidad"
            value={datos.cantidad}
            onChange={(event) => actualizarCampo("cantidad", event.target.value)}
          />
        </label>

        <label>
          Intención y observaciones
          <textarea
            name="mensaje"
            rows={4}
            value={datos.mensaje}
            onChange={(event) => actualizarCampo("mensaje", event.target.value)}
            aria-invalid={Boolean(errores.mensaje)}
            aria-describedby={errores.mensaje ? "error-mensaje" : undefined}
          />
        </label>
        {errores.mensaje && <p id="error-mensaje" className={estilos.error}>{errores.mensaje}</p>}

        <label className={estilos.consentimiento}>
          <input
            type="checkbox"
            checked={datos.consentimiento}
            onChange={(event) => actualizarCampo("consentimiento", event.target.checked)}
          />
          Acepto compartir estos datos para crear un pedido demo en esta experiencia sin cobro real.
        </label>
        {errores.consentimiento && <p className={estilos.error}>{errores.consentimiento}</p>}

        <button className="boton boton--principal" type="submit" disabled={estadoEnvio === "enviando"}>
          {estadoEnvio === "enviando" ? "Enviando pedido demo..." : "Enviar pedido demo"}
        </button>
      </form>

      {estadoEnvio === "error" && <p className={estilos.error}>{mensajeEnvio}</p>}

      <ResumenEnvioEncargoDemo
        estadoCanalDescripcion={estadoCanal.descripcion}
        estadoCanalDisponible={estadoCanal.disponible}
        canales={estadoCanal.canales}
        construirHrefCanal={obtenerEnlaceCanal}
        onIntentoCanal={registrarIntentoCanal}
        onCopiarResumen={copiarResumen}
        ctaSecundaria={estadoCanal.ctaSecundaria}
        mensajeCanal={mensajeCanal}
        mensajeCopia={mensajeCopia}
        resumen={resumen}
        estadoEnvio={estadoEnvio}
        pedidoCreado={pedidoCreado}
        productoSlug={productoSeleccionado?.slug}
      />
    </section>
  );
}
