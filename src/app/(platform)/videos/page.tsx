import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { VideoGrid } from '@/components/videos/video-grid';
import { videos } from '@/components/videos/videos';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Videos y charlas que la comunidad recomienda para aprender ingeniería de software: arquitectura, IA, frontend, backend y más.';

export const metadata: Metadata = {
  title: 'Videos',
  description,
  openGraph: {
    title: 'Videos | programaConNosotros',
    description,
    url: `${SITE_URL}/videos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Videos | programaConNosotros',
    description,
  },
};

const VideosPage = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <div className="mb-14 mt-4">
      <StickyHeader>
        <PageTitle path="videos" meta={`${videos.length} videos recomendados por la comunidad`} />
      </StickyHeader>
      <VideoGrid videos={videos} searchable />
    </div>
  </div>
);

export default VideosPage;
