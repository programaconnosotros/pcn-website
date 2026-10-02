import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Lectura',
  description:
    'Artículos y libros recomendados para leer sobre ingeniería de software. Llevá registro de lo que vas leyendo y marcá lo que te interesa leer.',
  openGraph: {
    title: 'Lectura | programaConNosotros',
    description:
      'Artículos y libros recomendados para leer sobre ingeniería de software. Llevá registro de lo que vas leyendo y marcá lo que te interesa leer.',
    url: `${SITE_URL}/lectura`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lectura | programaConNosotros',
    description:
      'Artículos y libros recomendados para leer sobre ingeniería de software. Llevá registro de lo que vas leyendo y marcá lo que te interesa leer.',
  },
};

export default function LecturaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
