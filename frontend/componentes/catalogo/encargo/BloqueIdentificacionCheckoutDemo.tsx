"use client";

import { CuentaDemo } from "@/infraestructura/api/cuentasDemo";
import { CanalCheckoutDemo } from "@/contenido/catalogo/checkoutDemo";

import estilos from "./flujoEncargoConsulta.module.css";

type Props = {
  canalActivo: CanalCheckoutDemo;
  cuentaDemo: CuentaDemo | null;
  onContinuarComoInvitado: () => void;
  onIrCuentaDemo: () => void;
  onUsarCuentaDemo: () => void;
};

export function BloqueIdentificacionCheckoutDemo({
  canalActivo,
  cuentaDemo,
  onContinuarComoInvitado,
  onIrCuentaDemo,
  onUsarCuentaDemo,
}: Props): JSX.Element {
  if (cuentaDemo && canalActivo === "autenticado") {
    return (
      <article className={estilos.resumenProducto} aria-live="polite">
        <h2>Datos de contacto</h2>
        <p><strong>Continuaras como {cuentaDemo.nombre_visible}</strong>.</p>
        <p>{cuentaDemo.email}</p>
        <p>Asociaremos la solicitud a esta cuenta para que puedas retomarla.</p>
        <div className={estilos.ctasResumen}>
          <button type="button" className="boton boton--secundario" onClick={onContinuarComoInvitado}>
            Continuar como invitado
          </button>
          <button type="button" className="boton boton--secundario" onClick={onIrCuentaDemo}>
            Gestionar cuenta
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={estilos.resumenProducto} aria-live="polite">
      <h2>Datos de contacto</h2>
      <p>Ahora mismo estas en modo invitado. Puedes seguir asi o entrar en tu cuenta para completar datos con menos friccion.</p>
      <div className={estilos.ctasResumen}>
        <button type="button" className="boton boton--principal" onClick={onContinuarComoInvitado}>
          Continuar como invitado
        </button>
        {cuentaDemo ? (
          <button type="button" className="boton boton--secundario" onClick={onUsarCuentaDemo}>
            Usar cuenta activa
          </button>
        ) : (
          <button type="button" className="boton boton--secundario" onClick={onIrCuentaDemo}>
            Entrar / crear cuenta
          </button>
        )}
      </div>
    </article>
  );
}
