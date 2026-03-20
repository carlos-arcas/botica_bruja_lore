"use client";

import { CampoImagenAdmin } from "@/componentes/admin/CampoImagenAdmin";
import { SelectorProductosRelacionados } from "@/componentes/admin/SelectorProductosRelacionados";

export type ConfigCampo = {
  clave: string;
  etiqueta: string;
  tipo?: "text" | "textarea" | "checkbox" | "select" | "multi_select" | "precio" | "imagen" | "selector_productos";
  opciones?: { etiqueta: string; valor: string }[];
  ayuda?: string;
};

export type ControlImagenFormulario = {
  estado: "idle" | "subiendo" | "ok" | "error";
  mensaje: string;
  onSubirArchivo: (archivo: File) => void;
  onQuitarImagen: () => void;
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

function esCampoImagen(campo: ConfigCampo): boolean {
  return campo.tipo === "imagen" || campo.clave === "imagen_url";
}


function normalizarValoresMultiselect(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((it) => String(it));
  const texto = String(valor ?? "").trim();
  if (!texto) return [];
  return texto.split(",").map((it) => it.trim()).filter(Boolean);
}

export function CampoFormulario({ valor, campo, onCambio, controlImagen }: { valor: unknown; campo: ConfigCampo; onCambio: (valor: unknown) => void; controlImagen?: ControlImagenFormulario }): JSX.Element {
  if (campo.tipo === "checkbox") {
    return <input className="admin-checkbox" type="checkbox" checked={Boolean(valor)} onChange={(event) => onCambio(event.target.checked)} />;
  }
  if (esCampoImagen(campo) && controlImagen) {
    return (
      <CampoImagenAdmin
        etiqueta={campo.etiqueta}
        imagenUrl={String(valor ?? "")}
        estado={controlImagen.estado}
        mensaje={controlImagen.mensaje}
        onSubirArchivo={controlImagen.onSubirArchivo}
        onQuitarImagen={controlImagen.onQuitarImagen}
      />
    );
  }
  if (campo.tipo === "textarea") {
    return <textarea className="admin-textarea" value={String(valor ?? "")} onChange={(event) => onCambio(event.target.value)} />;
  }
  if (campo.tipo === "multi_select") {
    const valores = new Set(normalizarValoresMultiselect(valor));
    return (
      <select
        className="admin-select"
        multiple
        value={Array.from(valores)}
        onChange={(event) => {
          const seleccion = Array.from(event.target.selectedOptions).map((it) => it.value);
          onCambio(seleccion.join(","));
        }}
      >
        {(campo.opciones ?? []).map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    );
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

  if (campo.tipo === "selector_productos") {
    return <SelectorProductosRelacionados valor={valor} onCambio={(nuevoValor) => onCambio(nuevoValor)} opciones={campo.opciones ?? []} />;
  }
  if (campo.tipo === "precio") {
    return (
      <div className="admin-input-precio">
        <span aria-hidden="true">€</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
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
