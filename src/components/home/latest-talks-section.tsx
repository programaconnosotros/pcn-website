import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import { LatestTalksGrid } from './latest-talks-grid';
import { SectionHeader } from './section-header';

const LATEST_TALKS_COUNT = 4;

/** The newest talks given by community members, playable in place like on /charlas. */
export const LatestTalksSection = async () => {
  const talks = await fetchPublicTalks();

  if (talks.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Charlas"
        title={
          <>
            Últimas charlas <span className="text-pcnGreen">de la comunidad</span>
          </>
        }
        description="Charlas dadas por miembros de PCN, con grabaciones y diapositivas."
        action={{ label: 'Ver todas las charlas', href: '/charlas' }}
      />

      <LatestTalksGrid talks={talks.slice(0, LATEST_TALKS_COUNT)} total={talks.length} />
    </section>
  );
};
