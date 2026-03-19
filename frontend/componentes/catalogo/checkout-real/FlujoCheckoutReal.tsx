"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PRODUCTOS_CATALOGO } from "@/contenido/catalogo/catalogo";
import { resolverContextoPreseleccionado } from "@/contenido/catalogo/encargoConsulta";
import {
  construirEstadoInicialCheckoutReal,
  construirLineasPedidoReal,
  construirPayloadPedidoReal,
  validarCheckoutReal,
} from "@/contenido/catalogo/checkoutReal";
import { crearPedidoPublico } from "@/infraestructura/api/pedidos";

import estilos from "./flujoCheckoutReal.module.css";

type Props = {
  slugPreseleccionado?: string;
  cestaPreseleccionada?: string;
};

export function FlujoCheckoutReal({ slugPreseleccionado, cestaPreseleccionada }: Props): JSX.Element {
  const contexto = resolverContextoPreseleccionado(slugPreseleccionado ?? null, cestaPreseleccionada ?? null);
  const [datos, setDatos] = useState(() => construirEstadoInicialCheckoutReal(contexto.productoPreseleccionado?.slug));
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();
  const producto = useMemo(() => PRODUCTOS_CATALOGO.find((item) => item.slug === datos.producto_slug) ?? null, [datos.producto_slug]);

  const enviar = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const lineas = construirLineasPedidoReal(contexto.itemsPreseleccionados, datos.producto_slug, datos.cantidad);
    const nuevosErrores = validarCheckoutReal(datos, lineas);
    setErrores(nuevosErrores);
    setMensaje("");
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }
    setEnviando(true);
    const resultado = await crearPedidoPublico(construirPayloadPedidoReal(datos, lineas));
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
      <p>Este flujo crea un <strong>Pedido</strong> real en estado <strong>pendiente_pago</strong>. No activa PSP ni reutiliza la sesión demo legacy.</p>
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
          <label>
            Producto
            <select value={datos.producto_slug} onChange={(event) => setDatos((previo) => ({ ...previo, producto_slug: event.target.value }))}>
              <option value="">Selecciona una pieza</option>
              {PRODUCTOS_CATALOGO.map((item) => <option key={item.id} value={item.slug}>{item.nombre}</option>)}
            </select>
          </label>
          {errores.producto_slug && <p className={estilos.error}>{errores.producto_slug}</p>}
          <Campo nombre="cantidad" etiqueta="Cantidad" valor={datos.cantidad} onChange={setDatos} />
          <label>
            Notas del cliente
            <textarea value={datos.notas_cliente} onChange={(event) => setDatos((previo) => ({ ...previo, notas_cliente: event.target.value }))} rows={3} />
          </label>
          {producto && <p className={estilos.resumenProducto}>{producto.nombre} · {producto.precioVisible}</p>}
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
  onChange: React.Dispatch<React.SetStateAction<any>>;
  error?: string;
  tipo?: "text" | "email" | "tel";
};

function Campo({ nombre, etiqueta, valor, onChange, error, tipo = "text" }: CampoProps): JSX.Element {
  return (
    <>
      <label>
        {etiqueta}
        <input type={tipo} value={valor} onChange={(event) => onChange((previo: Record<string, string>) => ({ ...previo, [nombre]: event.target.value }))} />
      </label>
      {error && <p className={estilos.error}>{error}</p>}
    </>
  );
}
