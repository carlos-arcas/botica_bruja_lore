"use client";

import { useRouter } from "next/navigation";

export function BotonLogoutBackoffice(): JSX.Element {
  const router = useRouter();

  async function logout() {
    await fetch("/api/backoffice/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout}>
      Cerrar sesión
    </button>
  );
}
