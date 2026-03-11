import type { Metadata } from "next";

import { ExploradorTarot } from "@/componentes/tarot/ExploradorTarot";
import { METADATA_TAROT } from "@/contenido/tarot/arcanosTarot";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_TAROT.title,
  description: METADATA_TAROT.description,
  rutaCanonical: "/tarot",
});

export default function PaginaTarot(): JSX.Element {
  return <ExploradorTarot />;
}
