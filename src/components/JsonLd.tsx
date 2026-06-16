type JsonLdValue = Record<string, unknown>;

interface JsonLdProps {
  data: JsonLdValue | JsonLdValue[];
}

/** Renders schema.org JSON-LD structured data for search engines. */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
