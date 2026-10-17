import { SectionHeader } from '@/components/home/section-header';
import { VideoGrid } from '@/components/videos/video-grid';
import { getExternalTalks, getOtherVideos } from '@/lib/recommendations';

// Four fills two rows of two and, with the fourth hidden, one row of three (see `fillRows`).
const LATEST = 4;

/** The newest external talks and videos the community recommends, playable in place. */
export const RecommendedWatchSection = async () => {
  const [externalTalks, otherVideos] = await Promise.all([getExternalTalks(), getOtherVideos()]);
  return (
    <section className="flex flex-col gap-10">
      <div>
        <SectionHeader
          eyebrow="charlas externas"
          title="Últimas charlas recomendadas"
          description="Charlas de conferencias de todo el mundo que vale la pena ver."
          action={{ label: 'Ver todas', href: '/charlas?tab=externas' }}
        />
        <VideoGrid videos={externalTalks.slice(0, LATEST)} toolbar={false} fillRows />
      </div>

      <div>
        <SectionHeader
          eyebrow="videos"
          title="Últimos videos recomendados"
          description="Tutoriales y explicaciones para seguir aprendiendo a tu ritmo."
          action={{ label: 'Ver todos', href: '/videos' }}
        />
        <VideoGrid videos={otherVideos.slice(0, LATEST)} toolbar={false} fillRows />
      </div>
    </section>
  );
};
