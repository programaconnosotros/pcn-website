'use client';

import { useState } from 'react';
import { TalkCell, TalkMediaDialogs, type TalkWithEvent } from '@/components/talks/community-talks';
import { RuledGrid } from '@/components/ui/ruled-grid';

/** The talks someone gave, with the /charlas cell: big cover, whole title, video and slides in place. */
export const ProfileTalks = ({ talks }: { talks: TalkWithEvent[] }) => {
  const [playing, setPlaying] = useState<TalkWithEvent | null>(null);
  const [slides, setSlides] = useState<TalkWithEvent | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {talks.map((talk) => (
          <TalkCell
            key={talk.id}
            talk={talk}
            fullText
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
