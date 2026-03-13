"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function FormularioLoginBackoffice(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextDestino = searchParams.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCargando(true);
    setError("");

    const respuesta = await fetch("/api/backoffice/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!respuesta.ok) {
      setError("Usuario o contraseña inválidos.");
      setCargando(false);
      return;
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
      <button type="submit" disabled={cargando}>
        {cargando ? "Validando..." : "Entrar al backoffice"}
      </button>
    </form>
  );
}
