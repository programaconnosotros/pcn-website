import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('herramientas'),
  description:
    'Herramientas que usamos a diario para programar mejor: editores, terminales, productividad y más, recomendadas por la comunidad.',
  openGraph: {
    title: 'Herramientas | programaConNosotros',
    description:
      'Herramientas que usamos a diario para programar mejor: editores, terminales, productividad y más, recomendadas por la comunidad.',
    url: `${SITE_URL}/herramientas`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herramientas | programaConNosotros',
    description:
      'Herramientas que usamos a diario para programar mejor: editores, terminales, productividad y más, recomendadas por la comunidad.',
  },
};

export default function HerramientasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
