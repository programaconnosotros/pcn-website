import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Los últimos cambios de la plataforma de programaConNosotros y quién de la comunidad los hizo.';

export const metadata: Metadata = {
  title: 'git log',
  description,
  openGraph: {
    title: 'Changelog | programaConNosotros',
    description,
    url: `${SITE_URL}/changelog`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog | programaConNosotros',
    description,
  },
};

const ChangelogLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default ChangelogLayout;
