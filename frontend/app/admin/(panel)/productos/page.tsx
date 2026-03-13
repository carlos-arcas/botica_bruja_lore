import Link from "next/link";
import { cookies } from "next/headers";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { obtenerProductosAdmin } from "@/infraestructura/api/backoffice";

type Props = { searchParams?: { [key: string]: string | string[] | undefined } };

function valorParam(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? valor[0] ?? "" : valor ?? "";
}

export default async function AdminProductosPage({ searchParams }: Props): Promise<JSX.Element> {
  const query = new URLSearchParams({
    q: valorParam(searchParams?.q),
    publicado: valorParam(searchParams?.publicado),
    seccion: valorParam(searchParams?.seccion),
    tipo: valorParam(searchParams?.tipo),
  });

  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerProductosAdmin(query, token);

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Productos</p>
      <div className="admin-resumen">
        <h2>Gestión de productos</h2>
        <form className="admin-filtros" method="get">
          <input name="q" placeholder="Buscar por nombre" defaultValue={query.get("q") ?? ""} />
          <input name="seccion" placeholder="Sección pública" defaultValue={query.get("seccion") ?? ""} />
          <input name="tipo" placeholder="Tipo de producto" defaultValue={query.get("tipo") ?? ""} />
          <select name="publicado" defaultValue={query.get("publicado") ?? ""}>
            <option value="">Todos</option>
            <option value="true">Publicados</option>
            <option value="false">Borrador</option>
          </select>
          <button type="submit">Filtrar</button>
          <a href="http://127.0.0.1:8000/admin/persistencia_django/productomodelo/add/">Crear producto</a>
        </form>
      </div>

      {resultado.estado === "error" && <p className="admin-estado admin-estado--error">{resultado.detalle}</p>}
      {resultado.estado === "denegado" && <p className="admin-estado admin-estado--error">{resultado.detalle}</p>}

      {resultado.estado === "ok" && (
        <>
          <p className="admin-kpi">
            Total: {resultado.metricas.total} · Publicados: {resultado.metricas.publicados} · Borrador: {resultado.metricas.borrador}
          </p>
          {resultado.productos.length === 0 ? (
            <p className="admin-estado">No hay productos con los filtros actuales.</p>
          ) : (
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Sección</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resultado.productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <strong>{producto.nombre}</strong>
                      <br />
                      <small>{producto.sku}</small>
                    </td>
                    <td>{producto.seccion_publica}</td>
                    <td>{producto.tipo_producto}</td>
                    <td>{producto.publicado ? "Publicado" : "Borrador"}</td>
                    <td>
                      <Link href={`http://127.0.0.1:8000/admin/persistencia_django/productomodelo/${producto.id}/change/`}>
                        Editar
                      </Link>
                      {" · "}
                      <Link href={`http://127.0.0.1:8000/admin/persistencia_django/productomodelo/${producto.id}/change/`}>
                        {producto.publicado ? "Despublicar" : "Publicar"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}
