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

export type UseCestaRitual = {
  cesta: CestaRitual;
  totalUnidades: number;
  anadir: (slug: string) => void;
  eliminar: (slug: string) => void;
  cambiarCantidad: (slug: string, cantidad: number) => void;
  limpiar: () => void;
};

export function useCestaRitual(): UseCestaRitual {
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

  const anadir = useCallback((slug: string): void => {
    persistir(agregarProducto(cesta, slug));
  }, [cesta, persistir]);

  const eliminar = useCallback((slug: string): void => {
    persistir(quitarProducto(cesta, slug));
  }, [cesta, persistir]);

  const cambiarCantidad = useCallback((slug: string, cantidad: number): void => {
    persistir(actualizarCantidad(cesta, slug, cantidad));
  }, [cesta, persistir]);

  const limpiar = useCallback((): void => {
    limpiarCestaRitualLocal();
    setCesta(vaciarCesta());
  }, []);

  const totalUnidades = useMemo(() => contarUnidades(cesta), [cesta]);

  return { cesta, totalUnidades, anadir, eliminar, cambiarCantidad, limpiar };
}
