import { ListadoProductosSeccionComercial } from "@/componentes/catalogo/secciones/ListadoProductosSeccionComercial";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoSeccionPublica[];
};

export function ListadoProductosBoticaNatural({ productos }: Props): JSX.Element {
  return <ListadoProductosSeccionComercial productos={productos} />;
}
