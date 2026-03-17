import type { Metadata } from "next";

import { DebugLogViewer } from "@/componentes/debug/DebugLogViewer";

export const metadata: Metadata = {
  title: "Debug logs | Interno",
  robots: { index: false, follow: false },
};

export default function DebugLogsPage(): JSX.Element {
  return <DebugLogViewer />;
}
