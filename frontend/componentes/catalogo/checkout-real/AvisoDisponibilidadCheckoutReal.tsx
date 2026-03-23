"use client";

import { useEffect, useState } from "react";

import { EstadoDisponibilidadProducto } from "@/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto";
import { obtenerDetalleProductoPublico, type ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  slugProducto: string;
};

type EstadoAviso =
  | { tipo: "cargando" }
  | { tipo: "sin_cobertura" }
  | { tipo: "ok"; producto: ProductoSeccionPublica };

export function AvisoDisponibilidadCheckoutReal({ slugProducto }: Props): JSX.Element | null {
  const [estado, setEstado] = useState<EstadoAviso>({ tipo: "cargando" });

  useEffect(() => {
    let activa = true;
    const cargar = async (): Promise<void> => {
      if (!slugProducto.trim()) {
        setEstado({ tipo: "sin_cobertura" });
        return;
      }
      const resultado = await obtenerDetalleProductoPublico(slugProducto);
      if (!activa) return;
      if (resultado.estado !== "ok") {
        setEstado({ tipo: "sin_cobertura" });
        return;
      }
      setEstado({ tipo: "ok", producto: resultado.producto });
    };
    void cargar();
    return () => { activa = false; };
  }, [slugProducto]);

  if (estado.tipo === "cargando") return <p>Comprobando disponibilidad pública mínima…</p>;
  if (estado.tipo === "sin_cobertura") return <p>Este checkout no tiene disponibilidad pública previa para esta referencia; el backend validará stock al crear el pedido y no existe reserva temporal.</p>;
  return (
    <div>
      <EstadoDisponibilidadProducto producto={estado.producto} />
      <p>Este aviso es informativo y no bloquea por sí solo la compra: el backend sigue siendo la última línea de defensa.</p>
    </div>
  );
}
