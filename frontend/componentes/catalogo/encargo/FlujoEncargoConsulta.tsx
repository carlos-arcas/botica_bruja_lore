"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  construirPayloadPedidoDemo,
  construirResultadoLineasPedidoDemo,
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
import { guardarPedidoRecienteDemo } from "@/contenido/cuenta_demo/pedidoRecienteDemo";
import { construirRutaReciboPedidoDemo } from "@/contenido/catalogo/postCheckoutDemo";
import { leerCestaRitualLocal } from "@/infraestructura/catalogo/almacenCestaRitual";
import {
  convertirCestaALineasSeleccion,
  convertirCestaAItemsEncargo,
  crearCestaVacia,
} from "@/contenido/catalogo/cestaRitual";
import {
  construirResumenHumanoSeleccion,
  resolverResumenEconomicoSeleccion,
} from "@/contenido/catalogo/seleccionEncargo";
import {
  ItemListaLineasSeleccion,
  ListaLineasSeleccion,
} from "@/componentes/catalogo/seleccion/ListaLineasSeleccion";
import {
  crearPedidoDemoPublico,
  PedidoDemoCreado,
} from "@/infraestructura/api/pedidosDemo";

import { BloqueIdentificacionCheckoutDemo } from "./BloqueIdentificacionCheckoutDemo";
import { ResumenEnvioEncargoDemo } from "./ResumenEnvioEncargoDemo";
import estilos from "./flujoEncargoConsulta.module.css";

type Props = {
  slugPreseleccionado?: string;
  cestaPreseleccionada?: string;
  origenPreseleccionado?: string;
};

const RUTA_CUENTA_DEMO_RETORNO = "/encargo";

