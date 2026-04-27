"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BotonGoogleCuentaCliente } from "@/componentes/cuenta_cliente/BotonGoogleCuentaCliente";
import { resolverMensajePostRegistro } from "@/contenido/cuenta_cliente/verificacionEmail";
import {
  construirRutaOnboardingEnvioCuenta,
  RUTAS_CUENTA_CLIENTE,
} from "@/contenido/cuenta_cliente/rutasCuentaCliente";
import { loginCuentaCliente, registrarCuentaCliente } from "@/infraestructura/api/cuentasCliente";

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
    irADestinoPostAutenticacion({
      modo,
      router,
      esNuevaCuentaGoogle: false,
      origenGoogle: false,
    });
    router.refresh();
  };

  return (
    <section className="bloque-home">
      <p>{modo === "registro" ? "Cuenta real v1.2" : "Acceso cliente real v1.2"}</p>
      <h1>{modo === "registro" ? "Crear cuenta real" : "Entrar en mi cuenta"}</h1>
      <p>
        {modo === "registro"
          ? "Empiezas con nombre, email y contraseña. Justo después puedes completar tus datos de envío o dejarlo para más tarde."
          : "Puedes entrar con tu contraseña o continuar con Google sobre la misma cuenta real."}
      </p>
      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <BotonGoogleCuentaCliente
          modo={modo}
          onError={setMensaje}
          onExito={({ es_nueva_cuenta }) => {
            irADestinoPostAutenticacion({
              modo,
              router,
              esNuevaCuentaGoogle: es_nueva_cuenta,
              origenGoogle: true,
            });
            router.refresh();
          }}
        />
        <p>o usa tu email</p>
      </div>
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
        {modo === "acceso" && <Link href={RUTAS_CUENTA_CLIENTE.recuperarPassword}>¿Has olvidado tu contraseña?</Link>}
        {mensaje && <p>{mensaje}</p>}
      </form>
    </section>
  );
}

function irADestinoPostAutenticacion({
  modo,
  router,
  esNuevaCuentaGoogle,
  origenGoogle,
}: {
  modo: "registro" | "acceso";
  router: ReturnType<typeof useRouter>;
  esNuevaCuentaGoogle: boolean;
  origenGoogle: boolean;
}): void {
  if (modo !== "registro") {
    router.push(RUTAS_CUENTA_CLIENTE.cuenta);
    return;
  }
  if (origenGoogle && !esNuevaCuentaGoogle) {
    router.push(RUTAS_CUENTA_CLIENTE.cuenta);
    return;
  }
  const mensaje = origenGoogle
    ? "Cuenta preparada con Google. Completa ahora tus datos de envío si quieres."
    : resolverMensajePostRegistro();
  router.push(construirRutaOnboardingEnvioCuenta(mensaje));
}
