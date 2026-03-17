import type { Metadata } from "next";

import { DebugLogViewer } from "@/componentes/debug/DebugLogViewer";
import { debugLogViewerHabilitado } from "@/infraestructura/configuracion/debugLogs";

export const metadata: Metadata = {
  title: "Debug logs | Interno",
  robots: { index: false, follow: false },
};

export default function DebugLogsPage(): JSX.Element {
  if (!debugLogViewerHabilitado()) {
    return <section className="admin-contenido"><p>Visor de logs deshabilitado.</p></section>;
  }
  return <DebugLogViewer />;
}
