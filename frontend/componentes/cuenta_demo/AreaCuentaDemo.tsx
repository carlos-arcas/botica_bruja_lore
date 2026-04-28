"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  PedidoDemoHistorial,
  PerfilCuentaDemo,
  autenticarCuentaDemo,
  obtenerHistorialCuentaDemo,
  obtenerPerfilCuentaDemo,
  registrarCuentaDemo,
} from "@/infraestructura/api/cuentasDemo";
import {
  CamposCuentaDemo,
  guardarSesionCuentaDemo,
  leerSesionCuentaDemo,
  limpiarSesionCuentaDemo,
  validarCamposAutenticacionDemo,
  validarCamposRegistroDemo,
} from "@/contenido/cuenta_demo/estadoCuentaDemo";
import { resolverRetornoCuentaDemo } from "@/contenido/cuenta_demo/retornoCuentaDemo";
import { FormularioAccesoDemo, FormularioRegistroDemo } from "@/componentes/cuenta_demo/FormulariosCuentaDemo";
import { HistorialPedidosDemo } from "@/componentes/cuenta_demo/HistorialPedidosDemo";
import {
  limpiarPedidoRecienteDemo,
  leerPedidoRecienteDemo,
  pedidoRecientePerteneceASesion,
} from "@/contenido/cuenta_demo/pedidoRecienteDemo";

import estilos from "./areaCuentaDemo.module.css";

const CAMPOS_INICIALES: CamposCuentaDemo = {
  email: "",
  nombre_visible: "",
  clave_acceso_demo: "",
};

type Props = {
  returnTo?: string | null;
};

type PedidoRecienteUI = {
  idPedido: string;
  disponibleEnHistorial: boolean;
};

