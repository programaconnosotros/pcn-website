import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Galería',
  description:
    'Fotos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
  openGraph: {
    title: 'Galería | programaConNosotros',
    description:
      'Fotos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/galeria`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galería | programaConNosotros',
    description:
      'Fotos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
