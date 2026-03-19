import { esRutaInternaSeguraParaReturnTo } from "../catalogo/estadoCheckoutDemo";

const RUTA_CUENTA_DEMO = "/cuenta-demo";

export function resolverRetornoCuentaDemo(returnTo: string | null | undefined): string | null {
  if (!esRutaInternaSeguraParaReturnTo(returnTo) || returnTo === RUTA_CUENTA_DEMO) {
    return null;
  }

  return returnTo;
}
