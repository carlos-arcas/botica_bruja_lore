type Props = {
  id: string;
  data: Record<string, unknown> | Record<string, unknown>[];
};

function serializarJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ id, data }: Props): JSX.Element {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializarJsonLd(data) }}
    />
  );
}
