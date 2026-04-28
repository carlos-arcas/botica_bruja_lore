"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { confirmarVerificacionEmail } from "@/infraestructura/api/cuentasCliente";
import { resolverMensajeConfirmacion, ResultadoConfirmacionToken } from "@/contenido/cuenta_cliente/verificacionEmail";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";

type Props = { token?: string | null };

export function PantallaVerificarEmail({ token = null }: Props): JSX.Element {
  const [estado, setEstado] = useState<ResultadoConfirmacionToken>("error");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenNormalizado = token?.trim() ?? "";
    if (!tokenNormalizado) {
      setEstado("token_invalido");
      setCargando(false);
      return;
    }
    void confirmar(tokenNormalizado);
  }, [token]);

  const confirmar = async (tokenConfirmacion: string): Promise<void> => {
    const resultado = await confirmarVerificacionEmail({ token: tokenConfirmacion });
    if (resultado.estado === "ok") {
      setEstado("exito");
      setCargando(false);
      return;
    }
    const mensaje = resultado.mensaje.toLowerCase();
    if (mensaje.includes("expirado")) setEstado("token_expirado");
    else if (mensaje.includes("válido")) setEstado("token_invalido");
    else setEstado("error");
    setCargando(false);
  };

  return (
    <section className="bloque-home">
      <p>Mi cuenta</p>
      <h1>Verificación de email</h1>
      <p>{cargando ? "Comprobando enlace de verificación..." : resolverMensajeConfirmacion(estado)}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="boton boton--principal" href={RUTAS_CUENTA_CLIENTE.cuenta}>Ir a mi cuenta</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.acceso}>Ir a acceso</Link>
      </div>
    </section>
  );
}
