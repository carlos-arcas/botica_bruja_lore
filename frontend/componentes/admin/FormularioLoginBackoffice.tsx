"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type EstadoDiagnostico = {
  csrf: string;
  login: string;
  status: string;
};

type RespuestaAuth = {
  autenticado?: boolean;
  authenticated?: boolean;
  reason_code?: string;
};

const DIAGNOSTICO_INICIAL: EstadoDiagnostico = {
  csrf: "pendiente",
  login: "pendiente",
  status: "pendiente",
};

function debugAuthHabilitado(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";
}

function construirLineaEstado(etiqueta: string, detalle: string): string {
  return `${etiqueta}: ${detalle}`;
}

export function FormularioLoginBackoffice(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextDestino = searchParams.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [diagnostico, setDiagnostico] = useState<EstadoDiagnostico>(DIAGNOSTICO_INICIAL);

  const authDebugActivo = useMemo(debugAuthHabilitado, []);

  async function manejarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCargando(true);
    setError("");

    if (authDebugActivo) {
      setDiagnostico(DIAGNOSTICO_INICIAL);

      const respuestaCsrf = await fetch("/api/auth/csrf", { method: "GET", cache: "no-store" });
      setDiagnostico((previo) => ({
        ...previo,
        csrf: construirLineaEstado(respuestaCsrf.ok ? "ok" : "err", `status ${respuestaCsrf.status}`),
      }));
    }

    const respuestaLogin = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const cuerpoLogin = (await respuestaLogin.json().catch(() => ({}))) as RespuestaAuth;
    if (authDebugActivo) {
      const reasonCode = cuerpoLogin.reason_code ? ` · reason_code ${cuerpoLogin.reason_code}` : "";
      setDiagnostico((previo) => ({
        ...previo,
        login: construirLineaEstado(
          respuestaLogin.ok ? "ok" : "err",
          `status ${respuestaLogin.status}${reasonCode}`,
        ),
      }));
    }

    if (!respuestaLogin.ok) {
      setError("Usuario o contraseña inválidos.");
      setCargando(false);
      return;
    }

    if (authDebugActivo) {
      const respuestaStatus = await fetch("/api/auth/status", { method: "GET", cache: "no-store" });
      const cuerpoStatus = (await respuestaStatus.json().catch(() => ({}))) as RespuestaAuth;
      const authenticated = cuerpoStatus.authenticated ?? cuerpoStatus.autenticado ?? false;
      setDiagnostico((previo) => ({
        ...previo,
        status: construirLineaEstado(respuestaStatus.ok ? "ok" : "err", `authenticated ${String(authenticated)}`),
      }));
    }

    router.push(nextDestino);
    router.refresh();
  }

  return (
    <form className="admin-login-form" onSubmit={manejarSubmit}>
      <label htmlFor="usuario">Usuario</label>
      <input id="usuario" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error ? <p className="admin-estado admin-estado--error">{error}</p> : null}
      {authDebugActivo ? (
        <section className="admin-estado" aria-label="Panel de diagnóstico de auth">
          <p><strong>Auth debug</strong></p>
          <p>{diagnostico.csrf}</p>
          <p>{diagnostico.login}</p>
          <p>{diagnostico.status}</p>
        </section>
      ) : null}
      <button type="submit" className="admin-boton admin-boton--primario" disabled={cargando}>
        {cargando ? "Validando..." : "Entrar al backoffice"}
      </button>
    </form>
  );
}
