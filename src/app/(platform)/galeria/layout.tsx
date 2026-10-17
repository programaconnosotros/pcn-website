import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('galeria'),
  description:
    'Fotos y videos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
  openGraph: {
    title: 'Galería | programaConNosotros',
    description:
      'Fotos y videos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
    url: `${SITE_URL}/galeria`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galería | programaConNosotros',
    description:
      'Fotos y videos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
  },
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
