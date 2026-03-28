"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCarrito } from "@/componentes/catalogo/cesta/useCarrito";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";
import {
  construirTextoContadorCesta,
  debeMostrarContadorCesta,
  ETIQUETA_ENLACE_ADMIN_CABECERA,
} from "@/contenido/shell/navegacionGlobal";
import { NOMBRE_COOKIE_CUENTA_CLIENTE } from "@/infraestructura/auth/configuracion";
import { obtenerSesionCuentaCliente } from "@/infraestructura/api/cuentasCliente";

import estilos from "./shellComercial.module.css";

type EstadoSesionCabecera = "anonima" | "autenticada";

export function AccesosCabecera(): JSX.Element {
  const rutaActual = usePathname();
  const { totalUnidades } = useCarrito();
  const [estadoSesion, setEstadoSesion] = useState<EstadoSesionCabecera>("anonima");

  useEffect(() => {
    let activa = true;

    async function cargarSesion(): Promise<void> {
      if (!document.cookie.includes(`${NOMBRE_COOKIE_CUENTA_CLIENTE}=`)) {
        if (activa) {
          setEstadoSesion("anonima");
        }
        return;
      }

      const sesion = await obtenerSesionCuentaCliente();
      if (!activa) {
        return;
      }

      setEstadoSesion(sesion.autenticado && sesion.cuenta ? "autenticada" : "anonima");
    }

    void cargarSesion();

    return () => {
      activa = false;
    };
  }, [rutaActual]);

  const cuentaHref =
    estadoSesion === "autenticada" ? RUTAS_CUENTA_CLIENTE.cuenta : RUTAS_CUENTA_CLIENTE.acceso;
  const cuentaEtiqueta = estadoSesion === "autenticada" ? "Mi cuenta" : "Login";
  const carritoActiva = rutaActual === "/cesta";
  const cuentaActiva =
    estadoSesion === "autenticada"
      ? rutaActual === RUTAS_CUENTA_CLIENTE.cuenta ||
        rutaActual.startsWith(`${RUTAS_CUENTA_CLIENTE.cuenta}/`)
      : rutaActual === RUTAS_CUENTA_CLIENTE.acceso ||
        rutaActual === RUTAS_CUENTA_CLIENTE.registro ||
        rutaActual === RUTAS_CUENTA_CLIENTE.recuperarPassword ||
        rutaActual === RUTAS_CUENTA_CLIENTE.verificarEmail;
  const adminActiva = rutaActual === "/admin" || rutaActual.startsWith("/admin/");
  const mostrarContador = debeMostrarContadorCesta(totalUnidades);

  return (
    <div className={estilos.accionesExternas}>
      <Link
        href="/cesta"
        className={`${estilos.accionCabecera} ${carritoActiva ? estilos.accionCabeceraActiva : ""}`.trim()}
        aria-current={carritoActiva ? "page" : undefined}
      >
        Carrito
        {mostrarContador ? (
          <span className={estilos.contadorAccion} aria-label={construirTextoContadorCesta(totalUnidades)}>
            {totalUnidades}
          </span>
        ) : null}
      </Link>
      <Link
        href={cuentaHref}
        className={`${estilos.accionCabecera} ${cuentaActiva ? estilos.accionCabeceraActiva : ""}`.trim()}
        aria-current={cuentaActiva ? "page" : undefined}
      >
        {cuentaEtiqueta}
      </Link>
      <Link
        href="/admin"
        className={`${estilos.accionCabecera} ${adminActiva ? estilos.accionCabeceraActiva : ""}`.trim()}
        aria-current={adminActiva ? "page" : undefined}
        aria-label="Abrir backoffice administrativo"
      >
        {ETIQUETA_ENLACE_ADMIN_CABECERA}
      </Link>
    </div>
  );
}
