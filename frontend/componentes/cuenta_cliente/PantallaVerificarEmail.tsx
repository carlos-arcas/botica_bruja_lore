"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { confirmarVerificacionEmail } from "@/infraestructura/api/cuentasCliente";
import { resolverMensajeConfirmacion, ResultadoConfirmacionToken } from "@/contenido/cuenta_cliente/verificacionEmail";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";

export function PantallaVerificarEmail(): JSX.Element {
  const searchParams = useSearchParams();
  const [estado, setEstado] = useState<ResultadoConfirmacionToken>("error");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token")?.trim() ?? "";
    if (!token) {
      setEstado("token_invalido");
      setCargando(false);
      return;
    }
    void confirmar(token);
  }, [searchParams]);

  const confirmar = async (token: string): Promise<void> => {
    const resultado = await confirmarVerificacionEmail({ token });
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
      <p>Cuenta real v1.1</p>
      <h1>Verificación de email</h1>
      <p>{cargando ? "Comprobando enlace de verificación..." : resolverMensajeConfirmacion(estado)}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="boton boton--principal" href={RUTAS_CUENTA_CLIENTE.cuenta}>Ir a mi cuenta</Link>
        <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.acceso}>Ir a acceso</Link>
      </div>
    </section>
  );
}
