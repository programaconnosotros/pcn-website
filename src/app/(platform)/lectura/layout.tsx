import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Club de lectura - PCN',
  description: 'Sumate al club de lectura sobre programación y tecnología',
  openGraph: {
    title: 'Club de lectura - PCN',
    description: 'Sumate al club de lectura sobre programación y tecnología',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/lectura`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Club de lectura - PCN',
    description: 'Sumate al club de lectura sobre programación y tecnología',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default function LecturaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
