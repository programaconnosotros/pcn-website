import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Conocé a las personas de programaConNosotros: co-founders, ambassadors, speakers y quienes organizan eventos.';

export const metadata: Metadata = {
  title: 'Miembros',
  description,
  openGraph: {
    title: 'Miembros | programaConNosotros',
    description,
    url: `${SITE_URL}/miembros`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miembros | programaConNosotros',
    description,
  },
};

const MiembrosLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default MiembrosLayout;
