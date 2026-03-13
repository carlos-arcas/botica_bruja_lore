import Link from "next/link";

const BLOQUES = [
  { href: "/admin/productos", titulo: "Productos", descripcion: "Catálogo comercial, publicación y orden." },
  { href: "/admin/rituales", titulo: "Rituales", descripcion: "Rutas rituales y relaciones con plantas." },
  { href: "/admin/editorial", titulo: "Editorial", descripcion: "Artículos, hubs y contenidos públicos." },
  { href: "/admin/importacion", titulo: "Importación masiva", descripcion: "Entrada operativa para cargas bulk." },
  { href: "/admin/secciones", titulo: "Secciones públicas", descripcion: "Gestión de secciones visibles del sitio." },
  { href: "/admin/imagenes", titulo: "Imágenes pendientes", descripcion: "Control de activos visuales pendientes." },
  { href: "/admin/ajustes", titulo: "Ajustes", descripcion: "Parámetros de operación y accesos." },
];

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
            <h3>{bloque.titulo}</h3>
            <p>{bloque.descripcion}</p>
            <Link href={bloque.href}>Abrir módulo</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