export function FlujoEncargoConsulta({
  slugPreseleccionado,
  cestaPreseleccionada,
  origenPreseleccionado,
}: Props): JSX.Element {
  const router = useRouter();
  const [cestaLocal, setCestaLocal] = useState(() => crearCestaVacia());
  const contexto = useMemo(
    () =>
      resolverContextoPreseleccionado(
        slugPreseleccionado ?? null,
        cestaPreseleccionada ?? null,
        origenPreseleccionado ?? null,
      ),
    [cestaPreseleccionada, origenPreseleccionado, slugPreseleccionado],
  );
  const lineasSeleccion = useMemo(
    () =>
      contexto.modo === "seleccion"
        ? convertirCestaALineasSeleccion(
            contexto.itemsPreseleccionados.length > 0
              ? {
                  lineas: contexto.itemsPreseleccionados.map((item) => ({
                    ...item,
                    actualizadoEn: new Date().toISOString(),
                  })),
                }
              : cestaLocal,
          )
        : [],
    [contexto, cestaLocal],
  );
  const itemsSeleccionados = useMemo(
    () =>
      contexto.itemsPreseleccionados.length > 0
        ? contexto.itemsPreseleccionados
        : convertirCestaAItemsEncargo(cestaLocal),
    [contexto.itemsPreseleccionados, cestaLocal],
  );
  const resumenSeleccion = useMemo(
    () => construirResumenHumanoSeleccion(lineasSeleccion),
    [lineasSeleccion],
  );
  const resumenEconomico = useMemo(
    () => resolverResumenEconomicoSeleccion(lineasSeleccion),
    [lineasSeleccion],
  );
  const [datos, setDatos] = useState<DatosConsulta>(() =>
    construirEstadoInicialConsulta(contexto, lineasSeleccion),
  );
  const resultadoLineasDemo = useMemo(
    () =>
      construirResultadoLineasPedidoDemo(
        itemsSeleccionados,
        datos.productoSlug,
        datos.cantidad,
      ),
    [datos.cantidad, datos.productoSlug, itemsSeleccionados],
  );
  const lineasNoConvertiblesDemo = resultadoLineasDemo.lineasNoConvertibles;
  const itemsSeleccionVisual = useMemo<ItemListaLineasSeleccion[]>(
    () =>
      lineasSeleccion.map((linea) => {
        const lineaBloqueada = lineasNoConvertiblesDemo.find(
          (item) => item.id_linea === linea.id_linea,
        );

        return {
          linea,
          estado: lineaBloqueada
            ? {
                etiqueta: "Línea bloqueada para pedido demo",
                descripcion: lineaBloqueada.motivo,
                tono: "bloqueada",
              }
            : {
                etiqueta: "Lista para revisión de encargo",
                descripcion:
                  "La línea conserva contexto rico y se revisará antes de confirmar el pedido demo.",
                tono: "convertible",
              },
        };
      }),
    [lineasNoConvertiblesDemo, lineasSeleccion],
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [resumen, setResumen] = useState("");
  const [mensajeCopia, setMensajeCopia] = useState("");
  const [mensajeCanal, setMensajeCanal] = useState("");
  const [mensajeConsultaManual, setMensajeConsultaManual] = useState("");
  const [cuentaDemoActiva, setCuentaDemoActiva] = useState(() =>
    leerSesionCuentaDemo(),
  );
  const [continuarComoInvitado, setContinuarComoInvitado] = useState(
    () => !leerSesionCuentaDemo(),
  );
  const [estadoEnvio, setEstadoEnvio] = useState<
    "idle" | "enviando" | "error" | "ok"
  >("idle");
  const [mensajeEnvio, setMensajeEnvio] = useState("");
  const [pedidoCreado, setPedidoCreado] = useState<PedidoDemoCreado | null>(
    null,
  );
  const configuracionCanal = useMemo(
    () => obtenerConfiguracionContactoPublico(),
    [],
  );
  const estadoCanal = useMemo(
    () => resolverEstadoCanalContacto(configuracionCanal),
    [configuracionCanal],
  );
  const estadoIdentificacion = useMemo(
    () =>
      resolverEstadoIdentificacionCheckoutDemo(
        cuentaDemoActiva,
        continuarComoInvitado,
      ),
    [continuarComoInvitado, cuentaDemoActiva],
  );
  const productoSeleccionado = useMemo(
    () =>
      PRODUCTOS_CATALOGO.find(
        (producto) => producto.slug === datos.productoSlug,
      ) ?? null,
    [datos.productoSlug],
  );
  const canalCheckout: CanalCheckoutDemo = estadoIdentificacion.canalActivo;

  useEffect(() => {
    if (
      origenPreseleccionado === "seleccion" &&
      contexto.itemsPreseleccionados.length === 0
    ) {
      setCestaLocal(leerCestaRitualLocal());
    }
  }, [contexto.itemsPreseleccionados.length, origenPreseleccionado]);

  useEffect(() => {
    const cuenta = leerSesionCuentaDemo();
    const borrador = leerBorradorCheckoutDemo();
    const inicial = construirEstadoInicialConsulta(contexto, lineasSeleccion);
    setCuentaDemoActiva(cuenta);
    setContinuarComoInvitado(
      resolverModoInvitadoInicial(cuenta, borrador?.continuarComoInvitado),
    );
    setDatos((previo) =>
      combinarDatosIniciales(
        borrador?.datos ?? inicial,
        previo,
        cuenta,
        contexto.modo,
        resumenSeleccion,
      ),
    );
  }, [contexto, lineasSeleccion, resumenSeleccion]);

  const actualizarCampo = (
    campo: keyof DatosConsulta,
    valor: string | boolean,
  ): void => setDatos((previo) => ({ ...previo, [campo]: valor }));

  const enviarConsulta = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const resultadoLineas = construirResultadoLineasPedidoDemo(
      itemsSeleccionados,
      datos.productoSlug,
      datos.cantidad,
    );
    const erroresConsulta = validarSolicitudConsulta(datos, contexto.modo);
    const erroresCheckout = validarCheckoutDemo(
      canalCheckout,
      estadoIdentificacion.cuentaActiva,
      resultadoLineas,
    );
    const resumenConsulta = construirResumenConsulta(
      datos,
      productoSeleccionado,
      contexto.modo,
      lineasSeleccion,
    );
    const nuevosErrores = {
      ...erroresConsulta,
      ...erroresCheckout,
    };
    limpiarMensajesPrevios(
      setMensajeCopia,
      setMensajeCanal,
      setMensajeConsultaManual,
      setMensajeEnvio,
      setPedidoCreado,
      setEstadoEnvio,
    );
    setErrores(nuevosErrores);
    if (Object.keys(erroresConsulta).length > 0) {
      setResumen("");
      guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
      return;
    }

    setResumen(resumenConsulta);
    if (Object.keys(erroresCheckout).length > 0) {
      setMensajeConsultaManual(
        "No podemos crear el pedido demo con esta selección, pero sí puedes enviarla como consulta artesanal usando el resumen y los canales disponibles aquí mismo.",
      );
      guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
      return;
    }

    setMensajeConsultaManual(
      "Si prefieres revisión artesanal en lugar de pedido demo, también puedes copiar este resumen o abrir un canal manual.",
    );
    setEstadoEnvio("enviando");
    const payload = construirPayloadPedidoDemo(
      datos.email,
      canalCheckout,
      resultadoLineas.lineasConvertibles,
      estadoIdentificacion.cuentaActiva,
    );
    const resultado = await crearPedidoDemoPublico(payload);

    if (resultado.estado === "error") {
      setEstadoEnvio("error");
      setMensajeEnvio(resultado.mensaje);
      guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
      return;
    }

    guardarPedidoRecienteDemo(
      resultado.pedido.id_pedido,
      estadoIdentificacion.cuentaActiva,
    );
    limpiarBorradorCheckoutDemo();
    setEstadoEnvio("ok");
    setPedidoCreado(resultado.pedido);
    router.push(construirRutaReciboPedidoDemo(resultado.pedido.id_pedido));
  };

  const copiarResumen = async (): Promise<void> => {
    if (!resumen) return;
    if (!navigator.clipboard) {
      setMensajeCopia(
        "Tu navegador no permite copiar automáticamente. Puedes copiar el texto manualmente.",
      );
      return;
    }
    await navigator.clipboard.writeText(resumen);
    setMensajeCopia(
      "Solicitud copiada. Ya puedes compartirla por tu canal habitual.",
    );
  };

  const obtenerEnlaceCanal = (tipo: TipoCanalContacto): string | null => {
    const canal = estadoCanal.canales.find((item) => item.tipo === tipo);
    return canal
      ? construirEnlaceCanal(canal, configuracionCanal, resumen)
      : null;
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-encargo">
      <p className={estilos.eyebrow}>Encargo ligero · consulta comercial</p>
      <h1 id="titulo-encargo">Preparar una solicitud artesanal</h1>
      <p>
        {contexto.modo === "seleccion"
          ? "Has llegado desde tu selección. Revisamos las líneas elegidas y tú editas solo tu intención real, sin arrastrar parches ni textos técnicos."
          : "Cuéntanos qué pieza te interesa y en qué contexto deseas usarla. Al final tendrás un texto listo para copiar o enviar por un canal real, si está configurado."}
      </p>

      {contexto.modo === "seleccion" ? (
        <article className={estilos.resumenProducto} aria-live="polite">
          <h2>Selección para encargo</h2>
          <p>
            Mantienes la revisión rica de cada línea antes de enviar el encargo,
            con imagen, formato, referencia orientativa y notas de origen.
          </p>
          <ListaLineasSeleccion items={itemsSeleccionVisual} />
          <div className={estilos.resumenEconomico}>
            <p>
              <strong>{resumenEconomico.etiqueta}:</strong>{" "}
              {resumenEconomico.totalVisible ?? "A revisar"}
            </p>
            <p>{resumenEconomico.detalle}</p>
          </div>
          {lineasNoConvertiblesDemo.length > 0 && (
            <div className={estilos.error} role="alert">
              <p>
                Esta selección no se enviará como pedido demo completo mientras
                existan líneas fuera de catálogo o no comprables.
              </p>
              <p>
                Mantén estas piezas como consulta artesanal o retíralas de tu
                selección antes de enviar el pedido demo.
              </p>
            </div>
          )}
        </article>
      ) : (
        <article className={estilos.resumenProducto} aria-live="polite">
          <h2>Producto seleccionado</h2>
          {productoSeleccionado ? (
            <>
              <p>
                <strong>{productoSeleccionado.nombre}</strong> ·{" "}
                {productoSeleccionado.precioVisible}
              </p>
              <p>{productoSeleccionado.subtitulo}</p>
            </>
          ) : (
            <p>
              No hay producto preseleccionado. Elige una pieza desde el
              formulario para continuar.
            </p>
          )}
        </article>
      )}

      <BloqueIdentificacionCheckoutDemo
        canalActivo={canalCheckout}
        cuentaDemo={cuentaDemoActiva}
        onContinuarComoInvitado={() => setContinuarComoInvitado(true)}
        onIrCuentaDemo={() => {
          guardarBorradorCheckoutDemo(datos, continuarComoInvitado);
          router.push(
            construirRutaCuentaDemoConRetornoSeguro(RUTA_CUENTA_DEMO_RETORNO),
          );
        }}
        onUsarCuentaDemo={() =>
          activarCuentaDemo(
            cuentaDemoActiva,
            setContinuarComoInvitado,
            setDatos,
          )
        }
      />

      <form className={estilos.formulario} onSubmit={enviarConsulta} noValidate>
        <CampoFormulario
          etiqueta="Nombre"
          name="nombre"
          value={datos.nombre}
          onChange={(valor) => actualizarCampo("nombre", valor)}
          error={errores.nombre}
        />
        <CampoFormulario
          etiqueta="Email"
          name="email"
          type="email"
          value={datos.email}
          onChange={(valor) => actualizarCampo("email", valor)}
          error={errores.email}
          errorId="error-contacto"
        />
        <CampoFormulario
          etiqueta="Teléfono (opcional si dejas email)"
          name="telefono"
          type="tel"
          value={datos.telefono}
          onChange={(valor) => actualizarCampo("telefono", valor)}
          error={errores.email}
          errorId="error-contacto"
        />
        <input
          type="hidden"
          name="canalCheckout"
          value={canalCheckout}
          readOnly
        />
        {errores.idUsuario && (
          <p id="error-id-usuario" className={estilos.error}>
            {errores.idUsuario}
          </p>
        )}

        {contexto.modo === "producto" && (
          <>
            <label>
              Producto de interés
              <select
                name="productoSlug"
                value={datos.productoSlug}
                onChange={(event) =>
                  actualizarCampo("productoSlug", event.target.value)
                }
                aria-invalid={Boolean(errores.productoSlug)}
                aria-describedby={
                  errores.productoSlug ? "error-producto" : undefined
                }
              >
                <option value="">Selecciona una pieza de la colección</option>
                {PRODUCTOS_CATALOGO.map((producto) => (
                  <option key={producto.id} value={producto.slug}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </label>
            {errores.productoSlug && (
              <p id="error-producto" className={estilos.error}>
                {errores.productoSlug}
              </p>
            )}
          </>
        )}
        {errores.lineas && <p className={estilos.error}>{errores.lineas}</p>}

        <CampoFormulario
          etiqueta={
            contexto.modo === "seleccion"
              ? "Cantidad o formato a concretar"
              : "Cantidad o formato deseado"
          }
          name="cantidad"
          value={datos.cantidad}
          onChange={(valor) => actualizarCampo("cantidad", valor)}
        />
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
        {errores.mensaje && (
          <p id="error-mensaje" className={estilos.error}>
            {errores.mensaje}
          </p>
        )}

        <label className={estilos.consentimiento}>
          <input
            type="checkbox"
            checked={datos.consentimiento}
            onChange={(event) =>
              actualizarCampo("consentimiento", event.target.checked)
            }
          />
          Acepto compartir estos datos para crear un pedido demo en esta
          experiencia sin cobro real.
        </label>
        {errores.consentimiento && (
          <p className={estilos.error}>{errores.consentimiento}</p>
        )}

        <button
          className="boton boton--principal"
          type="submit"
          disabled={estadoEnvio === "enviando"}
        >
          {estadoEnvio === "enviando"
            ? "Enviando pedido demo..."
            : "Enviar pedido demo"}
        </button>
      </form>

      <div className="hero-portada__acciones">
        <Link href="/colecciones" className="boton boton--secundario">
          Volver al catálogo
        </Link>
        {contexto.modo === "producto" && productoSeleccionado?.slug && (
          <Link
            href={`/colecciones/${productoSeleccionado.slug}`}
            className="boton boton--secundario"
          >
            Regresar a la ficha
          </Link>
        )}
        {contexto.modo === "seleccion" && (
          <Link href="/cesta" className="boton boton--secundario">
            Regresar a mi selección
          </Link>
        )}
      </div>

      {estadoEnvio === "error" && (
        <p className={estilos.error}>{mensajeEnvio}</p>
      )}
      <ResumenEnvioEncargoDemo
        estadoCanalDescripcion={estadoCanal.descripcion}
        estadoCanalDisponible={estadoCanal.disponible}
        canales={estadoCanal.canales}
        construirHrefCanal={obtenerEnlaceCanal}
        onIntentoCanal={(tipo) => {
          if (!obtenerEnlaceCanal(tipo))
            setMensajeCanal(
              "No se pudo abrir el canal porque faltan datos válidos de configuración o resumen.",
            );
        }}
        onCopiarResumen={copiarResumen}
        ctaSecundaria={estadoCanal.ctaSecundaria}
        mensajeCanal={mensajeCanal}
        mensajeCopia={mensajeCopia}
        mensajeConsultaManual={mensajeConsultaManual}
        resumen={resumen}
        estadoEnvio={estadoEnvio}
        pedidoCreado={pedidoCreado}
        productoSlug={productoSeleccionado?.slug}
      />
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

function CampoFormulario({
  etiqueta,
  name,
  value,
  onChange,
  error,
  errorId,
  type = "text",
}: CampoFormularioProps): JSX.Element {
  const idError = error ? (errorId ?? `error-${name}`) : undefined;
  return (
    <>
      <label>
        {etiqueta}
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={idError}
        />
      </label>
      {error && (
        <p id={idError} className={estilos.error}>
          {error}
        </p>
      )}
    </>
  );
}

function activarCuentaDemo(
  cuentaDemo: ReturnType<typeof leerSesionCuentaDemo>,
  setContinuarComoInvitado: (valor: boolean) => void,
  setDatos: (actualizador: (previo: DatosConsulta) => DatosConsulta) => void,
): void {
  setContinuarComoInvitado(false);
  if (cuentaDemo?.email)
    setDatos((previo) => ({
      ...previo,
      email: previo.email || cuentaDemo.email,
    }));
}

function combinarDatosIniciales(
  base: DatosConsulta,
  previo: DatosConsulta,
  cuentaDemo: ReturnType<typeof leerSesionCuentaDemo>,
  modo: "producto" | "seleccion",
  resumenSeleccion: string,
): DatosConsulta {
  return {
    ...base,
    nombre: base.nombre || cuentaDemo?.nombre_visible || previo.nombre,
    email: base.email || cuentaDemo?.email || previo.email,
    mensaje:
      modo === "seleccion"
        ? base.mensaje || resumenSeleccion
        : base.mensaje || previo.mensaje,
    consentimiento: false,
  };
}

function resolverModoInvitadoInicial(
  cuentaDemo: ReturnType<typeof leerSesionCuentaDemo>,
  continuarComoInvitado?: boolean,
): boolean {
  return cuentaDemo ? (continuarComoInvitado ?? false) : true;
}

function limpiarMensajesPrevios(
  setMensajeCopia: (valor: string) => void,
  setMensajeCanal: (valor: string) => void,
  setMensajeConsultaManual: (valor: string) => void,
  setMensajeEnvio: (valor: string) => void,
  setPedidoCreado: (valor: PedidoDemoCreado | null) => void,
  setEstadoEnvio: (valor: "idle" | "enviando" | "error" | "ok") => void,
): void {
  setMensajeCopia("");
  setMensajeCanal("");
  setMensajeConsultaManual("");
  setMensajeEnvio("");
  setPedidoCreado(null);
  setEstadoEnvio("idle");
}
