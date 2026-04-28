"use client";

import { useEffect } from "react";

import { emitirEventoEmbudoLocal } from "@/contenido/analitica/embudoLocal";

type Props = {
  idProducto?: string;
  slugProducto: string;
};

export function EventoVistaProducto({ idProducto, slugProducto }: Props): null {
  useEffect(() => {
    emitirEventoEmbudoLocal("producto_visto", {
      id_producto: idProducto,
      slug_producto: slugProducto,
      ruta: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [idProducto, slugProducto]);

  return null;
}
