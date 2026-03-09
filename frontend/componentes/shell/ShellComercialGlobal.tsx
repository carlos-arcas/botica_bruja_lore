import estilos from './shellComercial.module.css';
import { CabeceraComercialGlobal } from './CabeceraComercialGlobal';
import { PieComercialGlobal } from './PieComercialGlobal';

type Props = {
  children: React.ReactNode;
};

export function ShellComercialGlobal({ children }: Props): JSX.Element {
  return (
    <div className={estilos.shell}>
      <a href="#contenido-principal" className={estilos.skipLink}>
        Saltar al contenido principal
      </a>
      <CabeceraComercialGlobal />
      <div id="contenido-principal" className={estilos.contenido}>
        {children}
      </div>
      <PieComercialGlobal />
    </div>
  );
}
