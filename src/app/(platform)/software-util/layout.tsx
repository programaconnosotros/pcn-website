import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Software útil (PCN)',
  description: 'Herramientas y software recomendado por la comunidad.',
  openGraph: {
    title: 'Software útil (PCN)',
    description: 'Herramientas y software recomendado por la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/software-util`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software útil (PCN)',
    description: 'Herramientas y software recomendado por la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default function SoftwareUtilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
