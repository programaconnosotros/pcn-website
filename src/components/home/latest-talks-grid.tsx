'use client';

import { TalkCell, TalkMediaDialogs, type TalkWithEvent } from '@/components/talks/community-talks';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { useState } from 'react';

interface LatestTalksGridProps {
  talks: TalkWithEvent[];
  /** How many talks there are in total, so each keeps the same #number it has on /charlas. */
  total: number;
}

export const LatestTalksGrid = ({ talks, total }: LatestTalksGridProps) => {
  const [playing, setPlaying] = useState<TalkWithEvent | null>(null);
  const [slides, setSlides] = useState<TalkWithEvent | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4">
        {talks.map((talk, i) => (
          <TalkCell
            key={talk.id}
            talk={talk}
            index={total - i}
            isAdmin={false}
            onPlay={() => setPlaying(talk)}
            onSlides={() => setSlides(talk)}
          />
        ))}
      </RuledGrid>

      <TalkMediaDialogs
        playing={playing}
        slides={slides}
        onClosePlaying={() => setPlaying(null)}
        onCloseSlides={() => setSlides(null)}
      />
    </>
  );
};
