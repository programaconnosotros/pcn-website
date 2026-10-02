import { PageTitle } from '@/components/ui/page-title';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Podcast',
  description:
    'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional. Episodios producidos por la comunidad.',
  openGraph: {
    title: 'Podcast | programaConNosotros',
    description:
      'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional. Episodios producidos por la comunidad.',
    url: `${SITE_URL}/podcast`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Podcast | programaConNosotros',
    description:
      'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional. Episodios producidos por la comunidad.',
  },
};

const PodcastPage = async () => {
  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <PageTitle path="podcast" className="mt-4" meta="0 episodios" />

        <p className="border border-pcnGreen-200 p-3 font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>
          próximamente...
        </p>
      </div>
    </>
  );
};

export default PodcastPage;