export function AreaCuentaDemo({ returnTo }: Props): JSX.Element {
  const [campos, setCampos] = useState<CamposCuentaDemo>(CAMPOS_INICIALES);
  const [idUsuarioActivo, setIdUsuarioActivo] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilCuentaDemo | null>(null);
  const [historial, setHistorial] = useState<PedidoDemoHistorial[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [pedidoReciente, setPedidoReciente] = useState<PedidoRecienteUI | null>(null);
  const router = useRouter();
  const retornoSeguro = useMemo(() => resolverRetornoCuentaDemo(returnTo), [returnTo]);

  useEffect(() => {
    const cuenta = leerSesionCuentaDemo();
    if (cuenta) {
      setIdUsuarioActivo(cuenta.id_usuario);
      setMensaje(`Sesión restaurada para ${cuenta.nombre_visible}.`);
    }
  }, []);

  useEffect(() => {
    if (idUsuarioActivo) {
      void cargarCuenta(idUsuarioActivo, setCargando, setErrores, setPerfil, setHistorial);
    }
  }, [idUsuarioActivo]);

  useEffect(() => {
    const cuentaDemo = leerSesionCuentaDemo();
    const pedidoGuardado = leerPedidoRecienteDemo();
    if (!pedidoRecientePerteneceASesion(pedidoGuardado, cuentaDemo)) {
      if (pedidoGuardado) {
        limpiarPedidoRecienteDemo();
      }
      setPedidoReciente(null);
      return;
    }

    const disponibleEnHistorial = historial.some((pedido) => pedido.id_pedido === pedidoGuardado.idPedido);
    setPedidoReciente({ idPedido: pedidoGuardado.idPedido, disponibleEnHistorial });
    limpiarPedidoRecienteDemo();
  }, [historial]);

  const haySesion = useMemo(() => Boolean(idUsuarioActivo), [idUsuarioActivo]);
  const actualizarCampo = (campo: keyof CamposCuentaDemo, valor: string): void => {
    setCampos((previo) => ({ ...previo, [campo]: valor }));
  };

  const onRegistrar = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setMensaje(null);
    const erroresFormulario = validarCamposRegistroDemo(campos);
    setErrores(erroresFormulario);
    if (erroresFormulario.length) {
      return;
    }

    setCargando(true);
    const resultado = await registrarCuentaDemo(campos);
    setCargando(false);
    if (resultado.estado === "error") {
      setErrores([resultado.mensaje]);
      return;
    }

    guardarSesionCuentaDemo(resultado.cuenta);
    setIdUsuarioActivo(resultado.cuenta.id_usuario);
    setMensaje(mensajeAutenticacion(retornoSeguro, true));
    setErrores([]);
    navegarSiHayRetorno(router, retornoSeguro);
  };

  const onAutenticar = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setMensaje(null);
    const erroresFormulario = validarCamposAutenticacionDemo(campos);
    setErrores(erroresFormulario);
    if (erroresFormulario.length) {
      return;
    }

    setCargando(true);
    const resultado = await autenticarCuentaDemo({ email: campos.email, clave_acceso_demo: campos.clave_acceso_demo });
    setCargando(false);
    if (resultado.estado === "error") {
      setErrores([resultado.mensaje]);
      return;
    }

    guardarSesionCuentaDemo(resultado.cuenta);
    setIdUsuarioActivo(resultado.cuenta.id_usuario);
    setMensaje(mensajeAutenticacion(retornoSeguro, false));
    setErrores([]);
    navegarSiHayRetorno(router, retornoSeguro);
  };

  const onSalirDemo = (): void => {
    limpiarSesionCuentaDemo();
    limpiarPedidoRecienteDemo();
    setIdUsuarioActivo(null);
    setPerfil(null);
    setHistorial([]);
    setPedidoReciente(null);
    setMensaje("Sesión cerrada.");
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-cuenta-demo">
      <p className={estilos.eyebrow}>Área privada</p>
      <h1 id="titulo-cuenta-demo">Mi cuenta</h1>
      <p className={estilos.aviso}>No es autenticación productiva real: no usa sesión segura, cookies ni JWT.</p>
      {retornoSeguro && <p className={estilos.estado}>Al completar el acceso volverás automáticamente a tu checkout en {retornoSeguro}.</p>}

      <div className={estilos.rejilla}>
        <FormularioRegistroDemo campos={campos} cargando={cargando} onActualizarCampo={actualizarCampo} onSubmit={onRegistrar} />
        <FormularioAccesoDemo campos={campos} cargando={cargando} onActualizarCampo={actualizarCampo} onSubmit={onAutenticar} />
      </div>

      {cargando && <p className={estilos.estado}>Cargando área de cuenta...</p>}
      {mensaje && <p className={estilos.exito}>{mensaje}</p>}
      {errores.map((error) => <p key={error} className={estilos.error}>{error}</p>)}

      {haySesion && perfil && (
        <article className={estilos.panel}>
          <div className={estilos.cabeceraPanel}>
            <h2>Perfil</h2>
            <button type="button" className="boton boton--secundario" onClick={onSalirDemo}>Salir</button>
          </div>
          <p><strong>ID usuario:</strong> {perfil.id_usuario}</p>
          <p><strong>Email:</strong> {perfil.email}</p>
          <p><strong>Nombre visible:</strong> {perfil.nombre_visible}</p>

          <h3>Historial de pedidos</h3>
          <HistorialPedidosDemo historial={historial} pedidoReciente={pedidoReciente} />
        </article>
      )}
    </section>
  );
}

function mensajeAutenticacion(retornoSeguro: string | null, esRegistro: boolean): string {
  if (retornoSeguro) {
    return esRegistro ? "Cuenta creada. Volviendo a tu checkout." : "Acceso correcto. Volviendo a tu checkout.";
  }
  return esRegistro ? "Cuenta creada. Ya puedes consultar tu perfil e historial." : "Acceso correcto. Cargando tu área de cuenta.";
}

function navegarSiHayRetorno(router: ReturnType<typeof useRouter>, retornoSeguro: string | null): void {
  if (retornoSeguro) {
    router.push(retornoSeguro);
  }
}

async function cargarCuenta(
  idUsuario: string,
  setCargando: (valor: boolean) => void,
  setErrores: (errores: string[]) => void,
  setPerfil: (perfil: PerfilCuentaDemo | null) => void,
  setHistorial: (historial: PedidoDemoHistorial[]) => void,
): Promise<void> {
  setCargando(true);
  const [perfilResultado, historialResultado] = await Promise.all([
    obtenerPerfilCuentaDemo(idUsuario),
    obtenerHistorialCuentaDemo(idUsuario),
  ]);
  setCargando(false);

  if (perfilResultado.estado === "error") {
    setErrores([perfilResultado.mensaje]);
    return;
  }
  if (historialResultado.estado === "error") {
    setErrores([historialResultado.mensaje]);
    return;
  }

  setPerfil(perfilResultado.perfil);
  setHistorial(historialResultado.pedidos);
  setErrores([]);
}
