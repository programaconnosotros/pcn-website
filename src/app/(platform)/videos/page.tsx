import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { VideoGrid } from '@/components/videos/video-grid';
import { videos } from '@/components/videos/videos';
import { tabTitle } from '@/lib/tab-title';
import { getIdentityMap } from '@/lib/identity-links';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Videos y charlas que la comunidad recomienda para aprender ingeniería de software: arquitectura, IA, frontend, backend y más.';

export const metadata: Metadata = {
  title: tabTitle.ls('videos'),
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

const VideosPage = async () => {
  // Speakers who are platform users, linked in /vinculos.
  const speakerProfiles = await getIdentityMap('videos');
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <StickyHeader>
          <PageTitle path="videos" meta={`${videos.length} videos recomendados por la comunidad`} />
        </StickyHeader>
        <VideoGrid videos={videos} searchable speakerProfiles={speakerProfiles} />
      </div>
    </div>
  );
};

export default VideosPage;
