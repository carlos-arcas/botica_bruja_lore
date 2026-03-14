import Link from "next/link";

import { obtenerEnlacesAdminVisibles } from "@/componentes/admin/enlacesAdmin";

const BLOQUES = obtenerEnlacesAdminVisibles("tarjetas");

export default function AdminHomePage(): JSX.Element {
  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Dashboard</p>
      <div className="admin-resumen">
        <h2>Estado general</h2>
        <p>Métricas detalladas en preparación por módulo. La base de navegación está activa.</p>
      </div>
      <div className="admin-tarjetas">
        {BLOQUES.map((bloque) => (
          <article key={bloque.href} className="admin-card">
            <h3>{bloque.etiqueta}</h3>
            <p>{bloque.descripcion}</p>
            <Link href={bloque.href}>Abrir módulo</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
