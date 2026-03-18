import { ResumenImportacion } from "@/infraestructura/api/backoffice";

const TARJETAS: Array<{ clave: keyof ResumenImportacion; etiqueta: string }> = [
  { clave: "total", etiqueta: "Total filas" },
  { clave: "seleccionadas", etiqueta: "Seleccionadas" },
  { clave: "validas", etiqueta: "Válidas" },
  { clave: "warnings", etiqueta: "Warnings" },
  { clave: "invalidas", etiqueta: "Inválidas" },
  { clave: "confirmadas", etiqueta: "Confirmadas" },
  { clave: "descartadas", etiqueta: "Descartadas" },
  { clave: "con_imagen", etiqueta: "Con imagen" },
];

export function ResumenImportacionAdmin({ resumen }: { resumen: ResumenImportacion }): JSX.Element {
  return (
    <div className="admin-tarjetas" aria-label="Resumen del lote de importación">
      {TARJETAS.map((tarjeta) => (
        <article key={tarjeta.clave} className="admin-card">
          <h3>{tarjeta.etiqueta}</h3>
          <p>{String(resumen[tarjeta.clave])}</p>
        </article>
      ))}
    </div>
  );
}
