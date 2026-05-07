import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Software recomendado',
  description:
    'Software que la comunidad recomienda: herramientas, apps y servicios probados por miembros de programaConNosotros.',
  openGraph: {
    title: 'Software recomendado | programaConNosotros',
    description:
      'Software que la comunidad recomienda: herramientas, apps y servicios probados por miembros de programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/software-recomendado`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software recomendado | programaConNosotros',
    description:
      'Software que la comunidad recomienda: herramientas, apps y servicios probados por miembros de programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const SoftwareRecomendadoLayout = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default SoftwareRecomendadoLayout;
