"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

import { continuarConGoogleCuentaCliente } from "@/infraestructura/api/cuentasCliente";

type Props = {
  modo: "registro" | "acceso";
  onExito: (resultado: { es_nueva_cuenta: boolean }) => void;
  onError: (mensaje: string) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          cancel?: () => void;
        };
      };
    };
  }
}

export function BotonGoogleCuentaCliente({ modo, onExito, onError }: Props): JSX.Element | null {
  const clientId = useMemo(() => (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim(), []);
  const [sdkLista, setSdkLista] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setSdkLista(true);
    }
  }, []);

  useEffect(() => {
    if (!sdkLista || !clientId || !contenedorRef.current || !window.google?.accounts?.id) {
      return;
    }
    const googleIdentity = window.google.accounts.id;
    contenedorRef.current.innerHTML = "";
    googleIdentity.initialize({
      client_id: clientId,
      context: modo === "registro" ? "signup" : "signin",
      callback: async (response: { credential?: string }) => {
        const credential = response.credential?.trim() ?? "";
        if (!credential) {
          onError("Google no devolvió una credencial válida.");
          return;
        }
        setProcesando(true);
        const resultado = await continuarConGoogleCuentaCliente({ credential });
        setProcesando(false);
        if (resultado.estado === "error") {
          onError(resultado.mensaje);
          return;
        }
        onExito({ es_nueva_cuenta: resultado.es_nueva_cuenta });
      },
    });
    googleIdentity.renderButton(contenedorRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: 320,
    });
    return () => {
      window.google?.accounts?.id?.cancel?.();
    };
  }, [clientId, modo, onError, onExito, sdkLista]);

  if (!clientId) {
    return null;
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setSdkLista(true)} />
      <div style={{ display: "grid", gap: 8 }}>
        <div ref={contenedorRef} />
        {procesando && <p>Validando acceso con Google...</p>}
      </div>
    </>
  );
}
