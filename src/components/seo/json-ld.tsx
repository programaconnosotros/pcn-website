// Structured data (schema.org) for search engines, as a JSON-LD block. It's data, not a script the
// browser runs; `<` is escaped so text from members (a thread's title) can't close the tag.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const serializeJsonLd = (data: object) =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

/** The community as the organization behind every page. */
export const organization = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'programaConNosotros',
  url: SITE_URL,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  sameAs: [
    'https://www.instagram.com/programa.con.nosotros/',
    'https://www.youtube.com/@programaconnosotros2689',
    'https://www.linkedin.com/company/programaconnosotros/',
    'https://github.com/programaconnosotros',
  ],
} as const;

/** The site itself, published by the community: for the root layout. */
export const website = {
  '@context': 'https://schema.org',
  '@graph': [
    organization,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'programaConNosotros',
      inLanguage: 'es',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};
