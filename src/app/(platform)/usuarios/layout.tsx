import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Usuarios (PCN)',
  description: 'Conocé a los miembros de programaConNosotros.',
  openGraph: {
    title: 'Usuarios (PCN)',
    description: 'Conocé a los miembros de programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/usuarios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Usuarios (PCN)',
    description: 'Conocé a los miembros de programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

