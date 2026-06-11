import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Herramientas',
  description:
    'Herramientas que usamos a diario para programar mejor: editores, terminales, productividad y más, recomendadas por la comunidad.',
  openGraph: {
    title: 'Herramientas | programaConNosotros',
    description:
      'Herramientas que usamos a diario para programar mejor: editores, terminales, productividad y más, recomendadas por la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/herramientas`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herramientas | programaConNosotros',
    description:
      'Herramientas que usamos a diario para programar mejor: editores, terminales, productividad y más, recomendadas por la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default function HerramientasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
