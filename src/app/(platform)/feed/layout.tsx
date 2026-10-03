import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Lo que pasa en la comunidad de programaConNosotros: eventos, charlas, fotos, proyectos y conversaciones.';

export const metadata: Metadata = {
  title: 'tail -f ~/feed',
  description,
  openGraph: {
    title: 'Feed | programaConNosotros',
    description,
    url: `${SITE_URL}/feed`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feed | programaConNosotros',
    description,
  },
};

const FeedLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default FeedLayout;
