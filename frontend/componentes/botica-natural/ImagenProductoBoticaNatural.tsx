import Image from "next/image";

type Props = {
  alt: string;
  className: string;
  src?: string;
  sizes: string;
  prioridad?: boolean;
  variante?: "card" | "ficha";
};

const ANCHO_REFERENCIA = 1200;
const ALTO_REFERENCIA = 825;

function renderizarFallback(className: string): JSX.Element {
  return <div className={`${className} botica-natural__imagen--fallback`} aria-hidden="true" />;
}

export function ImagenProductoBoticaNatural({
  alt,
  className,
  prioridad = false,
  sizes,
  src,
  variante = "card",
}: Props): JSX.Element {
  if (!src) {
    return renderizarFallback(className);
  }

  if (variante === "ficha") {
    return (
      <Image
        src={src}
        alt={alt}
        loader={({ src: origen }) => origen}
        unoptimized
        width={ANCHO_REFERENCIA}
        height={ALTO_REFERENCIA}
        sizes={sizes}
        priority={prioridad}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      loader={({ src: origen }) => origen}
      unoptimized
      fill
      sizes={sizes}
      priority={prioridad}
      className={className}
    />
  );
}
