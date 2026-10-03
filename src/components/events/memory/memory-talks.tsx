'use client';

import { useState } from 'react';
import { TalkCell, TalkMediaDialogs, type TalkWithEvent } from '@/components/talks/community-talks';
import { RuledGrid } from '@/components/ui/ruled-grid';

/** The talks given at the event, in their running order, playable in place. */
export function MemoryTalks({ talks: eventTalks }: { talks: TalkWithEvent[] }) {
  // The event, its date and place are the page itself: the cells don't need to repeat them.
  const talks = eventTalks.map((talk) => ({ ...talk, event: null }));
  const [playing, setPlaying] = useState<TalkWithEvent | null>(null);
  const [slides, setSlides] = useState<TalkWithEvent | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {talks.map((talk, i) => (
          <TalkCell
            key={talk.id}
            talk={talk}
            index={i + 1}
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
}
