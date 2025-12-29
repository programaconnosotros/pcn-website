import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Galería de fotos (PCN)',
  description:
    'Visitá nuestros recuerdos para conocer mejor a la comunidad, o bien recordar momentos vividos en conjunto',
  openGraph: {
    title: 'Galería de fotos (PCN)',
    description:
      'Visitá nuestros recuerdos para conocer mejor a la comunidad, o bien recordar momentos vividos en conjunto',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/galeria`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galería de fotos (PCN)',
    description:
      'Visitá nuestros recuerdos para conocer mejor a la comunidad, o bien recordar momentos vividos en conjunto',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
