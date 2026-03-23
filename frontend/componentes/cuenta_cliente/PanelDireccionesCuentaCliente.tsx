"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CuentaCliente,
  DireccionCuentaCliente,
  actualizarDireccionCuentaCliente,
  crearDireccionCuentaCliente,
  eliminarDireccionCuentaCliente,
  marcarDireccionPredeterminadaCuentaCliente,
  obtenerDireccionesCuentaCliente,
  obtenerSesionCuentaCliente,
} from "@/infraestructura/api/cuentasCliente";
import { construirFormularioDireccionVacio, descripcionEstadoVacioDirecciones, resumenDireccion } from "@/contenido/cuenta_cliente/direccionesCuentaCliente";
import { RUTAS_CUENTA_CLIENTE } from "@/contenido/cuenta_cliente/rutasCuentaCliente";

type ModoFormulario = { tipo: "crear" } | { tipo: "editar"; direccion: DireccionCuentaCliente };

export function PanelDireccionesCuentaCliente(): JSX.Element {
  const router = useRouter();
  const [cuenta, setCuenta] = useState<CuentaCliente | null>(null);
  const [direcciones, setDirecciones] = useState<DireccionCuentaCliente[]>([]);
  const [estado, setEstado] = useState("Cargando direcciones...");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [modo, setModo] = useState<ModoFormulario>({ tipo: "crear" });
  const [formulario, setFormulario] = useState(construirFormularioDireccionVacio());

  const cargar = useCallback(async (): Promise<void> => {
    const sesion = await obtenerSesionCuentaCliente();
    if (!sesion.autenticado || !sesion.cuenta) {
      router.push(RUTAS_CUENTA_CLIENTE.acceso);
      return;
    }
    setCuenta(sesion.cuenta);
    const resultado = await obtenerDireccionesCuentaCliente();
    setDirecciones(resultado.direcciones);
    setEstado("");
    setError(resultado.detalle ?? "");
  }, [router]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const onChange = (campo: keyof typeof formulario, valor: string): void => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const prepararEdicion = (direccion: DireccionCuentaCliente): void => {
    setModo({ tipo: "editar", direccion });
    setFormulario({
      alias: direccion.alias,
      nombre_destinatario: direccion.nombre_destinatario,
      telefono_contacto: direccion.telefono_contacto,
      linea_1: direccion.linea_1,
      linea_2: direccion.linea_2,
      codigo_postal: direccion.codigo_postal,
      ciudad: direccion.ciudad,
      provincia: direccion.provincia,
      pais_iso: direccion.pais_iso,
    });
    setError("");
    setExito("");
  };

  const resetFormulario = (): void => {
    setModo({ tipo: "crear" });
    setFormulario(construirFormularioDireccionVacio());
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setGuardando(true);
    setError("");
    setExito("");
    const payload = { ...formulario };
    const resultado = modo.tipo === "crear"
      ? await crearDireccionCuentaCliente(payload)
      : await actualizarDireccionCuentaCliente(modo.direccion.id_direccion, payload);
    setGuardando(false);
    if (resultado.estado === "error") {
      setError(resultado.mensaje);
      return;
    }
    await cargar();
    resetFormulario();
    setExito(modo.tipo === "crear" ? "Dirección guardada." : "Dirección actualizada.");
  };

  const eliminar = async (idDireccion: string): Promise<void> => {
    setError("");
    setExito("");
    const resultado = await eliminarDireccionCuentaCliente(idDireccion);
    if (resultado.estado === "error") {
      setError(resultado.mensaje);
      return;
    }
    await cargar();
    if (modo.tipo === "editar" && modo.direccion.id_direccion === idDireccion) resetFormulario();
    setExito("Dirección eliminada.");
  };

  const marcarPredeterminada = async (idDireccion: string): Promise<void> => {
    setError("");
    setExito("");
    const resultado = await marcarDireccionPredeterminadaCuentaCliente(idDireccion);
    if (resultado.estado === "error") {
      setError(resultado.mensaje);
      return;
    }
    await cargar();
    setExito("Dirección predeterminada actualizada.");
  };

  if (!cuenta) return <section className="bloque-home"><p>{estado}</p></section>;

  return (
    <section className="bloque-home" style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p>Cuenta real · libreta de direcciones v1.1</p>
          <h1>Mis direcciones</h1>
          <p>{cuenta.nombre_visible} · {cuenta.email}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="boton boton--secundario" href={RUTAS_CUENTA_CLIENTE.cuenta}>Volver a mi cuenta</Link>
          <button className="boton boton--secundario" type="button" onClick={resetFormulario}>Nueva dirección</button>
        </div>
      </div>

      {error && <p>{error}</p>}
      {exito && <p>{exito}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        <div style={{ border: "1px solid rgba(98, 74, 46, 0.18)", borderRadius: 16, padding: 16 }}>
          <h2>{modo.tipo === "crear" ? "Añadir dirección" : "Editar dirección"}</h2>
          <form style={{ display: "grid", gap: 12 }} onSubmit={guardar}>
            {camposFormulario().map((campo) => (
              <label key={campo.campo} style={{ display: "grid", gap: 4 }}>
                <span>{campo.etiqueta}</span>
                <input
                  value={formulario[campo.campo]}
                  onChange={(event) => onChange(campo.campo, event.target.value)}
                  placeholder={campo.placeholder}
                />
              </label>
            ))}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="boton boton--principal" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : modo.tipo === "crear" ? "Guardar dirección" : "Actualizar dirección"}
              </button>
              {modo.tipo === "editar" && <button className="boton boton--secundario" type="button" onClick={resetFormulario}>Cancelar edición</button>}
            </div>
          </form>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {direcciones.length === 0 ? (
            <article style={{ border: "1px dashed rgba(98, 74, 46, 0.28)", borderRadius: 16, padding: 16 }}>
              <h2>Sin direcciones guardadas</h2>
              <p>{descripcionEstadoVacioDirecciones()}</p>
            </article>
          ) : (
            direcciones.map((direccion) => (
              <article key={direccion.id_direccion} style={{ border: "1px solid rgba(98, 74, 46, 0.18)", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{direccion.alias || direccion.nombre_destinatario}</strong>
                  {direccion.predeterminada && <span>Predeterminada</span>}
                </div>
                <p>{direccion.nombre_destinatario} · {direccion.telefono_contacto}</p>
                <p>{resumenDireccion(direccion)}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="boton boton--secundario" type="button" onClick={() => prepararEdicion(direccion)}>Editar</button>
                  <button className="boton boton--secundario" type="button" onClick={() => eliminar(direccion.id_direccion)}>Eliminar</button>
                  {!direccion.predeterminada && <button className="boton boton--principal" type="button" onClick={() => marcarPredeterminada(direccion.id_direccion)}>Hacer predeterminada</button>}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function camposFormulario(): Array<{ campo: keyof ReturnType<typeof construirFormularioDireccionVacio>; etiqueta: string; placeholder: string }> {
  return [
    { campo: "alias", etiqueta: "Alias", placeholder: "Casa, trabajo..." },
    { campo: "nombre_destinatario", etiqueta: "Destinatario", placeholder: "Nombre y apellidos" },
    { campo: "telefono_contacto", etiqueta: "Teléfono", placeholder: "+34 600 000 000" },
    { campo: "linea_1", etiqueta: "Línea principal", placeholder: "Calle, número, piso" },
    { campo: "linea_2", etiqueta: "Línea secundaria", placeholder: "Escalera, puerta, referencias" },
    { campo: "codigo_postal", etiqueta: "Código postal", placeholder: "28013" },
    { campo: "ciudad", etiqueta: "Ciudad", placeholder: "Madrid" },
    { campo: "provincia", etiqueta: "Provincia", placeholder: "Madrid" },
    { campo: "pais_iso", etiqueta: "País ISO", placeholder: "ES" },
  ];
}
