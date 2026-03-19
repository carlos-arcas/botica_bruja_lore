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

import estilos from "./areaCuentaDemo.module.css";

const CAMPOS_INICIALES: CamposCuentaDemo = {
  email: "",
  nombre_visible: "",
  clave_acceso_demo: "",
};

type Props = {
  returnTo?: string | null;
};

export function AreaCuentaDemo({ returnTo }: Props): JSX.Element {
  const [campos, setCampos] = useState<CamposCuentaDemo>(CAMPOS_INICIALES);
  const [idUsuarioActivo, setIdUsuarioActivo] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilCuentaDemo | null>(null);
  const [historial, setHistorial] = useState<PedidoDemoHistorial[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const retornoSeguro = useMemo(() => resolverRetornoCuentaDemo(returnTo), [returnTo]);

  useEffect(() => {
    const cuenta = leerSesionCuentaDemo();
    if (cuenta) {
      setIdUsuarioActivo(cuenta.id_usuario);
      setMensaje(`Sesión demo restaurada para ${cuenta.nombre_visible}.`);
    }
  }, []);

  useEffect(() => {
    if (idUsuarioActivo) {
      void cargarCuenta(idUsuarioActivo, setCargando, setErrores, setPerfil, setHistorial);
    }
  }, [idUsuarioActivo]);

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
    setIdUsuarioActivo(null);
    setPerfil(null);
    setHistorial([]);
    setMensaje("Sesión demo cerrada.");
  };

  return (
    <section className="bloque-home" aria-labelledby="titulo-cuenta-demo">
      <p className={estilos.eyebrow}>Área privada mínima · entorno demo</p>
      <h1 id="titulo-cuenta-demo">Cuenta demo con continuidad post-checkout</h1>
      <p className={estilos.aviso}>No es autenticación productiva real: no usa sesión segura, cookies ni JWT.</p>
      {retornoSeguro && <p className={estilos.estado}>Al completar el acceso volverás automáticamente a tu checkout demo en {retornoSeguro}.</p>}

      <div className={estilos.rejilla}>
        <form className={estilos.panel} onSubmit={onRegistrar} noValidate>
          <h2>Registro demo</h2>
          <CampoTexto etiqueta="Email" value={campos.email} onChange={(valor) => actualizarCampo("email", valor)} type="email" />
          <CampoTexto etiqueta="Nombre visible" value={campos.nombre_visible} onChange={(valor) => actualizarCampo("nombre_visible", valor)} />
          <CampoTexto etiqueta="Clave demo" value={campos.clave_acceso_demo} onChange={(valor) => actualizarCampo("clave_acceso_demo", valor)} type="password" />
          <button className="boton boton--principal" type="submit" disabled={cargando}>Crear cuenta demo</button>
        </form>

        <form className={estilos.panel} onSubmit={onAutenticar} noValidate>
          <h2>Acceso demo</h2>
          <CampoTexto etiqueta="Email" value={campos.email} onChange={(valor) => actualizarCampo("email", valor)} type="email" />
          <CampoTexto etiqueta="Clave demo" value={campos.clave_acceso_demo} onChange={(valor) => actualizarCampo("clave_acceso_demo", valor)} type="password" />
          <button className="boton boton--secundario" type="submit" disabled={cargando}>Entrar con cuenta demo</button>
        </form>
      </div>

      {cargando && <p className={estilos.estado}>Cargando área de cuenta demo…</p>}
      {mensaje && <p className={estilos.exito}>{mensaje}</p>}
      {errores.map((error) => <p key={error} className={estilos.error}>{error}</p>)}

      {haySesion && perfil && (
        <article className={estilos.panel}>
          <div className={estilos.cabeceraPanel}>
            <h2>Perfil demo</h2>
            <button type="button" className="boton boton--secundario" onClick={onSalirDemo}>Salir demo</button>
          </div>
          <p><strong>ID usuario:</strong> {perfil.id_usuario}</p>
          <p><strong>Email:</strong> {perfil.email}</p>
          <p><strong>Nombre visible:</strong> {perfil.nombre_visible}</p>

          <h3>Historial de pedidos demo</h3>
          {historial.length === 0 ? (
            <p className={estilos.estado}>Aún no hay pedidos demo asociados a tu cuenta.</p>
          ) : (
            <ul className={estilos.historial}>
              {historial.map((pedido) => (
                <li key={pedido.id_pedido}>
                  <strong>{pedido.id_pedido}</strong> · {pedido.estado} · {pedido.resumen.cantidad_total_items} items · subtotal demo {pedido.resumen.subtotal_demo}
                </li>
              ))}
            </ul>
          )}
        </article>
      )}
    </section>
  );
}

type CampoTextoProps = {
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  type?: "text" | "email" | "password";
};

function CampoTexto({ etiqueta, value, onChange, type = "text" }: CampoTextoProps): JSX.Element {
  return (
    <label className={estilos.campo}>
      {etiqueta}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function mensajeAutenticacion(retornoSeguro: string | null, esRegistro: boolean): string {
  if (retornoSeguro) {
    return esRegistro ? "Cuenta demo creada. Volviendo a tu checkout demo." : "Acceso demo correcto. Volviendo a tu checkout demo.";
  }
  return esRegistro ? "Cuenta demo creada. Ya puedes consultar tu perfil e historial." : "Acceso demo correcto. Cargando tu área de cuenta.";
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
