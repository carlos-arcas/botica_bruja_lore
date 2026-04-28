import { CamposCuentaDemo } from "@/contenido/cuenta_demo/estadoCuentaDemo";

import estilos from "./areaCuentaDemo.module.css";

type FormularioCuentaDemoProps = {
  campos: CamposCuentaDemo;
  cargando: boolean;
  onActualizarCampo: (campo: keyof CamposCuentaDemo, valor: string) => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
};

export function FormularioRegistroDemo({ campos, cargando, onActualizarCampo, onSubmit }: FormularioCuentaDemoProps): JSX.Element {
  return (
    <form className={estilos.panel} onSubmit={onSubmit} noValidate>
      <h2>Crear cuenta</h2>
      <CampoTexto etiqueta="Email" value={campos.email} onChange={(valor) => onActualizarCampo("email", valor)} type="email" />
      <CampoTexto etiqueta="Nombre visible" value={campos.nombre_visible} onChange={(valor) => onActualizarCampo("nombre_visible", valor)} />
      <CampoTexto etiqueta="Clave de acceso" value={campos.clave_acceso_demo} onChange={(valor) => onActualizarCampo("clave_acceso_demo", valor)} type="password" />
      <button className="boton boton--principal" type="submit" disabled={cargando}>Crear cuenta</button>
    </form>
  );
}

export function FormularioAccesoDemo({ campos, cargando, onActualizarCampo, onSubmit }: FormularioCuentaDemoProps): JSX.Element {
  return (
    <form className={estilos.panel} onSubmit={onSubmit} noValidate>
      <h2>Acceso</h2>
      <CampoTexto etiqueta="Email" value={campos.email} onChange={(valor) => onActualizarCampo("email", valor)} type="email" />
      <CampoTexto etiqueta="Clave de acceso" value={campos.clave_acceso_demo} onChange={(valor) => onActualizarCampo("clave_acceso_demo", valor)} type="password" />
      <button className="boton boton--secundario" type="submit" disabled={cargando}>Entrar</button>
    </form>
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
