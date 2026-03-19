"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginCuentaCliente, registrarCuentaCliente } from "@/infraestructura/api/cuentasCliente";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";

type Props = { modo: "registro" | "acceso" };

export function FormularioCuentaCliente({ modo }: Props): JSX.Element {
  const [email, setEmail] = useState("");
  const [nombreVisible, setNombreVisible] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const enviar = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const resultado = modo === "registro"
      ? await registrarCuentaCliente({ email, nombre_visible: nombreVisible, password })
      : await loginCuentaCliente({ email, password });
    if (resultado.estado === "error") {
      setMensaje(resultado.mensaje);
      return;
    }
    router.push(RUTAS_CUENTA_CLIENTE.cuenta);
    router.refresh();
  };

  return (
    <section className="bloque-home">
      <p>{modo === "registro" ? "Cuenta real v1" : "Acceso cliente real"}</p>
      <h1>{modo === "registro" ? "Crear cuenta real" : "Entrar en mi cuenta"}</h1>
      <form onSubmit={enviar} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        {modo === "registro" && (
          <label>
            Nombre visible
            <input value={nombreVisible} onChange={(event) => setNombreVisible(event.target.value)} />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="boton boton--principal" type="submit">{modo === "registro" ? "Crear cuenta" : "Entrar"}</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </section>
  );
}
