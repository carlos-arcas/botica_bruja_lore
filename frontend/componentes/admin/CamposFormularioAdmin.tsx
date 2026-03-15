"use client";

export type ConfigCampo = {
  clave: string;
  etiqueta: string;
  tipo?: "text" | "textarea" | "checkbox" | "select" | "precio";
  opciones?: { etiqueta: string; valor: string }[];
};

function normalizarPrecioEntrada(valor: string): string {
  return valor.replace(/[^\d.,]/g, "").replace(/,/g, ".");
}

function formatearPrecioVisible(valor: unknown): string {
  const limpio = normalizarPrecioEntrada(String(valor ?? ""));
  if (!limpio) return "";
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) ? numero.toFixed(2) : "";
}

export function CampoFormulario({ valor, campo, onCambio }: { valor: unknown; campo: ConfigCampo; onCambio: (valor: unknown) => void }): JSX.Element {
  if (campo.tipo === "checkbox") {
    return <input className="admin-checkbox" type="checkbox" checked={Boolean(valor)} onChange={(event) => onCambio(event.target.checked)} />;
  }
  if (campo.tipo === "textarea") {
    return <textarea className="admin-textarea" value={String(valor ?? "")} onChange={(event) => onCambio(event.target.value)} />;
  }
  if (campo.tipo === "select") {
    return (
      <select className="admin-select" value={String(valor ?? "")} onChange={(event) => onCambio(event.target.value)}>
        <option value="">Selecciona una opción</option>
        {(campo.opciones ?? []).map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    );
  }
  if (campo.tipo === "precio") {
    return (
      <div className="admin-input-precio">
        <span aria-hidden="true">€</span>
        <input
          inputMode="decimal"
          pattern="^[0-9]+([.,][0-9]{1,2})?$"
          value={normalizarPrecioEntrada(String(valor ?? ""))}
          onChange={(event) => onCambio(normalizarPrecioEntrada(event.target.value))}
          onBlur={() => onCambio(formatearPrecioVisible(valor))}
          aria-label="Precio visible en euros"
        />
      </div>
    );
  }
  return <input className="admin-input" value={String(valor ?? "")} onChange={(event) => onCambio(event.target.value)} />;
}
