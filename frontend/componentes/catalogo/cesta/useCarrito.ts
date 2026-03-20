"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CestaRitual,
  actualizarCantidad,
  agregarProducto,
  contarUnidades,
  crearCestaVacia,
  quitarProducto,
  vaciarCesta,
} from "@/contenido/catalogo/cestaRitual";
import {
  EVENTO_CESTA_RITUAL,
  guardarCestaRitualLocal,
  leerCestaRitualLocal,
  limpiarCestaRitualLocal,
} from "@/infraestructura/catalogo/almacenCestaRitual";

export type UseCarrito = {
  cesta: CestaRitual;
  totalUnidades: number;
  agregarAlCarrito: (slug: string, cantidad?: number) => void;
  eliminar: (idLinea: string) => void;
  cambiarCantidad: (idLinea: string, cantidad: number) => void;
  limpiar: () => void;
};

export function useCarrito(): UseCarrito {
  const [cesta, setCesta] = useState<CestaRitual>(() => crearCestaVacia());

  useEffect(() => {
    const sincronizar = (): void => {
      setCesta(leerCestaRitualLocal());
    };

    sincronizar();
    window.addEventListener("storage", sincronizar);
    window.addEventListener(EVENTO_CESTA_RITUAL, sincronizar);

    return () => {
      window.removeEventListener("storage", sincronizar);
      window.removeEventListener(EVENTO_CESTA_RITUAL, sincronizar);
    };
  }, []);

  const persistir = useCallback((siguiente: CestaRitual): void => {
    guardarCestaRitualLocal(siguiente);
    setCesta(siguiente);
  }, []);

  const agregarAlCarrito = useCallback(
    (slug: string, cantidad?: number): void => {
      persistir(agregarProducto(cesta, slug, cantidad));
    },
    [cesta, persistir],
  );

  const eliminar = useCallback(
    (idLinea: string): void => {
      persistir(quitarProducto(cesta, idLinea));
    },
    [cesta, persistir],
  );

  const cambiarCantidad = useCallback(
    (idLinea: string, cantidad: number): void => {
      persistir(actualizarCantidad(cesta, idLinea, cantidad));
    },
    [cesta, persistir],
  );

  const limpiar = useCallback((): void => {
    limpiarCestaRitualLocal();
    setCesta(vaciarCesta());
  }, []);

  const totalUnidades = useMemo(() => contarUnidades(cesta), [cesta]);

  return {
    cesta,
    totalUnidades,
    agregarAlCarrito,
    eliminar,
    cambiarCantidad,
    limpiar,
  };
}
