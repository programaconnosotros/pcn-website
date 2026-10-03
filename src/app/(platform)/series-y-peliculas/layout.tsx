import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('series-y-peliculas'),
  description:
    'Series y películas sobre ingeniería de software y cultura tech recomendadas por la comunidad. Desde Silicon Valley hasta The Social Network.',
  openGraph: {
    title: 'Series y Películas | programaConNosotros',
    description:
      'Series y películas sobre ingeniería de software y cultura tech recomendadas por la comunidad. Desde Silicon Valley hasta The Social Network.',
    url: `${SITE_URL}/series-y-peliculas`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Series y Películas | programaConNosotros',
    description:
      'Series y películas sobre ingeniería de software y cultura tech recomendadas por la comunidad. Desde Silicon Valley hasta The Social Network.',
  },
};

export default function SeriesYPeliculasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
