"use client";

import Link from "next/link";
import { useState } from "react";

import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";
import {
  resolverEstadoRecuperacionPorCodigo,
  resolverMensajeEstadoRecuperacion,
  validarPasswordRecuperacion,
} from "@/contenido/cuenta_cliente/recuperacionPassword";
import { confirmarRecuperacionPassword, solicitarRecuperacionPassword } from "@/infraestructura/api/cuentasCliente";

type Props = { token?: string | null };

export function FormularioRecuperacionPassword({ token = "" }: Props): JSX.Element {
  const tokenRecuperacion = token ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState(resolverMensajeEstadoRecuperacion("solicitud"));
  const [estado, setEstado] = useState<"reposo" | "cargando" | "exito">("reposo");

  const enviarSolicitud = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setEstado("cargando");
    const resultado = await solicitarRecuperacionPassword({ email });
    setEstado(resultado.estado === "ok" ? "exito" : "reposo");
    setMensaje(resultado.mensaje);
  };

  const confirmar = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const error = validarPasswordRecuperacion(password, confirmacion);
    if (error) {
      setMensaje(error);
      return;
    }
    setEstado("cargando");
    const resultado = await confirmarRecuperacionPassword({ token: tokenRecuperacion, password });
    if (resultado.estado === "error") {
      setEstado("reposo");
      setMensaje(resolverMensajeEstadoRecuperacion(resolverEstadoRecuperacionPorCodigo(resultado.codigo)) || resultado.mensaje);
      return;
    }
    setEstado("exito");
    setMensaje(resolverMensajeEstadoRecuperacion("exito"));
    setPassword("");
    setConfirmacion("");
  };

  return (
    <section className="bloque-home">
      <p>Recuperación de contraseña</p>
      <h1>{tokenRecuperacion ? "Crear nueva contraseña" : "Recuperar contraseña"}</h1>
      <p>{mensaje}</p>
      {tokenRecuperacion ? (
        <form onSubmit={confirmar} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
          <label>
            Nueva contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>
            Repite la nueva contraseña
            <input type="password" value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} />
          </label>
          <button className="boton boton--principal" type="submit" disabled={estado === "cargando"}>
            {estado === "cargando" ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      ) : (
        <form onSubmit={enviarSolicitud} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
          <label>
            Email de tu cuenta
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button className="boton boton--principal" type="submit" disabled={estado === "cargando"}>
            {estado === "cargando" ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>
      )}
      <p>
        <Link href={RUTAS_CUENTA_CLIENTE.acceso}>Volver a acceso</Link>
      </p>
    </section>
  );
}
