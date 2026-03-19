"use client";

import Link from "next/link";

import { CuentaDemo } from "@/infraestructura/api/cuentasDemo";
import { CanalCheckoutDemo } from "@/contenido/catalogo/checkoutDemo";

import estilos from "./flujoEncargoConsulta.module.css";

type Props = {
  canalActivo: CanalCheckoutDemo;
  cuentaDemo: CuentaDemo | null;
  onContinuarComoInvitado: () => void;
  onUsarCuentaDemo: () => void;
};

export function BloqueIdentificacionCheckoutDemo({
  canalActivo,
  cuentaDemo,
  onContinuarComoInvitado,
  onUsarCuentaDemo,
}: Props): JSX.Element {
  if (cuentaDemo && canalActivo === "autenticado") {
    return (
      <article className={estilos.resumenProducto} aria-live="polite">
        <h2>Identificación del pedido demo</h2>
        <p><strong>Estás comprando como {cuentaDemo.nombre_visible}</strong>.</p>
        <p>{cuentaDemo.email}</p>
        <p>Asociaremos el pedido demo a esta cuenta sin pedirte el ID manualmente.</p>
        <div className={estilos.ctasResumen}>
          <button type="button" className="boton boton--secundario" onClick={onContinuarComoInvitado}>
            Continuar como invitado
          </button>
          <Link href="/cuenta-demo" className="boton boton--secundario">Gestionar cuenta demo</Link>
        </div>
      </article>
    );
  }

  return (
    <article className={estilos.resumenProducto} aria-live="polite">
      <h2>Identificación del pedido demo</h2>
      <p>Ahora mismo estás en modo invitado. Puedes seguir así o entrar/crear una cuenta demo para reducir fricción.</p>
      <div className={estilos.ctasResumen}>
        <button type="button" className="boton boton--principal" onClick={onContinuarComoInvitado}>
          Continuar como invitado
        </button>
        {cuentaDemo ? (
          <button type="button" className="boton boton--secundario" onClick={onUsarCuentaDemo}>
            Usar cuenta demo activa
          </button>
        ) : (
          <Link href="/cuenta-demo?returnTo=%2Fencargo" className="boton boton--secundario">
            Entrar / crear cuenta demo
          </Link>
        )}
      </div>
    </article>
  );
}
